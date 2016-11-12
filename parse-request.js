'use strict';

const parseRequest = (event) => {
    let response = {text: JSON.stringify(event)};
    const attachments = event.message.attachments;

    // Handle location
    if (attachments && attachments[0].payload.coordinates) {
        const ATMLocation = '46.771450,23.626898';
        const currentLocation = `${attachments[0].payload.coordinates.lat},${attachments[0].payload.coordinates.long}`;
        const directionsUrl = `http://www.google.com/maps/dir/${currentLocation}/${ATMLocation}`;

        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Directions to nearest ATM",
                        "image_url": "http:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center=${ATMLocation}&zoom=15&markers=${ATMLocation}",
                        "item_url": `http:\/\/maps.apple.com\/maps?q=${ATMLocation}&z=16`,
                        "buttons": [{
                            'type': 'web_url',
                            'url': directionsUrl,
                            'title': 'Get Directions'
                        }]
                    }]
                }
            }
        }
    }

    return response;
};

// const msg = {
//     "sender": {"id": "1221584201246326"},
//     "recipient": {"id": "219420141826392"},
//     "timestamp": 1478947564413,
//     "message": {
//         "mid": "mid.1478947564413:7c61f40102",
//         "seq": 1767,
//         "attachments": [{
//             "title": "Vlad's Location",
//             "url": "https://www.facebook.com/l.php?u=https%3A%2F%2Fwww.bing.com%2Fmaps%2Fdefault.aspx%3Fv%3D2%26pc%3DFACEBK%26mid%3D8100%26where1%3D46.776990109999%252C%2B23.628974370005%26FORM%3DFBKPL1%26mkt%3Den-US&h=gAQGRWHUc&s=1&enc=AZPYEOa25LSSNf6o3R_VW98f5CmBpV5HGYOdzOzGLjKhBaP23X7Q89Gq5BRpZrdj2DCu_eTNxLew-xW3zvF-N0Jt95-uGHjhmNeqnMPEFaQ9CA",
//             "type": "location",
//             "payload": {"coordinates": {"lat": 46.776990109999, "long": 23.628974370005}}
//         }]
//     }
// };

module.exports = parseRequest;