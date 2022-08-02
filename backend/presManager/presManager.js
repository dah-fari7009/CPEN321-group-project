const Presentation = require('../models/presentations');
const userStore = require('../userStore/userStore');

//@TODO should this also have a title in the request body
createPres = async (req, res) => {
    console.log("presManager: createPres: Create presentation request received!");
    // check for required req field, userID
    if (!req.body.userID) {
        return res.status(400).json({err: "presManager: createPres: no userID provided!"});
    }
    // check if user specified by userID exists
    try {
        await userStore.userExistsWithID(req.body.userID);
        console.log("presManager: createPres: user with userID " + req.body.userID + " exists");
    } catch (userDoesNotExist) {
        return res.status(400).json({err: "presManager: createPres: user not found - presentation will not be created"});
    }
    if (!req.body.presObj) {
        // var presID;
        var presTitle = "unnamed";
        if (req.body.title) presTitle = req.body.title;
        
        //@TODO check for userID
        var data = await Presentation.create({
            title: presTitle,
            cards: [{
                backgroundColor: 1,
                transitionPhrase: "None",
                endWithPause: 1,
                front: {
                    backgroundColor: 1,
                    content: {
                        font: "Times New Roman",
                        style: "normalfont",
			size: 12,
                        colour: 0,
                        message: "Front: Add your prompt here"
		    }
		},
                back: {
                    backgroundColor: 1,
                    content: {
                        font: "Times New Roman",
                        style: "normalfont",
			size: 12,
                        colour: 0,
                        message: "Back: Add details here"
		    }
		}
	    }],
            feedback: [],
            users: [{id: req.body.userID, permission: "owner"}]
        });
        console.log("presManager: createPres: presentation successfully created");
        // presID = data._id;
        try {
            var addPresToUserResult = userStore.addPresToUser(req.body.userID, data._id);
            console.log("presManager: createPres: presentation successfully created and added to user");
            return res.status(200).send( data );
        } catch (err) {
            console.log("presManager: createPres: error when adding presentation to user: " + err);
            return res.status(500).json({ err });
        }
    } else {
        Presentation.create(req.body.presObj).then((data) => {
            //presID = data._id;
            return userStore.addPresToUser(req.body.userID, data._id);
        }).then((result) => {
            return res.status(200).send( data );
        }).catch((err) => {
            return res.status(500).json({ err });
        })
    }
}

// expects presID and userID in query
getPres = (req, res) => {
    Presentation.find({
        "_id": req.query.presID,
        "users.id": req.query.userID
    }).then((pres) => {
        return res.status(200).json({ data: pres });
    }).catch((err) => {
        return res.status(500).json({ err });
    })
}

// Internal - for calls from login() of userStore.js, rather than
// for responding to requests from the frontend.
module.exports.getPresTitle = (userID) => {
    /* Expects a userID (string) */
    console.log("presManager: getPresTitle: Retrieving the titles of user " + userID + "'s presentations");
    return new Promise ((resolve, reject) => {
        Presentation.find(
            {"users.id": userID}
        ).then((presentations) => {
            var titles = [];
            var numPresentations = presentations.length;
            for (let i = 0; i < numPresentations; i++) {
                titles.push(presentations[i].title)
            }
            resolve(titles);
        }).catch((err) => {
            reject(err);
        })
    });
}

// Internal - for calls from parse() of parser.js, rather than 
// for responding to requests form the frontend.
storeImportedPres = (presObj, userID) => {
    /* Expects a presentation object, and a string (e.g. "104866131128716891939") */
    console.log("presManager: storeImportedPresentation: Storing imported presentation for user " + userID);
    console.log(presObj);
    console.log(presObj.cards[0]);
    var presID;
    return new Promise ((resolve, reject) => {
        Presentation.create(presObj).then((data) => {
            presID = data._id;
            return userStore.addPresToUser(userID, data._id);
        }).then((result) => {
            resolve( presID );
        }).catch((err) => {
            reject( err );
        })
    });
}

