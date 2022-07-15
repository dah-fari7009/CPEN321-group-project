const parserMocks = require("./parser.mocks.js");

test('Valid parse text', () => {
	return parserMocks.mockParse({body: {userID: 0, text: parserMocks.validParseText}}, {body: null})
		.then((data) => {
			expect(data).toEqual({title: "hello", cards: [], feedback: [], users: [{userID: 0, permission: "owner"}]});
		});
})
test('Invalid parse text', () => {
        return parserMocks.mockParse({body: {userID: 0, text: parserMocks.invalidParseText}}, {body: null})
                .then((data) => {
                        expect(data).toThrow({err: "No \\end{presentation} token found after \\begin{presentation}."});
                });
})

