const User = require('../models/users');
const presManager = require('../presManager/presManager');
const verifier = require("./verify");


// expects token, userID, verifiedDevice and username
login = async (req, res) => {
    if (req.body.verifiedDevice === "false") {
        try {
            if (await verifier.verify(req.body.token)) {
                return retreiveUserInfo(req, res);
            } else {
                return res.status(500).json({ error: new Error("login failed") });
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: new Error("login failed") });
        }
    } else {
        return retreiveUserInfo(req, res);
    }
}

// helper function - retrieve user info, called by login
// expects userID and username
retreiveUserInfo = async (req, res) => {
    try {
        var data = await User.findOne({userID: req.body.userID});
        if (!data) {
            let newUser = await User.create({
                userID: req.body.userID,
                username: req.body.username,
                presentations: []
            })
            return res.status(200).json({ userID: newUser.userID, username: newUser.username, presentations: newUser.presentations });
        } else {
            return res.status(200).json({userID: data.userID, username: data.username});
        }
    } catch (err) {
        console.log("dauwuihawuihdaiuhawdiuhuiadhwuhiadwiuhdawiuhdawuihdawuihdaw errir" + err);
        return res.status(500).json({ error: err });
    }
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
                reject( "userStore: addPresToUser: Presentation " + presID  + " already included in user.");
            }
        }).then((data) => {
            console.log("userStore: addPresToUser: Added presentation " + presID + " to user " + userID);
            resolve(data);
        }).catch((err) => {
            console.log(err);
            reject(String(err)); // cast to string for easier jest tests
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

// Internal - called from presManager.js's createPres(). Expects a userID string. Returns 
// a promise that resolves to true if there exists a user in that user database with userID 
// field equal to userID. Otherwise rejects with false.
userExistsWithID = (userID) => {
    console.log("userStore: userExistsWithID: Checking whether there exists a user with userID " + userID + " in the database");
    return new Promise((resolve, reject) => {
        User.find({userID}).then(
            (data) => {
                console.log("userStore: userExistsWithID: result of searching user database is " + data);
                if(data.length > 0) {
                    console.log("userStore: userExistsWithID: A user with userID " + userID + " exists");
                    resolve(true);
                } else {
                    console.log("userStore: userExistsWithID: There exists no user with userID " + userID);
                    reject(false);
                }
        });
    });
}

module.exports = {
    login,
    addPresToUser,
    removePresFromUser,
    userExistsWithID
}
