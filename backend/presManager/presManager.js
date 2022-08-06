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


// Internal - for calls from wssserver.js. Return presentation object after finding 
// it by presentation ID
getPresById = (presID) => {
    return new Promise((resolve, reject) => {
        if (!presID) {
            reject("No presentation specified");
        }
        Presentation.findById(presID).then((pres) => {
            if (pres) {
                resolve(pres);
            } else {
                reject("Presentation not found");
            }
        }, (err) => {
            reject(err);
        });
    });
}

// Internal - for calls from parse() of parser.js, rather than 
// for responding to requests form the frontend.
storeImportedPres = async (presObj, userID) => {
    /* Expects a presentation object, and a string (e.g. "104866131128716891939") */
    console.log("presManager: storeImportedPresentation: Storing imported presentation for user " + userID);
   
    // input error checks
    var inputErr = "";
    if (!userID) {
        inputErr += "User not specified. Cannot add presentation to user.";
        inputErr += " ";
    }
    if (!presObj) {
        inputErr += "No presentation given for storage.";
        inputErr += " ";
    }
    if (!userID || !presObj) {
        inputErr += "No presentation stored."
        return inputErr;
    }

    // check if userID refers to a user who exists
    try {
        await userStore.userExistsWithID(userID);
    } catch (err) {
        return err + ". Cannot add presentation to user. Presentation not stored.";    
    }

    // check if userID refers to someone who could have imported presObj
    var isPresObjImportedByUser = false;
    for (var i = 0; i < presObj.users.length; i++) {
        if (presObj.users[i].id === userID) {
            isPresObjImportedByUser = true;
        }
    }
    if (isPresObjImportedByUser === false) {
        return "User " + userID + " did not import this presentation. Presentation not stored.";
    }
    
    try {
        var data = await Presentation.create(presObj);
        await userStore.addPresToUser(userID, data._id);
        return data._id;
    } catch (err) {
        return err;
    }
    // var presID;
    // return new Promise ((resolve, reject) => {
    //     Presentation.create(presObj).then((data) => {
    //         presID = data._id;
    //         return userStore.addPresToUser(userID, data._id);
    //     }).then((result) => {
    //         resolve( presID );
    //     }).catch((err) => {
    //         reject( err );
    //     })
    // });
}

checkPermission = (userID, presID, permission) => {
    console.log("presManager: checkPermission: Checking if user " + userID + " has " + permission + " permission for presentation " + presID );
    return new Promise((resolve,reject)=>{
        Presentation.findById(presID).then((pres) => {
            for (var i = 0; i < pres.users.length; i++) {
                if (pres.users[i].id === userID && pres.users[i].permission === permission) {
                    resolve(pres);
                }
            }
            reject("user " + userID + " does not have adequate permission to delete presentation " + presID);
        }).catch((err) => {
            console.log(err);
            //@TODO throw error if presentation is not found?
            reject("Presentation not found");
        })
    })
}

//      editPres = (req, res) => {
//          //check permission and update in one
//          Presentation.findOneAndUpdate({
//              "_id": req.body.presID,
//              "users.id": req.body.userID
//          }, {[req.body.field]: req.body.content}, {new: true}).then((pres) => {
//              return res.status(200).json({ data: pres });
//          }).catch((err) => {
//              return res.status(500).json({ err });
//          })
//      }

// expects userID and presID in query
deletePres = async (req, res) => {
    var deletedPres;
    console.log("presManager: deletePres: request query: ?userID=" + req.query.userID + "&presID=" + req.query.presID);
    
    var inputErr = "";
    // check that req.query.presID is defined
    if (!req.query.presID) {
        inputErr += "Presentation to delete is not specified.";
        inputErr += " ";
    }
    // check that req.query.userID is defined
    if (!req.query.userID) {
        inputErr += "User who is requesting to delete the presentation is not specified.";
        inputErr += " ";
    }
    // check that neither req.query.presID nor req.query.userID is null
    if (!req.query.presID || !req.query.userID) {
        return res.status(400).json({err: inputErr});
    }

    // check if user exists
    try {
        await userStore.userExistsWithID(req.query.userID);
    } catch(err) {
        console.log("presManager: deletePres: " + err);
        return res.status(400).json({ err });
    }

    var presToBeDeleted;
    try { 
        presToBeDeleted = await checkPermission(req.query.userID, req.query.presID, "owner"); 
    } catch(err) {
        return res.status(400).json({ err });
    }
    if (presToBeDeleted) {
        console.log("presManager: deletePres: the presentation to be deleted has been retreived. It has " + presToBeDeleted.users.length + " participating users");
        for (let i = 0; i < presToBeDeleted.users.length; i++) {
            try {
                console.log("presManager: deletePres: Calling userStore.removePresFromUser( " + presToBeDeleted.users[i].id  + " , " + req.query.presID + " )");
                await userStore.removePresFromUser(presToBeDeleted.users[i].id, req.query.presID);
	        } catch(err) {
                res.status(400).json({ err });
	        }
	    }
        try {
            await Presentation.findOneAndDelete({
                "_id": req.query.presID,
                "users.id": req.query.userID
            });

        } catch(err) {
            return res.status(400).json({ err });
	    }
	    return res.status(200).json({ deletedDoc: presToBeDeleted });
    }
}

