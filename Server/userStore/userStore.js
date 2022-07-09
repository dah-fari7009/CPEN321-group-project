const User = require('../models/users');
const {OAuth2Client} = require('google-auth-library');

const CLIENT_ID = "588466351198-96mgu43b4k81evnf387c5gpa2vc4d587.apps.googleusercontent.com";

//from https://developers.google.com/identity/sign-in/web/backend-auth
const client = new OAuth2Client(CLIENT_ID);
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
}


login = (req, res) => {
    verify(req.body.token).then(() => {
        User.findOne({userID: req.body.userID}, (err, data) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err });
            }
    
            // create user if it's not already in the DB, otherwise return user
            if (!data) {
                User.create({
                    userID: req.body.userID,
                    username: req.body.username,
                    presentations: []
                }).then((data) => {
                    return res.status(200).json({ success: true, data: data });
                })
            } else {
                return res.status(200).json({ data: data });
            }
        })
    }).catch((error) => {
        console.log(error)
        return res.status(500).json({ error: error });
    })
}

addPresToUser = (req, res) => {
    User.findOneAndUpdate(
        {userID: req.body.userID},
        {$push: {presentations: req.body.presID}},
        {new: true}
    ).then((data) => {
        return res.status(200).json({ data: data });
    }).catch((err) => {
        return res.status(500).json({ success: false, err: err });
    })

    //edit presentation to add user to array
}

module.exports = {
    login,
    addPresToUser
}