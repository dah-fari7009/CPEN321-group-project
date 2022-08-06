const parser = require("../parser");
const unparser = require("../export");
const app = require("../../server");
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require('mongoose');
const User = require('../../models/users');
require('dotenv').config();

const USERID = "3";
const USERNAME = "jest user";
const REFRESHTOKEN = process.env.REFRESH;
const PRESENTATIONS = [];

let size = 6;
const testUnparseInput ={
    "title": "this is the title",
    "cards": [{
        "backgroundColor": "red",
        "transitionPhrase": "transition phrase",
        "endWithPause": 0,
        "front": {
            "backgroundColor": "front colour",
            "content": {
                "font": "front font",
                "style": "front style",
                "size": "front size",
                "colour": "front colour",
                "message": "> front message"
            }
        },
        "back": {
            "backgroundColor": "d",
            "content": {
                "font": "back font",
                "style": "back style",
                "size": "back size",
                "colour": "back colour",
                "message": "> back message \n> point 2"
            }
        }
    },
    {
        "backgroundColor": "d",
        "transitionPhrase": "w",
        "endWithPause": 0,
        "front": {
            "backgroundColor": "front colour",
            "content": {
                "font": "d",
                "style": "d",
                "size": "d",
                "colour": "d",
                "message": "d"
            }
        },
        "back": {
            "backgroundColor": "a",
            "content": {
                "font": "a",
                "style": "a",
                "size": "a",
                "colour": "a",
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

const expectedOutput = "\\begin{presentation}\n\t\\title this is the title\n\t\\begin{cuecard}[backgroundColor=red, transitionPhrase=transition phrase, endWithPause=0]\n\t\t\\begin{point}[backgroundColor=front colour, font=front font, style=front style, size=front size, colour=front colour]\n\t\t\t\\item front message\n\t\t\\end{point}\n\t\t\\begin{details}[backgroundColor=d, font=back font, style=back style, size=back size, colour=back colour]\n\t\t\t\\item back message\n\t\t\t\\item point 2\n\t\t\\end{details}\n\t\\end{cuecard}\n\t\\begin{cuecard}[backgroundColor=d, transitionPhrase=w, endWithPause=0]\n\t\t\\begin{point}[backgroundColor=front colour, font=d, style=d, size=d, colour=d]\n\t\t\t\\item d\n\t\t\\end{point}\n\t\t\\begin{details}[backgroundColor=a, font=a, style=a, size=a, colour=a]\n\t\t\t\\item a\n\t\t\\end{details}\n\t\\end{cuecard}\n\\end{presentation}";
const expectedMisspelledFieldOutput = "\\begin{presentation}\n\t\\title this is the title\n\t\\begin{cuecard}[backgroundColor=1, transitionPhrase=transition phrase, endWithPause=0]\n\t\t\\begin{point}[backgroundColor=2, font=front font, style=front style, size=3, colour=4]\n\t\t\t\\item front message\n\t\t\\end{point}\n\t\t\\begin{details}[backgroundColor=5, font=back font, style=back style, size=6, colour=7]\n\t\t\t\\item back message\n\t\t\t\\item point 2\n\t\t\\end{details}\n\t\\end{cuecard}\n\t\\begin{cuecard}[backgroundColor=1, transitionPhrase=w, endWithPause=0]\n\t\t\\begin{point}[backgroundColor=2, font=d, style=d, size=4, colour=5]\n\t\t\t\\item \n\t\t\\end{point}\n\t\t\\begin{details}[typo=5, font=a, size=6, colour=7]\n\t\t\t\\item a\n\t\t\\end{details}\n\t\\end{cuecard}\n\\end{presentation}";

const parserInput = "\\begin{presentation}\n\\title Sample Presentation: Speeches\n\n\\begin{cuecard[color=lime, endpause=true] % Background color is lime, expect\n% a pause (pause of length, in seconds,\n% > 1 standard deviation from pauses in\n% cuecard duration) after last point on\n% cue-card back is spoken\n\n\\point Speeches often start with a hook %front of cuecard\n\n\\begin{details}color=salmon] %back of cuecard\n\\item A hook is anything that grabs the audience's attention\n\\item Examples of hooks are anecdotes, jokes, $\"hot takes\"$ %strings enclosed with\"$\" will be highlighted\n\\item Knowing targed audience leads to better hooks %switch to next cue card when this item is spoken\n\\end{details}\n\n\\end{cuecard}\n\n\\begin{cuecard} %no color or endpause specified. Default values of color=white and endpause=true will be used\n\n\\point Bottom line upfront\n\n\\begin{details}\n\\item The audience needs to first know why they should pay attention to your speech\n\\item[color=red] Then, deliver on your promise\n\\end{details}\n\n\\end{cuecard}\n\n\\end{presentation}"

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

    test("unparse an invalid presentation", async () => {
        let req = {
            userID: USERID,
            pres: {title: "bad input"}
        }
        const res = await request.post('/api/export').send(req);
        expect(res.status).toEqual(400);
    })

    test("unparse a null presentation", async () => {
        let req = {
            userID: USERID,
            pres: null
        }
        const res = await request.post('/api/export').send(req);
        expect(res.status).toEqual(400);
    })

    test("unparse an empty presentation", async () => {
        let req = {
            userID: USERID,
            pres: {title: "bad input", cards: []}
        }
        const expected = "\\begin{presentation}\n\t\\title bad input\n\\end{presentation}";
        const res = await request.post('/api/export').send(req);
        expect(res.status).toEqual(200);
        expect(res.body.presStr).toEqual(expected);
    })

    test("unparse a presentation with a missing and misspelled field", async () => {
        let req = {
            userID: USERID,
            pres: misspelledFieldInput
        }
        const res = await request.post('/api/export').send(req);
        expect(res.status).toEqual(200);
        expect(res.body.presStr).toEqual(expectedMisspelledFieldOutput);
    })
});

describe("parse tests", () => {
    test("parse a string", async () => {
        let req = {
            userID: USERID,
            text: parserInput
        }
        const res = await request.put('/api/import').send(req);
        expect(res.status).toEqual(200);
    })

    test("parse with invalid userID", async () => {
        let req = {
            userID: 1329871372890897031287902130897213,
            text: parserInput
        }
        const res = await request.put('/api/import').send(req);
        expect(res.stat).toEqual(500);
    })

    test("parse with null userID", async () => {
        let req = {
            userID: null,
            text: parserInput
        }
        const res = await request.put('/api/import').send(req);
        expect(res.stat).toEqual(500);
    })

    test("parse with invalid text", async () => {
        let req = {
            userID: USERID,
            text: "invalid text"
        }
        const res = await request.put('/api/import').send(req);
        expect(res.stat).toEqual(500);
    })

    test("parse with null text", async () => {
        let req = {
            userID: USERID,
            text: null
        }
        const res = await request.put('/api/import').send(req);
        expect(res.stat).toEqual(500);
    })
});