savePres = async (req, res) => {
    console.log("presManager: savePres: received request to update presentation " + req.body.presID);
    const filter = {"_id": req.body.presID};
    const update = {
        "title": req.body.title,
        "cards": req.body.cards,
        "feedback": req.body.feedback
    }

    // input checks
    var inputErr = "";
    if (!req.body.presID) {
        inputErr += "No presentation specified.";
        inputErr += " ";
    }
    if (!req.body.title) {
        inputErr += "Title required.";
        inputErr += " ";
    }
    if (!req.body.cards) {
        inputErr += "Cue cards array required.";
        inputErr += " ";
    }
    if (!req.body.feedback) {
        inputErr += "Feedback array required.";
        inputErr += " ";
    }
    if (!req.body.presID || !req.body.title || !req.body.cards || !req.body.feedback) {
        return res.status(400).json({ err: inputErr });
    }

    // save changes to presentation specified by presID
    try {
        var pres = await Presentation.findOneAndUpdate(filter, update, {new: true});
        if (pres === null) {
            console.log("presManager: savePres: presentation " + req.body.presID + " was not found!");
            return res.status(400).json({err: "Presentation not found."});
        } else {
            console.log("presManager: savePres: presentation " + req.body.presID + " after updates:\n" + pres);
            return res.status(200).json({data: pres});
        }
    } catch (err) {
        console.log("presManager: savePres: " + err);
        return res.status(400).json({err});
    }
}

// Internal - to be called from wsserver.js. Wraps around savePres, and 
// returns the body of savePres's response.
savePresInternal = async (presID, title, cards, feedback) => {
    function Response() {
        this.stat = 100;
        this.body = null;
    }
    Response.prototype.json = function(obj){
        this.body = obj;
    }
    Response.prototype.send = function(obj) {
        this.body = obj;
    }
    Response.prototype.status = function(responseStatus) {
        this.stat = responseStatus;
        return this;
    }  
    var req = {body: {presID, title, cards, feedback}};
    var res = new Response();
    await savePres(req, res);
    return res.body;
}

// expects userID in query
getAllPresOfUser = async (req, res) => {
    // check that req.query.userID is defined
    if (!req.query.userID) {
       return res.status(400).json({err: "User not specified"});
    }

    // check if user with userID===req.query.userID exists
    try {
        await userStore.userExistsWithID(req.query.userID);
    } catch (err) {
        return res.status(400).json({ err });
    }

    // find all presentations of user with userID===req.query.userID
    try {
        var presentationArray = await Presentation.find({"users.id": req.query.userID});
        return res.status(200).json( presentationArray );
    } catch (err) {
        res.status(400).json({ err });
    }
}

// expects the username of the user being added, and presID
share = (req, res) => {
    var userID = null;
    userStore.getUserIdOf(req.body.username).then((thisUser) => {
            userID = thisUser;
        }, (err) => {
            throw err;
    }).then(() => {
            return Presentation.findById(req.body.presID);
        }, (err) => {
            throw err;
    }).then((pres) => {
            if (!pres) {
                throw "No presentation found!";
	    } 
            return userStore.addPresToUser(userID, req.body.presID);
        }, (err) => {
            throw err;
    }).then(() => {
            console.log("presManager: share: adding user " + userID + " to presentation " + req.body.presID + " as collaborator");
            let addedUser = {id: userID, permission: "collaborator"};
            return Presentation.findOneAndUpdate(
                {"_id": req.body.presID},
                {$push: {users: addedUser}},
                {new: true}
	    );
        }, (err) => {
            throw err;
    }).then((updatedPres) => {
            return res.status(200).json({data: updatedPres});
        }, (err) => {
            throw err;
    }).catch((err) => {
            res.status(400).json({err});
    });
}

//      unShare = (req, res) => {
//          Presentation.findById(req.body.presID).then((pres) => {
//              if (!pres) {
//                  throw "no presentation found";
//              }
//              return userStore.removePresFromUser(req.body.userID, req.body.presID)
//          }).then(() => {
//              return Presentation.findOneAndUpdate(
//                  { "_id": req.body.presID },
//                  {$pull: {users: { id: req.body.userID }}},
//                  {new: true}
//              );
//          }).then((updatedPres) => {
//              return res.status(200).json({data: updatedPres});
//          }).catch((err) => {
//              return res.status(500).json({err});
//          })
//      }

module.exports = {
    createPres,
    storeImportedPres,
    getPresById,
    //editPres,
    deletePres,
    savePresInternal,
    savePres,
    getAllPresOfUser,
    share,
    //unShare
}
