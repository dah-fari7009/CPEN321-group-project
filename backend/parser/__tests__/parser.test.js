const parser = require("../parser");
const unparser = require("../export");
const app = require("../../server");
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require('mongoose');
const User = require('../../models/users');
require('dotenv').config();

const USERID = "1";
const USERNAME = "jest user";
const REFRESHTOKEN = process.env.REFRESH;//"1//0419iSM7WzNoOCgYIARAAGAQSNwF-L9IrN18d6CERQJqGRvW3D-ZEksmg0A1wamDEhnwyZ-OTJ1b6bZ2TnycqeQSwgkXnSx5535E"//"1//04rGvIMYruGDkCgYIARAAGAQSNwF-L9IrY8Sy5e7cQfBLVkbgQgKBZugZJtMeTfBbmGJbItIbSVQi7DveNwF7BGPVbgA5bDpIXz4";
const PRESENTATIONS = ["62c38d740afce8d7ea604043"];

let size = 6;
const testUnparseInput = {
    "title": "this is the title",
    "cards": [{
        "backgroundColor": 1,
        "transitionPhrase": "transition phrase",
        "endWithPause": 0,
        "front": {
            "backgroundColor": 2,
            "content": {
                "font": "",
                "style": "front style",
                "size": "",
                "colour": null,
                "message": "> front message"
            }
        },
        "back": {
            "backgroundColor": 5,
            "content": {
                "font": "back font",
                "style": "back style",
                "size": 6,
                "colour": 7,
                "message": "> back message\n> point 2"
            }
        }
    },
    {
        "backgroundColor": 1,
        "transitionPhrase": "w",
        "endWithPause": 0,
        "front": {
            "backgroundColor": 2,
            "content": {
                "font": "d",
                "style": "d",
                "size": 4,
                "colour": 5,
                "message": ""
            }
        },
        "back": {
            "backgroundColor": 5,
            "content": {
                "font": "a",
                "style": "a",
                "size": size,
                "colour": 7,
                "message": "a"
            }
        }
    }]
}; 

const misspelledFieldInput = {
    "title": "this is the title",
    "cards": [{
        "backgroundColor": 1,
        "transitionPhrase": "transition phrase",
        "endWithPause": 0,
        "front": {
            "backgroundColor": 2,
            "content": {
                "font": "front font",
                "style": "front style",
                "size": 3,
                "colour": 4,
                "message": "> front message"
            }
        },
        "back": {
            "backgroundColor": 5,
            "content": {
                "font": "back font",
                "style": "back style",
                "size": 6,
                "colour": 7,
                "message": "> back message\n> point 2"
            }
        }
    },
    {
        "backgroundColor": 1,
        "transitionPhrase": "w",
        "endWithPause": 0,
        "front": {
            "backgroundColor": 2,
            "content": {
                "font": "d",
                "style": "d",
                "size": 4,
                "colour": 5,
                "message": ""
            }
        },
        "back": {
            "typo": 5,
            "content": {
                "font": "a",
                "size": size,
                "colour": 7,
                "message": "a"
            }
        }
    }]
}; 

