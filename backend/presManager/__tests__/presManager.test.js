const presManager = require("../presManager");
const mongoose = require("mongoose");
const Presentation = require("../../models/presentations");
const User = require("../../models/users");

const objectIdGoodFood = "900df00d900df00d900df00d";
const samplePresentation = {
    _id: mongoose.Types.ObjectId( objectIdGoodFood ),
    title: "Jest Test Presentation 1",                                                      
    cards: [{                                                              
        "backgroundColor": 1,                                              
        "transitionPhrase": "-",                                           
        "endWithPause": 1,                                                 
        "front": {                                                         
            "backgroundColor": 1,                                          
            "content": {                                                   
                "font": "Times New Roman",                                 
                "style": "normalfont",                                     
                "size": "12",                                              
                "colour": 0,                                               
                "message": "> "                                            
            }                                                              
        },                                                                 
        "back": {                                                          
            "backgroundColor": 1,                                          
            "content": {                                                   
                "font": "Times New Roman",                                 
                "style": "normalfont",                                     
                "size": "12", 
                "colour": 0,                                               
                "message": "> "                                            
            }                                                              
        }                                                                  
    }],                                                                    
    feedback: [],                                                          
    users: [                                                               
        {id: "1", permission: "owner"}                                     
    ]                                                                      
};

beforeEach(async() => {
    try {
        await mongoose.connect('mongodb://localhost:27017/CPEN321', { useNewUrlParser: true })
        console.log("connected to DB");
        await Presentation.deleteMany({});
        await User.deleteMany({});
        await User.create([
            {userID: "1", username: "Jest user 1", refreshToken: "11", presentations: []},
            {userID: "2", username: "Jest user 2", refreshToken: "22", presentations: []}
        ]);
    } catch(e) {
        console.error('Connection error', e.message);
        return;
    }
});

afterEach(async () => {
    await mongoose.connection.close();
});


jest.mock("../../userStore/userStore");

/**
 * tests for createPres
 */
describe("createPres tests", () => {

    test("Presentation name is null", async () => {
        var req = {body: {title: null, userID: "1"}};
        var res = new Response();
        var expectedPres = {
            title: "unnamed",
            cards: [{
                "backgroundColor": 1,
                "transitionPhrase": "-",
                "endWithPause": 1,
                "front": {
                    "backgroundColor": 1,
                    "content": {
                        "font": "Times New Roman",
                        "style": "normalfont",
                        "size": "12",
                        "colour": 0,
                        "message": "> "
                    }
                },
                "back": {
                    "backgroundColor": 1,
                    "content": {
                        "font": "Times New Roman",
                        "style": "normalfont",
                        "size": "12",
                        "colour": 0,
                        "message": "> "
                    }
                }
            }],
            feedback: [],
            users: [
                {id: "1", permission: "owner"}
            ]
        };
        var expectedResStat = 200;

        await presManager.createPres(req, res);
        
        console.log(res.body);
        expectedPres._id = res.body._id;
        expectedPres.__v = res.body.__v;
        expectedPres.users[0]._id = res.body.users[0]._id;
	    expectedPres.cards[0]._id = res.body.cards[0]._id;

        expect(res.body.title).toEqual(expectedPres.title);
        expect(res.body.cards[0].backgroundColor).toEqual(expectedPres.cards[0].backgroundColor);
        expect(res.body.feedback).toEqual(expectedPres.feedback);
        expect(res.body.users[0].id).toEqual(expectedPres.users[0].id);
        expect(res.body.users[0].permission).toEqual(expectedPres.users[0].permission);
        
        expect(res.stat).toEqual(200);
    });

    test("userID is null", async () => {
        var res = new Response();
        //console.log(res);
        var req = {body: {title: "Presentation", userID: null}};
	    await presManager.createPres(req, res);
        expect(res.body).toEqual({err: "presManager: createPres: no userID provided!"});
        expect(res.stat).toEqual(400);
	//console.log(res);
    });

    test("userID is illegal - no such user exists", async () => {
        var req = {body: {title: "Presentation", userID: "Idontexist"}};
        var res = new Response();
        await presManager.createPres(req, res);
        //console.log("{ stat: " + res.stat + ", body: " + res.body + " }");
        expect(res.body).toEqual({err: "presManager: createPres: user not found - presentation will not be created"});
        expect(res.stat).toEqual(400);
    });

    test("Valid userID and presentation title", async () => {
        var req = {body: {title: "Presentation", userID: "1"}};
        var res = new Response();
        await presManager.createPres(req, res);
	
        expect(res.body.title).toBeDefined();
        expect(res.body.title).toEqual(req.body.title);
        
        expect(res.body.cards.length).toBeDefined();
        expect(res.body.cards.length).toEqual(1);
        
        expect(res.body.users[0].id).toBeDefined();
        expect(res.body.users[0].permission).toBeDefined();
        expect(res.body.users[0].id).toEqual(req.body.userID);
        expect(res.body.users[0].permission).toEqual("owner");
	
        expect(res.stat).toEqual(200);
    });
});

