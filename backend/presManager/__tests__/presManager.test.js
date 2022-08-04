const presManager = require("../presManager");
const mongoose = require("mongoose");
const Presentation = require("../../models/presentations");
const User = require("../../models/users");

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
        var req = {body: {presTitle: null, userID: "1"}};
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
