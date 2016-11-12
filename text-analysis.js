var request = require('request');

var parseResponse = (err, res, body, callback) => {
    if (err) {
        console.error(err);
        return;
    }

    if (res.statusCode === 200) {
        var people = [];
        var money = [];
        var operation = null;
        var res = JSON.parse(body).response;

        // Search for the entities
        res.entities.forEach((entity) => {
            // TODO: take into consideration also confidenceScore? >= 0.5?

            if (entity.type.indexOf('Person') > -1) {
                people.push(entity.entityId);
            } else if (entity.type.indexOf('Money') > -1) {
                money.push({sum: entity.entityId, currency: entity.unit})
            }
        });

        // Search for words and their meaning
        res.entailments.forEach((word) => {
            // Only take into consideration if contextScore > 0.5
            if (word.contextScore >= 0.5) {
                var re = new RegExp(["transfer", "send", "give"].join('|'), 'i');
                if (re.test(word.entailedWords)) {
                    operation = 'SEND';
                }

                re = new RegExp(["receive", "get", "request", "ask"].join('|'), 'i');
                if (re.test(word.entailedWords)) {
                    operation = 'RECEIVE';
                }
            }
        });

        console.log(`
        The operation to do is: ${operation}.
        Sum & currency: ${money[0].sum} ${money[0].currency}.
        People involved: ${people}
        `);

        callback && callback(
            operation,
            money,
            people
        );
    }
};

module.exports = makeRequest;

var makeRequest = (text, callback) => {
    request.post({
        method: 'POST',
        url: 'http://api.textrazor.com',
        headers: {
            'X-TextRazor-Key': '086f88d52ddb4c9d6d5815e0f92033835f0371f1d09b1699faf161b2'
        },
        body: `text=${text}&extractors=entailments,entities`
    }, function (err, res, body) {
        return parseResponse(err, res, body, callback);
    });
};


// makeRequest('Transfer 100 $ to Vlad Nicula');
// makeRequest('Receive $10 from Anna and Bogdan');

// var responseExample = {
//     "response": {
//         "language": "eng",
//         "languageIsReliable": false,
//         "entities": [{
//             "id": 0,
//             "type": ["Person"],
//             "matchingTokens": [4, 5],
//             "entityId": "Vlad Nicula",
//             "freebaseTypes": ["/people/person"],
//             "confidenceScore": 0.5,
//             "wikiLink": "",
//             "matchedText": "Vlad Nicula",
//             "relevanceScore": 0,
//             "entityEnglishId": "",
//             "startingPos": 16,
//             "endingPos": 27
//         }, {
//             "id": 1,
//             "type": ["Money"],
//             "matchingTokens": [1, 2],
//             "entityId": "15",
//             "confidenceScore": 0.5,
//             "wikiLink": "",
//             "matchedText": "$15",
//             "relevanceScore": 0,
//             "entityEnglishId": "",
//             "startingPos": 9,
//             "endingPos": 12,
//             "unit": "$"
//         }],
//         "entailments": [{
//             "id": 0,
//             "wordPositions": [0],
//             "entailedWords": ["transfer"],
//             "entailedTree": {"word": "transfer"},
//             "priorScore": 1,
//             "contextScore": 1,
//             "score": 1
//         }, {
//             "id": 1,
//             "wordPositions": [0],
//             "entailedWords": ["succession"],
//             "entailedTree": {"word": "succession"},
//             "priorScore": 0.0007981,
//             "contextScore": 0.3091,
//             "score": 0.2396
//         }, {
//             "id": 2,
//             "wordPositions": [0],
//             "entailedWords": ["commit"],
//             "entailedTree": {"word": "commit"},
//             "priorScore": 0.003122,
//             "contextScore": 0.01999,
//             "score": 0.1704
//         }, {
//             "id": 3,
//             "wordPositions": [1],
//             "entailedWords": ["$"],
//             "entailedTree": {"word": "$"},
//             "priorScore": 1,
//             "contextScore": 1,
//             "score": 1
//         }]
//     }, "time": 0.004576, "ok": true
// };