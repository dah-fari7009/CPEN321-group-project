const Presentation = require('../models/presentations');

//@TODO should this also have a title in the request body
createPres = (req, res) => {
    console.log("Create presentation request received!");
    if (!req.body.presObj) {
	var presTitle = "unnamed";
	if (req.body.title) presTitle = req.body.title;
        
	//@TODO check for userID
        Presentation.create({
            title: presTitle,
            cards: [],
            feedback: [],
            users: [{id: req.body.userID, permission: "owner"}]     
        }).then((data) => {
            return res.status(200).send( data._id );
        }).catch((err) => {
            return res.status(500).json({ err: err });
        })
    } else {
        Presentation.create(req.body.presObj).then((data) => {
            return res.status(200).send( data._id );
        }).catch((err) => {
            return res.status(500).json({ err: err });
        })
    }
}

getPres = (req, res) => {
    Presentation.find({
        "_id": req.body.presID,
        "users.id": req.body.userID
    }).then((pres) => {
        return res.status(200).json({ data: pres });
    }).catch((err) => {
        return res.status(500).json({ err: err });
    })
}

// Internal - for calls from login() of userStore.js, rather than
// for responding to requests from the frontend.
getPresTitle = (presentationId, userID) => {
    Presentation.find({
        "_id": presentationID,
        "users.id": userID
    }).then((pres) => {
        return pres.title;
    }).catch((err) => {
        return err;
    })	
}

// Internal - for calls from parse() of parser.js, rather than 
// for responding to requests form the frontend.
storeImportedPres = (presObj) => {
    Presentation.create(presObj).then((data) => {return data;});
}

checkPermission = (userID, presID) => {
    return new Promise(async (resolve,reject)=>{
        await Presentation.findById(presID).then((pres) => {
            for (var i = 0; i < pres.users.length; i++) {
                if (pres.users[i].id == userID) {
                    resolve(true)
                    return
                }
            }
            resolve(false)
            return
        }).catch(() => {
            //@TODO throw error if presentation is not found?
            resolve(false)
            return
        })
    })
}

editPres = (req, res) => {
    //check permission and update in one
    Presentation.findOneAndUpdate({
        "_id": req.body.presID,
        "users.id": req.body.userID
    }, {[req.body.field]: req.body.content}, {new: true}).then((pres) => {
        return res.status(200).json({ data: pres });
    }).catch((err) => {
        return res.status(500).json({ err: err });
    })
}

search = (req, res) => {
    Presentation.find({
        "title": {
            "$regex": req.body.query,
            "$options": "i"
          },
        "users.id": req.body.userID
    }).then((pres) => {
        return res.status(200).json({ data: pres });
    }).catch((err) => {
        return res.status(500).json({ err: err });
    })
}

deletePres = (req, res) => {
    Presentation.findOneAndDelete({
        "_id": req.body.presID,
        "users.id": req.body.userID
    }).then((pres) => {
        return res.status(200).json({ deletedDoc: pres });
    }).catch((err) => {
        return res.status(500).json({ err: err });
    })
}

module.exports = {
    createPres,
    storeImportedPres,
    getPres,
    getPresTitle,
    editPres,
    search,
    deletePres
}
