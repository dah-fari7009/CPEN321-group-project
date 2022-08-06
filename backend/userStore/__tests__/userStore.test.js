const userStore = require("../userStore");
const app = require("../../server");
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require('mongoose');
const User = require('../../models/users');
require('dotenv').config();

jest.mock("../verify")
jest.mock("../token")

const USERID = "1";
const USERNAME = "jest user";
const REFRESHTOKEN = process.env.REFRESH;//"1//04rGvIMYruGDkCgYIARAAGAQSNwF-L9IrY8Sy5e7cQfBLVkbgQgKBZugZJtMeTfBbmGJbItIbSVQi7DveNwF7BGPVbgA5bDpIXz4";
const PRESENTATIONS = ["62c38d740afce8d7ea604043"];

beforeEach(async() => {
    try {
        await mongoose.connect('mongodb://localhost:27017/CPEN321', { useNewUrlParser: true })
        console.log("connected to DB");
        await User.deleteMany({username: "jest user"});
        await User.create({
            userID: USERID,
            username: USERNAME,
            refreshToken: REFRESHTOKEN,
            presentations: PRESENTATIONS
        })
    } catch (e) {
        console.error('Connection error', e.message);
        return;
    }
});

afterEach(async () => {
    await mongoose.connection.close();
});


/**
 * tests for addPresToUser
 */
describe("addPresToUser tests", () => {
    test("Add a valid presentation", async () => {
        await expect(userStore.addPresToUser("1", "62c38d740afce8d7ea604044")).resolves.not.toThrow();
    })
    
    test("Add a presentation a user already has", async () => {
        let presID = "62c38d740afce8d7ea604043";
        await expect(userStore.addPresToUser("1", presID))
        .rejects.toEqual("userStore: addPresToUser: Presentation " + presID + " already included in user.")
    })
    
    test("Add an invalid presentation ID", async () => {
        let userID = "1";
        let presID = "4";
        let errorMsg = "CastError: Cast to ObjectId failed for value \"" + presID + "\" (type string) at path \"presentations\" because of \"BSONTypeError\"";
        await expect(userStore.addPresToUser(userID, presID)).rejects.toEqual(errorMsg);
    })
    
    test("Add to a nonexistent user", async () => {
        let errorMsg = "TypeError: Cannot read property 'presentations' of null";
        await expect(userStore.addPresToUser("fakeuser", "62c38d740afce8d7ea604044")).rejects.toEqual(errorMsg);
    })
})


/**
 * test for removePresFromUser
 */
describe("removePresFromUser tests", () => {
    test("remove a presentation", async () => {
        let documentsModified = await userStore.removePresFromUser("1", "62c38d740afce8d7ea604043");
        expect(documentsModified.modifiedCount).toEqual(1);
        expect(documentsModified.matchedCount).toEqual(1);

    })

    test("remove a presentation with invalid userID", async () => {
        let documentsModified = await userStore.removePresFromUser("fakeuser", "62c38d740afce8d7ea604044");
        expect(documentsModified.modifiedCount).toEqual(0);
        expect(documentsModified.matchedCount).toEqual(0);
    })

    test("remove a presentation with invalid presID", async () => {
        let documentsModified = await userStore.removePresFromUser("1", "62c38d740afce8d7ea60404c");
        expect(documentsModified.modifiedCount).toEqual(0);
        expect(documentsModified.matchedCount).toEqual(1);
    })
})

/**
 * test for login
 */
describe("login tests", () => {
    test("valid login with returning user and new device", async () => {
        let req = {
            token: "good token",
            userID: "1",
            verifiedDevice: "false",
            username: "jest user",
            authCode: "good auth"
        };
        const res = await request.put('/api/login').send(req);
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({userID: USERID, username: USERNAME});
    })

    test("valid login with new user and new device", async () => {
        let req = {
            token: "good token",
            userID: "new user",
            verifiedDevice: "false",
            username: "jest user",
            authCode: "good auth"
        };
        const res = await request.put('/api/login').send(req);
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ userID: req.userID, username: req.username, presentations: [] });
    })

    test("valid login with returning user and verified device", async () => {
        let req = {
            token: "good token",
            userID: "1",
            verifiedDevice: "true",
            username: "jest user",
            authCode: "good auth"            
        };
        const res = await request.put('/api/login').send(req);
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({userID: USERID, username: USERNAME});
    })

    test("valid login with new user and verified device", async () => {
        let req = {
            token: "good token",
            userID: "new user 2",
            verifiedDevice: "true",
            username: "jest user",
            authCode: "good auth"  
        };
        const res = await request.put('/api/login').send(req);
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ userID: req.userID, username: req.username, presentations: [] });
    })

    test("invalid token", async () => {
        let req = {
            token: "bad token",
            userID: "1",
            verifiedDevice: "false",
            username: "jest user",
            authCode: "good auth" 
        };
        const res = await request.put('/api/login').send(req);
        expect(res.status).toEqual(400);
    })

    test("invalid userID", async () => {
        let req = {body: {
            token: "good token",
            userID: 312987.34,
            verifiedDevice: "false",
            username: "jest user",
            authCode: "good auth" 
        }};
        const res = await request.put('/api/login').send(req);
        expect(res.status).toEqual(400);
    })

    test("invalid username", async () => {
        let req = {body: {
            token: "good token",
            userID: "inval username",
            verifiedDevice: "false",
            username: null,
            authCode: "good auth" 
        }};
        const res = await request.put('/api/login').send(req);
        expect(res.status).toEqual(400);
    })

    test("invalid auth code", async () => {
        let req = {body: {
            token: "good token",
            userID: "inval username",
            verifiedDevice: "false",
            username: "jest user",
            authCode: "bad auth" 
        }};
        const res = await request.put('/api/login').send(req);
        expect(res.status).toEqual(400);
    })
})


/**
 * test for userExistsWithID
 */
 describe("userExistsWithID tests", () => {
    test("check for valid user", async () => {
        await expect(userStore.userExistsWithID(USERID)).resolves.toEqual(true);
    })

    test("check for invalid user", async () => {
        await expect(userStore.userExistsWithID("fakeuser")).rejects.toEqual(false);
    })

    test("check for null user", async () => {
        await expect(userStore.userExistsWithID(null)).rejects.toEqual(false);
    })
})

/**
 * test for getUserIdOf
 */
 describe("getUserIdOf tests", () => {
    test("check for valid username", async () => {
        await expect(userStore.getUserIdOf(USERNAME)).resolves.toEqual(USERID);
    })

    test("check for invalid username", async () => {
        await expect(userStore.getUserIdOf("fake username")).rejects.toEqual("No user exists with username fake username");
    })

    test("check for null username", async () => {
        await expect(userStore.getUserIdOf(null)).rejects.toEqual("No user exists with username " + null);
    })
})