checkPermission = (userID, presID, permission) => {
    console.log("presManager: checkPermission: Checking if user " + userID + " has " + permission + " permission for presentation " + presID );
    return new Promise((resolve,reject)=>{
        Presentation.findById(presID).then((pres) => {
            for (var i = 0; i < pres.users.length; i++) {
                if (pres.users[i].id === userID && pres.users[i].permission === permission) {
                    resolve(true)
                    return
                }
            }
            resolve(false)
            return
        }).catch((err) => {
            console.log(err)
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
        return res.status(500).json({ err });
    })
}

// expects query and userID in query
search = (req, res) => {
    Presentation.find({
        "title": {
            "$regex": req.query.query,
            "$options": "i"
          },
        "users.id": req.query.userID
    }).then((pres) => {
        return res.status(200).json({ data: pres });
    }).catch((err) => {
        return res.status(500).json({ err });
    })
}

// expects userID and presID in query
deletePres = (req, res) => {
    var deletedPres;
    console.log("presManager: deletePres: request query: ?userID=" + req.query.userID + "&presID=" + req.query.presID);
    checkPermission(req.query.userID, req.query.presID, "owner")
    .then((permissionToDelete) => {
        if (permissionToDelete) {
            return Presentation.findOneAndDelete({
                "_id": req.query.presID,
                "users.id": req.query.userID
            });
        } else {
            console.log("presManager: deletePres: User " + req.query.userID + " does not have adequate permission to delete presentation " + req.query.presID);
            throw {err: "presManager: deletePres: User " + req.query.userID + " does not have adequate permission to delete presentation " + req.query.presID};
        }
    }).then((pres) => {
        deletedPres = pres;
        console.log("presManager: deletePres: Calling userStore.removePresFromUser( " + req.query.userID + " , " + req.query.presID + " )");
        return userStore.removePresFromUser(req.query.userID, req.query.presID);
    }).then((data) => {
        return res.status(200).json({ deletedDoc: deletedPres });
    }).catch((err) => {
        return res.status(500).json({ err });
    })
}


savePres = (req, res) => {
    console.log("presManager: savePres: received request to update presentation " + req.body.presID);
    const filter = {"_id": req.body.presID};
    const update = {
        "title": req.body.title,
        "cards": req.body.cards,
        "feedback": req.body.feedback,
    }
    Presentation.findOneAndUpdate(filter, update, {new: true})
        .then((pres) => {
            return res.status(200).json({data: pres});
        }).catch((err) => {
            return res.status(500).json({err});
        })
}

// expects userID in query
getAllPresOfUser = (req, res) => {
    Presentation.find({
        "users.id": req.query.userID
    }).then((data) => {
        // var titleArr = [];
        // for (var i = 0; i < data.length; i++) {
        //     titleArr.push({[data[i].title]: data[i]._id})
        // }
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(500).json({err});
    })
}

// expects the userID of the user being added, and presID
share = (req, res) => {
    let addedUser = {id: req.body.userID, permission: "collaborator"}
    Presentation.findById(req.body.presID).then((pres) => {
        if (!pres) {
            throw "no presentation found";
        }
        return userStore.addPresToUser(req.body.userID, req.body.presID)
    }).then(() => {
        return Presentation.findOneAndUpdate(
            { 
                "_id": req.body.presID,
                "users.id": { $ne: req.body.userID }
            },
            {$push: {users: addedUser}},
            {new: true}
        );
    }).then((updatedPres) => {
        return res.status(200).json({data: updatedPres});
    }).catch((err) => {
        return res.status(500).json({err});
    })
}

unShare = (req, res) => {
    Presentation.findById(req.body.presID).then((pres) => {
        if (!pres) {
            throw "no presentation found";
        }
        return userStore.removePresFromUser(req.body.userID, req.body.presID)
    }).then(() => {
        return Presentation.findOneAndUpdate(
            { "_id": req.body.presID },
            {$pull: {users: { id: req.body.userID }}},
            {new: true}
        );
    }).then((updatedPres) => {
        return res.status(200).json({data: updatedPres});
    }).catch((err) => {
        return res.status(500).json({err});
    })
}

module.exports = {
    createPres,
    storeImportedPres,
    getPres,
    //getPresTitle,
    editPres,
    search,
    deletePres,
    savePres,
    getAllPresOfUser,
    share,
    unShare
}
