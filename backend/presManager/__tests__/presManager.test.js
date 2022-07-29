const presManager = require("../presManager");
const mongoose = require("mongoose");
const Presentation = require("../../models/presentations");

beforeAll(async() => {
    try {
        await mongoose.connect('mongodb://localhost:27017/CPEN321', { useNewUrlParser: true })
        console.log("connected to DB");
        await Presentation.deleteMany({});
    } catch {
        console.error('Connection error', e.message);
        return;
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});


jest.mock("../../userStore/userStore");

/**
 * tests for createPres
 */
describe("createPres tests", () => {
    var res = {
        stat: 100,
        body: null,
        json: function(obj){
            this.body = obj;
        },
        send: function(obj) {
            this.body = obj;
        },
        status: function(responseStatus) {
            this.stat = responseStatus;
            return this; 
        }
    }

    test("Presentation name is null", async () => {
        var req = {body: {presTitle: null, userID: "104866131128716891939"}};
        var expectedPres = {
            title: "unnamed",
            cards: [{
                "backgroundColor": 1,
                "transitionPhrase": "",
                "endWithPause": true,
                "front": {
                    "backgroundColor": 1,
                    "content": {
                        "font": "",
                        "style": "",
                        "size": "",
                        "colour": 0,
                        "message": "> "
                    }
                },
                "back": {
                    "backgroundColor": 1,
                    "content": {
                        "font": "",
                        "style": "",
                        "size": "",
                        "colour": 0,
                        "message": "> "
                    }
                }
            }],
            feedback: [],
            users: [
                {id: "104866131128716891939", permission: "owner"}
            ]
        };
        var expectedResStat = 200;

        await presManager.createPres(req, res);
        
        console.log(res);
        expectedPres._id = res.body._id;
        expectedPres.__v = res.body.__v;

        expect(res.body).toEqual(expectedPres);
        expect(res.stat).toEqual(200);
    });
});


/**
 * dummy HTTP response object
 */

function Res() {
    this.body = null;
    this.stat = null;
}
Res.prototype.status = function (num) {
    this.stat = num;
}
Res.prototype.status.prototype.json = function (obj) {
    this.body = JSON.stringigy(obj);
}
Res.prototype.status.prototype.send = function (str) {
    this.body = str;
}