describe("deletePres tests", () => {
    test("presentation ID is null", async () => {
        var req = {query: {presID: null, userID: "1"}};
        var res = new Response();
        await presManager.deletePres(req, res);
        console.log("{ res.stat: " + res.stat + ", res.body: " + res.body + " }");
        expect(res.body).toEqual({err: "Presentation to delete is not specified. "});
        expect(res.stat).toEqual(400);
    });

    test("User ID is null", async () => {
        // create a presentation for user "1"
        var req = {body: {title: "Jest test presentation", userID: "1"}};
        var res = new Response();
        await presManager.createPres(req, res);
	    var thisPresentation = res.body._id;
        //console.log("ID of user's presentation is " + presID);

        // Try deleting presentation with ID==thisPresentation, but with null userID
        req = {query: {presID: thisPresentation, userID: null}}
	    res = new Response();
	    await presManager.deletePres(req, res);
	    expect(res.body).toEqual({err: "User who is requesting to delete the presentation is not specified. "});
        expect(res.stat).toEqual(400);
    });

    test("Both presentation ID and user ID are null", async () => {
        var req = {query: {presID: null, userID: null}};
        var res = new Response();
        await presManager.deletePres(req, res);
        expect(res.body).toEqual({err: "Presentation to delete is not specified. User who is requesting to delete the presentation is not specified. "});
        expect(res.stat).toEqual(400);
    });

    test("Illegal presentation ID - presentation does not exist", async () => {
        var req = {query: {presID: "deadbeefdeadbeefdeadbeef", userID: "1"}};
        var res = new Response();
        await presManager.deletePres(req, res);
        expect(res.body).toEqual({err: "Presentation not found"});
        expect(res.stat).toEqual(400);
    });

    test("Illegal user Id - user does not exist", async () => {
        // create a new presentation for user "1"
        var req = {body: {title: "Jest test presentation 2", userID: "1"}};
        var res = new Response();
        await presManager.createPres(req, res);
        var thisPresentation = res.body._id;

        // try deleteing presentation with ID==thisPresentation, but with non-existent user "Idontexist"
        req = {query: {presID: thisPresentation, userID: "Idontexist"}};
        res = new Response();
        await presManager.deletePres(req, res);
        console.log(res);
        expect(res.body).toEqual({err: "User Idontexist does not exist"});
        expect(res.stat).toEqual(400);
    });

    test("user ID specifies a user without adequate permission to delete presentation", async () => {
        // create a new presentation for user "1"
        var req = {body: {title: "Jest test presentation 3", userID: "1"}};
        var res = new Response();
        await presManager.createPres(req, res);
        var thisPresentation = res.body._id;

        // try deleteing presentation with ID==thisPresentation, but with user ID "2" 
        // which indicates a user who does not have permission to delete the presentation
        req = {query: {presID: thisPresentation, userID: "2"}};
        res = new Response();
        await presManager.deletePres(req, res);
        expect(res.body).toEqual({err: "user 2 does not have adequate permission to delete presentation " + thisPresentation});
        expect(res.stat).toEqual(400);
    });

    test("Valid user ID and presentation ID, and adequate permission to delete", async () => {
        // create a new presentation for user "1"
        var thisPresentation = "900df00d900df00d900df00d"; // custom presentation _id for mock userStore's removePresFromUser
        var thisPresentationContent = {
            _id: mongoose.Types.ObjectId(thisPresentation),
            title: "Jest test presentation 4",
            cards: [],
            feedback: [],
            users: [{id: "1", permission: "owner"}]
        };
        await Presentation.create(thisPresentationContent);

        // delete presentation with _id==thisPresentation, using userID "1"
        req = {query: {presID: thisPresentation, userID: "1"}};
        res = new Response();
        await presManager.deletePres(req, res);
        expect(res.body.deletedDoc._id).toEqual(thisPresentationContent._id);
        expect(res.body.deletedDoc.title).toEqual(thisPresentationContent.title);
        expect(res.body.deletedDoc.users[0].id).toEqual("1");
        expect(res.body.deletedDoc.users[0].permission).toEqual("owner");
        expect(res.stat).toEqual(200);
    });
});

