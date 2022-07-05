const User = require('../models/users');

login = (req, res) => {
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
}

module.exports = {
    login,
    addPresToUser
}