const {OAuth2Client} = require('google-auth-library');

//const CLIENT_ID = "939424960970-edvrfu1le3rf7st313j7dck4s3kttvf3.apps.googleusercontent.com";
const CLIENT_ID = "9332959347-o8lhle1t6p7oanp5rq08vosu7vct3as3.apps.googleusercontent.com"; // Aswin's Google OAuth2 web client id

//from https://developers.google.com/identity/sign-in/web/backend-auth
const client = new OAuth2Client(CLIENT_ID);
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    return ticket.getPayload();
    // const userid = payload['sub'];
    // return userid;
// If request specified a G Suite domain:
// const domain = payload['hd'];
}

module.exports = {
    verify
}
