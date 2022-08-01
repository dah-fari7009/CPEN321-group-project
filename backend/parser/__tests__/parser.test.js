const parser = require("../parser");
const unparser = require("../export");

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

let res = {
    stat: 100,
    msg: "yo",
    send: function(err){
        this.msg = err;
    },
    json: function(err){
        this.msg = err;
    },
    status: function(responseStatus) {
        this.stat = responseStatus;
        return this; 
    }
}


// tests message with one point, multiple points, a point without a '>' and an empty string
// test when inputs are empty strings or null
test("unparse a valid presentation", () => {
    unparser.unParsePresentation({body: testUnparseInput}, res)
    expect(res.stat).toEqual(200);
    expect(res.msg).toEqual(expectedOutput);
})

test("unparse an invalid presentation", () => {
    unparser.unParsePresentation({body: {title: "bad input"}}, res)
    expect(res.stat).toEqual(400);
    expect(res.msg).toEqual(new Error("unParse failed"));
})

test("unparse a null presentation", () => {
    unparser.unParsePresentation(null, res)
    expect(res.stat).toEqual(400);
    expect(res.msg).toEqual(new Error("unParse failed"));
})

test("unparse an empty presentation", () => {
    const expected = "\\begin{presentation}\n\t\\title bad input\n\\end{presentation}";
    unparser.unParsePresentation({body: {title: "bad input", cards: []}}, res)
    expect(res.stat).toEqual(200);
    expect(res.msg).toEqual(expected);
})

test("unparse a presentation with a missing and misspelled field", () => {
    unparser.unParsePresentation({body: misspelledFieldInput}, res)
    expect(res.stat).toEqual(200);
    expect(res.msg).toEqual(expectedMisspelledFieldOutput);
})

//parse
test("parse a string", async () => {
    parser.parse({body: {userID: 1, text: expectedOutput}}, res)
    expect(res.stat).toEqual(200);
    expect(res.msg).toEqual(testUnparseInput);
})

test("parse with invalid userID", () => {
    parser.parse({body: {userID: 1329871372890897031287902130897213, text: expectedOutput}}, res)
    expect(res.stat).toEqual(400);
})

test("parse with null userID", () => {
    parser.parse({body: {userID: null, text: expectedOutput}}, res)
    expect(res.stat).toEqual(400);
})

test("parse with invalid text", () => {
    parser.parse({body: {userID: 1, text: expectedMisspelledFieldOutput}}, res)
    expect(res.stat).toEqual(400);
})

test("parse with null text", () => {
    parser.parse({body: {userID: 1, text: null}}, res)
    expect(res.stat).toEqual(400);
})