describe("getAllPresOfUser tests", () => {
    test("user ID is null", async () => {
        var req = {query: {userID: null}};
        var res = new Response();
        await presManager.getAllPresOfUser(req, res);
        expect(res.body).toEqual({err: "User not specified"});
        expect(res.stat).toEqual(400);
    });

    test("user ID specifies a non-existent user", async () => {
        var req = {query: {userID: "Idontexist"}};
        var res = new Response();
        await presManager.getAllPresOfUser(req, res);
        expect(res.body).toEqual({err: "User Idontexist does not exist"});
        expect(res.stat).toEqual(400);
    });

    test("User has 0 presentations", async () => {
        var req = {query: {userID: "1"}}; //add no new presentations to user "1" before retrieving all their presentations
        var res = new Response();
        await presManager.getAllPresOfUser(req, res),
        expect(res.body).toEqual([]);
        expect(res.stat).toEqual(200);
    });

    test("User has 1 presentation", async () => {
        // create a new presentation for user "1"
        var thisPresentation = "900df00d900df00d900df00d"; 
        var thisPresentationContent = {
            _id: mongoose.Types.ObjectId(thisPresentation),
            title: "Jest test presentation 1",
            cards: [],
            feedback: [],
            users: [{id: "1", permission: "owner"}]
        };
        await Presentation.create(thisPresentationContent);

        var req = {query: {userID: "1"}};
        var res = new Response();
        await presManager.getAllPresOfUser(req, res);
        expect(res.body.length).toBeDefined();
        expect(res.body.length).toEqual(1);
        expect(res.body[0]._id).toEqual(thisPresentationContent._id);
        expect(res.body[0].title).toEqual(thisPresentationContent.title);
        expect(res.body[0].users.length).toBeDefined();
        expect(res.body[0].users.length).toEqual(thisPresentationContent.users.length);
        expect(res.body[0].users[0].id).toEqual(thisPresentationContent.users[0].id);
        expect(res.body[0].users[0].permission).toEqual(thisPresentationContent.users[0].permission);
        expect(res.stat).toEqual(200);
    });

    test("User has 2 presentations", async () => {
        var title1 = "Jest test presentation 1";  // define presentation title variables against which to match test results later
        var title2 = "Jest test presentation 2";
    
        // create a presentation for user "1"
        var req = {body: {title: title1, userID: "1"}};
        var res = new Response();
        await presManager.createPres(req, res);

        // create a second presentation for user "1"
        req = {body: {title: title2, userID: "1"}};
        res = new Response();
        await presManager.createPres(req, res);

        // retrieve all presentations of user "1"
        req = {query: {userID: "1"}};
        res = new Response();
        await presManager.getAllPresOfUser(req, res);
        expect(res.body.length).toBeDefined();
        expect(res.body.length).toEqual(2);
        expect(res.body[0].title).toEqual(title1);
        expect(res.body[1].title).toEqual(title2);
        expect(res.stat).toEqual(200);
    });
});

