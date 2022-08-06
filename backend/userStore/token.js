const { google } = require('googleapis');
require('dotenv').config();
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

async function getToken(authCode) {
    console.log("dwwdub got here")
    let { tokens } = await oauth2Client.getToken(authCode);
    console.log(tokens)
    return tokens.refresh_token;
}

module.exports = getToken;