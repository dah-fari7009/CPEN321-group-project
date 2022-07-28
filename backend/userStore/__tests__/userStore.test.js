const userStore = require("../userStore");
const mongoose = require('mongoose');

beforeAll(() => {
    mongoose.connect('mongodb://localhost:27017/CPEN321', { useNewUrlParser: true })
    .then(() => {
        console.log("connected to DB");
    }).catch(e => {
        console.error('Connection error', e.message)
    })
});


/**
 * tests for addPresToUser
 */
describe("addPresToUser tests", () => {
    test("Add a valid presentation", async () => {
        await expect(userStore.addPresToUser("3", "62c38d740afce8d7ea604044")).resolves.not.toThrow();
    })
    
    test("Add a presentation a user already has", async () => {
        let presID = "62c38d740afce8d7ea604043";
        await expect(userStore.addPresToUser("3", presID))
        .rejects.toEqual("userStore: addPresToUser: Presentation " + presID + " already included in user.")
    })
    
    test("Add an invalid presentation ID", async () => {
        let userID = "3";
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
        let documentsModified = await userStore.removePresFromUser("3", "62c38d740afce8d7ea604044");
        expect(documentsModified.modifiedCount).toEqual(1);
        expect(documentsModified.matchedCount).toEqual(1);

    })

    test("remove a presentation with invalid userID", async () => {
        let documentsModified = await userStore.removePresFromUser("fakeuser", "62c38d740afce8d7ea604044");
        expect(documentsModified.modifiedCount).toEqual(0);
        expect(documentsModified.matchedCount).toEqual(0);
    })

    test("remove a presentation with invalid presID", async () => {
        let documentsModified = await userStore.removePresFromUser("3", "62c38d740afce8d7ea60404c");
        expect(documentsModified.modifiedCount).toEqual(0);
        expect(documentsModified.matchedCount).toEqual(1);
    })
})

/**
 * test for login
 */
 describe("login tests", () => {
    test("valid login", async () => {
        let req = {body: {
            token: "estimatedDocumentCount",
            userID: "hi",
            verifiedDevice: "false",
            username: "jest user"
        }};
        let res = new myRes();
        await userStore.login(req, res);
        expect(res.stat).toEqual(500);
        expect(res.msg).toEqual(1);
    })
})

class myRes {
    constructor () {
        this.stat = null;
        this.msg = null;
    }

    status(num) {
        this.stat = num;
        return this
    }

    json(str) {
        this.msg = str;
        return;
    }
}
