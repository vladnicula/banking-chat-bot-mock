const parseRequest = (event) => {
    let response = JSON.stringify(event);

    if (event.message.attachments && event.message.attachments[0].payload.coordinates) {
        const lat = event.message.attachments[0].payload.coordinates.lat;
        const long = event.message.attachments[0].payload.coordinates.long;

        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": {
                        "element": {
                            "title": "Your current location",
                            "image_url": "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center=" + lat + "," + long + "&zoom=25&markers=" + lat + "," + long,
                            "item_url": "http:\/\/maps.apple.com\/maps?q=" + lat + "," + long + "&z=16"
                        }
                    }
                }
            }
        };
    }

    return response;
};

const msg = {
    "sender": {"id": "1221584201246326"},
    "recipient": {"id": "219420141826392"},
    "timestamp": 1478947564413,
    "message": {
        "mid": "mid.1478947564413:7c61f40102",
        "seq": 1767,
        "attachments": [{
            "title": "Vlad's Location",
            "url": "https://www.facebook.com/l.php?u=https%3A%2F%2Fwww.bing.com%2Fmaps%2Fdefault.aspx%3Fv%3D2%26pc%3DFACEBK%26mid%3D8100%26where1%3D46.776990109999%252C%2B23.628974370005%26FORM%3DFBKPL1%26mkt%3Den-US&h=gAQGRWHUc&s=1&enc=AZPYEOa25LSSNf6o3R_VW98f5CmBpV5HGYOdzOzGLjKhBaP23X7Q89Gq5BRpZrdj2DCu_eTNxLew-xW3zvF-N0Jt95-uGHjhmNeqnMPEFaQ9CA",
            "type": "location",
            "payload": {"coordinates": {"lat": 46.776990109999, "long": 23.628974370005}}
        }]
    }
};

module.exports = parseRequest;