describe("getPresById tests", () => {
    test("presID is null", async () => {
        var err = null;
        try {
            await presManager.getPresById(null);
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toEqual("No presentation specified");
    });

    test("presID refers to a presentation that does not exist", async () => {
        var err = null;
        try {
            await presManager.getPresById("deadbeefdeadbeefdeadbeef");
        } catch (e) {
            err = e;
        }
        expect(err).toBeDefined();
        expect(err).toEqual("Presentation not found");
    });

    test("presID refers to a presentation that DOES exist", async () => {
        // create a new presentation for user "1", with _id=="900df00d900df00d900df00d"
        var thisPresentation = "900df00d900df00d900df00d"; 
        var thisPresentationContent = {
            _id: mongoose.Types.ObjectId(thisPresentation),
            title: "Jest test presentation 1",
            cards: [],
            feedback: [],
            users: [{id: "1", permission: "owner"}]
        };
        await Presentation.create(thisPresentationContent);
        
        var err = null;
        var presentation = null;
        try {
            presentation = await presManager.getPresById(thisPresentation);
        } catch (e) {
            err = e;
        }
        
        expect(err).toBeNull();
        expect(presentation).toBeDefined();
        expect(presentation.title).toBeDefined();
        expect(presentation.users).toBeDefined();
        expect(presentation.users.length).toBeDefined();
        expect(presentation.users.length).toEqual(1);
        
        expect(presentation.title).toEqual(thisPresentationContent.title);
        expect(presentation._id).toEqual(thisPresentationContent._id);
        expect(presentation.users[0].id).toEqual(thisPresentationContent.users[0].id);
        expect(presentation.users[0].permission).toEqual(thisPresentationContent.users[0].permission);
    });
});

describe("savePres tests", () => {
    test("presentation ID is null", async () => {
        var req = {body: {presID: null, title: "Jest Test Presentation 1", cards: [], feedback: []}};
        var res = new Response();
        await presManager.savePres(req, res);
        expect(res.body).toEqual({err: "No presentation specified. "});
        expect(res.stat).toEqual(400);
    });

    test("presentation ID specifies a non-existent presentation", async () => {
        var req = {body: {presID: "deadbeefdeadbeefdeadbeef", title: "Jest Test Presentation 1", cards: [], feedback:[]}};
        var res = new Response();
        await presManager.savePres(req, res);
        expect(res.body).toEqual({err: "Presentation not found."});
        expect(res.stat).toEqual(400);
    });

    test("title is null", async () => {
        await Presentation.create(samplePresentation);
        var req = {body: {presID: samplePresentation._id, title: null, cards: [], feedback: []}};
        var res = new Response();
        await presManager.savePres(req, res);
        expect(res.body).toEqual({err: "Title required. "});
        expect(res.stat).toEqual(400);
    });

    test("cards is null", async () => {
        await Presentation.create(samplePresentation);
        var req = {body: {presID: samplePresentation._id, title: "Jest Test Presentation 1, Updated", cards: null, feedback: []}};
        var res = new Response();
        await presManager.savePres(req, res);
        expect(res.body).toEqual({err: "Cue cards array required. "});
        expect(res.stat).toEqual(400);
    });
    
    test("feedback is null", async () => {
        await Presentation.create(samplePresentation);
        var req = {body: {presID: samplePresentation._id, title: "Jest Test Presentation 1, Updated", cards: [], feedback: null}};
        var res = new Response();
        await presManager.savePres(req, res);
        expect(res.body).toEqual({err: "Feedback array required. "});
        expect(res.stat).toEqual(400);
    });
    
    test("Valid presesntation ID, but multiple other inputs are null", async () => {
        await Presentation.create(samplePresentation);
        var req = {body: {presID: samplePresentation._id, title: null, cards: [], feedback: null}};
        var res = new Response();
        await presManager.savePres(req, res);
        expect(res.body).toEqual({err: "Title required. Feedback array required. "});
        expect(res.stat).toEqual(400);
    });

    test("Typical input - all required fields are given and valid", async () => {
        await Presentation.create(samplePresentation);
        var req = {body: {presID: samplePresentation._id, title: "Jest Test Presentation 1, Updated", cards: [], feedback: []}};
        var res = new Response();
        await presManager.savePres(req, res);

        // confirm non-error response
        expect(res.body).toBeDefined();
        expect(res.body.data).toBeDefined(); // if this passes, it means savePresInternal didn't return an {err: ...} object
        
        // expect the presentation to be the same presentation...
        expect(res.body.data._id).toEqual(samplePresentation._id);
        
        // ... but expect its contents to be the new contents we set...
        expect(res.body.data.title).toEqual(req.body.title);
        expect(res.body.data.cards).toEqual(req.body.cards);
        expect(res.body.data.feedback).toEqual(req.body.feedback);

        // ... and not the old contents.
        expect(res.body.data.title).not.toEqual(samplePresentation.title);
        expect(res.body.data.cards).not.toEqual(samplePresentation.cards);
        expect(res.body.data.feedback).toEqual(samplePresentation.feedback); // didn't change the feedback field of this presentation though
    });
});

describe("savePresInternal tests", () => {
    test("Typical input", async () => {
        await Presentation.create(samplePresentation);
        var presID = samplePresentation._id; 
        var title = "Jest Test Presentation 1, Updated";
        var cards = [];
        var feedback = [];
        var updatedPres = await presManager.savePresInternal(presID, title, cards, feedback);

        console.log(updatedPres);

        // confirm non-error response
        expect(updatedPres).toBeDefined();
        expect(updatedPres.data).toBeDefined(); // if this passes, it means savePresInternal didn't return an {err: ...} object
        expect(updatedPres.err).not.toBeDefined();
        
        // expect the presentation to be the same presentation...
        expect(updatedPres.data._id).toEqual(samplePresentation._id);
        
        // ... but expect its contents to be the new contents we set...
        expect(updatedPres.data.title).toEqual(title);
        expect(updatedPres.data.cards).toEqual(cards);
        expect(updatedPres.data.feedback).toEqual(feedback);

        // ... and not the old contents.
        expect(updatedPres.data.title).not.toEqual(samplePresentation.title);
        expect(updatedPres.data.cards).not.toEqual(samplePresentation.cards);
        expect(updatedPres.data.feedback).toEqual(samplePresentation.feedback); // didn't change the feedback field of this presentation though
    });

    test("Erroneous input - title and feedback are null", async () => {
        await Presentation.create(samplePresentation);
        var presID = samplePresentation._id; 
        var title = null;
        var cards = [];
        var feedback = null;
        var updatedPres = await presManager.savePresInternal(presID, title, cards, feedback);

        // confirm error response
        expect(updatedPres).toBeDefined();
        expect(updatedPres.data).not.toBeDefined();
        expect(updatedPres.err).toBeDefined();

        // check error response
        expect(updatedPres.err).toEqual("Title required. Feedback array required. ");
    });
});

describe("storeImportedPres tests", () => {
    test("userID is null", async () => {
        var err = await presManager.storeImportedPres(samplePresentation, null);
        expect(err).toEqual("User not specified. Cannot add presentation to user. No presentation stored.");
        expect(err).not.toEqual(samplePresentation._id);
    });

    test("presObj is null", async () => {
        var err = await presManager.storeImportedPres(null, "1");
        expect(err).toEqual("No presentation given for storage. No presentation stored.");
        expect(err).not.toEqual(samplePresentation._id);
    });

    test("userID refers to a non-existent user", async () => {
        var err = await presManager.storeImportedPres(samplePresentation, "Idontexist");
        expect(err).toEqual("User Idontexist does not exist. Cannot add presentation to user. Presentation not stored.");
        expect(err).not.toEqual(samplePresentation._id);
    });

    test("userID does not match the 'id' field of any of the elements of the presObj.users array", async () => {
        var err = await presManager.storeImportedPres(samplePresentation, "2");
        expect(err).toEqual("User 2 did not import this presentation. Presentation not stored.")
        expect(err).not.toEqual(samplePresentation._id);
    });

    test("userID is of a user who exists and is included in the presObj.users array", async () => {
        var presID = await presManager.storeImportedPres(samplePresentation, "1");
        expect(presID).toEqual(samplePresentation._id);
        await expect(Presentation.findOne({_id: samplePresentation._id})).resolves.toBeDefined();
    });
});

/**
 * Dummy response class
 */
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
