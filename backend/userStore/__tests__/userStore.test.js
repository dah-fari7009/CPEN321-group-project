const userStore = require("../userStore");
const mongoose = require('mongoose');
const User = require('../../models/users');

beforeAll(async() => {
    try {
        await mongoose.connect('mongodb://localhost:27017/CPEN321', { useNewUrlParser: true })
        console.log("connected to DB");

        await User.create({
            userID: "1",
            username: "jest user",
            presentations: ["62c38d740afce8d7ea604043"]
        })
    } catch {
        console.error('Connection error', e.message);
        return;
    }
});

afterAll(async () => {
    await User.deleteOne({userID: "1"});
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
        let documentsModified = await userStore.removePresFromUser("1", "62c38d740afce8d7ea604044");
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
    let res = {
        stat: 100,
        msg: "null",
        json: function(err){
            this.msg = err;
        },
        status: function(responseStatus) {
            this.stat = responseStatus;
            return this; 
        }
    }

    test("valid login", async () => {
        let req = {body: {
            token: "estimatedDocumentCount", //@TODO
            userID: "1",
            verifiedDevice: "false",
            username: "jest user"
        }};
        userStore.login(req, res);
        expect(res.stat).toEqual(200);
    })

    test("login with bad token", async () => {
        let req = {body: {
            token: "badtoken",
            userID: "3",
            verifiedDevice: "false",
            username: "jest user"
        }};
        userStore.login(req, res);
        expect(res.stat).toEqual(500);
    })

    test("verified login with returning user", async () => {
        let req = {body: {
            token: "estimatedDocumentCount",
            userID: "1",
            verifiedDevice: "true",
            username: "jest user"
        }};
        userStore.login(req, res);
        expect(res.stat).toEqual(200);
    })

    test("verified login with new user", async () => {
        let req = {body: {
            token: "estimatedDocumentCount",
            userID: "newuser",
            verifiedDevice: "true",
            username: "jest user"
        }};
        userStore.login(req, res);
        expect(res.stat).toEqual(200);
    })

    test("verified login with null userID", async () => {
        let req = {body: {
            token: "estimatedDocumentCount",
            userID: null,
            verifiedDevice: "false",
            username: "jest user"
        }};
        userStore.login(req, res);
        expect(res.stat).toEqual(500);
    })

    test("verified login with null username", async () => {
        let req = {body: {
            token: "estimatedDocumentCount",
            userID: "1",
            verifiedDevice: "false",
            username: null
        }};
        userStore.login(req, res);
        expect(res.stat).toEqual(500);
    })
})


