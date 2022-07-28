const User = require('../models/users');
const presManager = require('../presManager/presManager')
const {OAuth2Client} = require('google-auth-library');

//const CLIENT_ID = "588466351198-96mgu43b4k81evnf387c5gpa2vc4d587.apps.googleusercontent.com";
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
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    return userid;
// If request specified a G Suite domain:
// const domain = payload['hd'];
}


login = (req, res) => {
    if (req.body.verifiedDevice === "false") {
        verify(req.body.token)
        .then(() => {
            return retreiveUserInfo(req, res);    
        }).catch((error) => {
            console.log(error)
            return res.status(500).json({ error });
        });
    } else {
        return retreiveUserInfo(req, res);
    }
}

// helper function - retrieve user info, called by login
retreiveUserInfo = (req, res) => {
    User.findOne({userID: req.body.userID}, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err });
        }
        // create user if it's not already in the DB, otherwise return user
        if (!data) {
            User.create({ //@TODO need a .catch
                userID: req.body.userID,
                username: req.body.username,
                presentations: []
            }).then((data) => {
                return res.status(200).json({ userID: data.userID, username: data.username, presentations: data.presentations, presentationTitles: [] });
            })
        } else {
    	    // presManager.getPresTitle(req.body.userID).then((titles) => {
            //     console.log("userStore: login: user " + req.body.userID + "'s presentations: " + titles);
            //     return res.status(200).json({ userID: data.userID, username: data.username, presentations: data.presentations, presentationTitles: titles});
            // });
            return res.status(200).json({userID: data.userID, username: data.username});
        }
    });
}

// Internal - called from presManager.js's createPres(). Expects user ID corresponding to 
// to the userID field of a document in the users collection, and presentation ID 
// corresponding to the _id field of a document in the presentations collection - 
// both are strings.
addPresToUser = (userID, presID) => {
    console.log("userStore: addPresToUser: Adding presentation " + presID + " to user " + userID);
    return new Promise((resolve, reject) => {
        User.findOne(
            { userID },
        ).then((user) => {
            //console.log(user.presentations);
            if (user.presentations.includes(presID) == false) {
                return User.findOneAndUpdate(
                    { userID },
                    {$push: {presentations: presID}},
                    {new: true}
                );
            } else {
                throw "userStore: addPresToUser: Presentation " + presID  + " already included in user.";
            }
        }).then((data) => {
            console.log("userStore: addPresToUser: Added pres " + presID + " to user " + userID);
            resolve(data);
        }).catch((err) => {
            console.log(err);
            reject(err);
        })
    });
    //edit presentation to add user to array
}

// Internal - called from presManager.js's deletePres(). Expects user ID corresponding to 
// to the userID field of a document in the users collection, and presentation ID 
// corresponding to the _id field of a document in the presentations collection - 
// both are strings.
removePresFromUser = (userID, presID) => {
    console.log("userStore: removePresFromUser: Deleting presentation " + presID + " from user " + userID);    
    return new Promise((resolve, reject) => {
        User.updateOne(
            { userID },
            {$pull: {presentations: presID}}
        ).then((data) => {
            console.log("userStore: removePresFromUser: Deleted presentation " + presID + " from user " + userID);
            resolve(data);
        }).catch((err) => {
            console.log(err);
            reject(err);
        })
    });
}

module.exports = {
    login,
    addPresToUser,
    removePresFromUser
}