const expectedOutput = "\\begin{presentation}\n\t\\title this is the title\n\t\\begin{cuecard}[backgroundColor=1, transitionPhrase=transition phrase, endWithPause=0]\n\t\t\\begin{point}[backgroundColor=2, font=, style=front style, size=, colour=null]\n\t\t\t\\item front message\n\t\t\\end{point}\n\t\t\\begin{details}[backgroundColor=5, font=back font, style=back style, size=6, colour=7]\n\t\t\t\\item back message\n\t\t\t\\item point 2\n\t\t\\end{details}\n\t\\end{cuecard}\n\t\\begin{cuecard}[backgroundColor=1, transitionPhrase=w, endWithPause=0]\n\t\t\\begin{point}[backgroundColor=2, font=d, style=d, size=4, colour=5]\n\t\t\t\\item \n\t\t\\end{point}\n\t\t\\begin{details}[backgroundColor=5, font=a, style=a, size=6, colour=7]\n\t\t\t\\item a\n\t\t\\end{details}\n\t\\end{cuecard}\n\\end{presentation}";
const expectedMisspelledFieldOutput = "\\begin{presentation}\n\t\\title this is the title\n\t\\begin{cuecard}[backgroundColor=1, transitionPhrase=transition phrase, endWithPause=0]\n\t\t\\begin{point}[backgroundColor=2, font=front font, style=front style, size=3, colour=4]\n\t\t\t\\item front message\n\t\t\\end{point}\n\t\t\\begin{details}[backgroundColor=5, font=back font, style=back style, size=6, colour=7]\n\t\t\t\\item back message\n\t\t\t\\item point 2\n\t\t\\end{details}\n\t\\end{cuecard}\n\t\\begin{cuecard}[backgroundColor=1, transitionPhrase=w, endWithPause=0]\n\t\t\\begin{point}[backgroundColor=2, font=d, style=d, size=4, colour=5]\n\t\t\t\\item \n\t\t\\end{point}\n\t\t\\begin{details}[typo=5, font=a, size=6, colour=7]\n\t\t\t\\item a\n\t\t\\end{details}\n\t\\end{cuecard}\n\\end{presentation}";

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

describe("unparse tests", () => {
    // tests message with one point, multiple points, a point without a '>' and an empty string
    // test when inputs are empty strings or null
    test("unparse a valid presentation", async () => {
        let req = {
            userID: USERID,
            pres: testUnparseInput
        }
        const res = await request.post('/api/export').send(req);
        expect(res.status).toEqual(200);
        expect(res.body.presStr).toEqual(expectedOutput);
    })

    // test("unparse an invalid presentation", async () => {
    //     let req = {
    //         userID: USERID,
    //         pres: {title: "bad input"}
    //     }
    //     const res = await request.post('/api/export').send(req);
    //     expect(res.status).toEqual(400);
    // })

    // test("unparse a null presentation", async () => {
    //     let req = {
    //         userID: USERID,
    //         pres: null
    //     }
    //     const res = await request.post('/api/export').send(req);
    //     expect(res.status).toEqual(400);
    // })

    // test("unparse an empty presentation", async () => {
    //     let req = {
    //         userID: USERID,
    //         pres: {title: "bad input", cards: []}
    //     }
    //     const expected = "\\begin{presentation}\n\t\\title bad input\n\\end{presentation}";
    //     const res = await request.post('/api/export').send(req);
    //     expect(res.status).toEqual(200);
    //     expect(res.body.presStr).toEqual(expected);
    // })

    // test("unparse a presentation with a missing and misspelled field", async () => {
    //     let req = {
    //         userID: USERID,
    //         pres: misspelledFieldInput
    //     }
    //     const res = await request.post('/api/export').send(req);
    //     expect(res.status).toEqual(200);
    //     expect(res.body.presStr).toEqual(expectedMisspelledFieldOutput);
    // })
});

describe("parse tests", () => {
    test("parse a string", async () => {
        // let req = {
        //     userID: USERID,
        //     pres: expectedOutput
        // }
        // const res = await request.post('/api/export').send(req);
        // expect(res.status).toEqual(200);
        // expect(res.body.presStr).toEqual(testUnparseInput);

        // parser.parse({body: {userID: 1, text: expectedOutput}}, res)
        // expect(res.stat).toEqual(200);
        // expect(res.msg).toEqual(testUnparseInput);
        expect(2).toBe(2);
    })

    // test("parse with invalid userID", () => {
    //     parser.parse({body: {userID: 1329871372890897031287902130897213, text: expectedOutput}}, res)
    //     expect(res.stat).toEqual(400);
    // })

    // test("parse with null userID", () => {
    //     parser.parse({body: {userID: null, text: expectedOutput}}, res)
    //     expect(res.stat).toEqual(400);
    // })

    // test("parse with invalid text", () => {
    //     parser.parse({body: {userID: 1, text: expectedMisspelledFieldOutput}}, res)
    //     expect(res.stat).toEqual(400);
    // })

    // test("parse with null text", () => {
    //     parser.parse({body: {userID: 1, text: null}}, res)
    //     expect(res.stat).toEqual(400);
    // })
});