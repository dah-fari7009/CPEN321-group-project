// Mock parser.js and export.js (i.e. parse() from parser.js and unParsePresentation() from export.js)

const validParseText = "\\begin{presentation} \\title: hello \\end{presentation}";
const invalidParseText = "\\begin{presentation} \\title: hello";

const mockParse = jest.fn((req, res) => {
	return new Promise ((resolve, reject) => {
		var userID = req.body.userID;
		var text = req.body.text;
		setTimeout(() => {
			if (req.body.text === validParseText) resolve({title: "hello", cards: [], feedback: [], users: [{userID: req.body.userID, permission: "owner"}]});
			else if (req.body.text === invalidParseText) reject({err: "No \\end{presentation} token found after \\begin{presentation}."});
		}, 2000);
	});
	
}); 

// const mockUnParsePresentation = jest.fn();

module.exports = {
	validParseText,
	invalidParseText,
	mockParse
}
