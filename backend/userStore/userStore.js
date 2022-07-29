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
        var data = await User.findOne({somdmos: "yiadwgywaduygwda"})//({userID: req.body.userID});
        if (!data) {
            let newPres = await User.create({
                userID: req.body.userID,
                username: req.body.username,
                presentations: []
            })
            return res.status(200).json({ userID: newPres.userID, username: newPres.username, presentations: newPres.presentations, presentationTitles: [] });
        } else {
            return res.status(200).json({userID: data.userID, username: data.username});
        }
    } catch (err) {
        console.log("dauwuihawuihdaiuhawdiuhuiadhwuhiadwiuhdawiuhdawuihdawuihdaw errir" + err);
        return res.status(500).json({ error: err });
    }
}

// internal - called from presManager.js's createPres()
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
            reject(String(err)); // cast to string for easier jest tests
        })
    });
    //edit presentation to add user to array
}

// internal - called from presManager.js's deletePres()
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
