const User = require('../models/users');
const axios = require('axios');
var qs = require('qs');
const { google } = require('googleapis');
require('dotenv').config();

//let refresh = "1//06oBf3IVYreBbCgYIARAAGAYSNwF-L9Ir5LT3aKOeRrACMcJljmCwGMS7fgbxHCJMBq836e5wG-X7k_26VwskeT507SRR4DjoqRw";
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

unParsePresentation = async (req, res) => {
    try {
        var pres = req.body.pres
        var indents = 0;
        var presStr = indent(indents) + "\\begin{presentation}\n";
        presStr += indent(indents + 1) + "\\title " + pres.title + "\n";
        presStr += unParseCard(pres.cards, indents + 1);
        presStr += indent(indents) + "\\end{presentation}";

        let user = await User.findOne({"userID": req.body.userID});
        var data = qs.stringify({
            'client_secret': CLIENT_SECRET,
            'grant_type': 'refresh_token',
            'refresh_token': user.refreshToken,
            'client_id': CLIENT_ID 
        });
        var config = {method: 'post', url: 'https://oauth2.googleapis.com/token', data : data,
            headers: { 
              'user-agent': 'google-oauth-playground', 
              'Content-Type': 'application/x-www-form-urlencoded'
            }            
        };
        let token = await axios(config)

        var createFile = {method: 'post', url: 'https://www.googleapis.com/upload/drive/v3/files', data : presStr,
            headers: { 
              'Authorization': 'Bearer ' + token.data.access_token, 
              'Content-Type': 'text/plain'
            }           
        };
        await axios(createFile);
        return res.status(200).send( { presStr } );
    } catch (e) {
        console.log("eeeror: " + e.message)
        return res.status(400).send( e.message );
    }
}

function unParseCard(cards, indents) {
    var cardStr = ""
    for (var i = 0; i < cards.length; i++) {
        var arr = getParams(cards[i]);

        //remove front and back from array; we will write that in another function
        if (arr.includes("front") || arr.includes("back")) {
            arr = arr.filter(data => (data != "front") && (data != "back"));
        }

        var paramStr = writeParams(cards[i], arr);
        var frontStr = unParseSide(cards[i].front, indents + 1, true);
        var backStr = unParseSide(cards[i].back, indents + 1, false);
        cardStr += indent(indents) + "\\begin{cuecard}" + paramStr + "\n";
        cardStr += frontStr + backStr;
        cardStr += indent(indents) + "\\end{cuecard}" + "\n";
    }
    return cardStr;
}


function unParseSide(side, indents, isFront) {
    var sideArr = getParams(side);
    var content = side.content;
    //remove content from array; we will write that in another function
    if (sideArr.includes("content")) {
        sideArr = sideArr.filter(data => data != "content");
    }
    var contentArr = getParams(content);
    if (contentArr.includes("message")) {
        contentArr = contentArr.filter(data => (data != "message"));
    }
    var contentParamStr = writeParams(content, contentArr);
    var sideParamStr = writeParams(side, sideArr);

    var paramStr = "";
    paramStr = sideParamStr.slice(0, -1) + ", " + contentParamStr.slice(1, contentParamStr.length);

    var contentStr = unParseContent(side.content, indents + 1);
    var tag = isFront ? "point" : "details"
    var sideStr = indent(indents) + `\\begin{${tag}}` + paramStr + "\n";
    sideStr += contentStr
    sideStr += indent(indents) + `\\end{${tag}}` + "\n";
    return sideStr;
}

function unParseContent(content, indents) {
    var messageArr = content.message.split("\n> ");
    if (messageArr[0] && messageArr[0].charAt(0) === ">") {
        messageArr[0] = messageArr[0].slice(1, messageArr[0].length).trim(); //chop off beginning bracket
    }
    var contentStr = "";
    for (var i = 0; i < messageArr.length; i++) {
        contentStr += indent(indents) + "\\item " + messageArr[i] + "\n"
    }
    return contentStr;
}

//gets fields of an object
function getParams(obj) {
    var arr = []
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            arr.push(key);
        }
    }
    return arr;
}

//turns an array of paramaters into a string of params ie. [colour=salmon, endpause=true]
function writeParams(obj, arr) {
    if (arr.length === 0) {
        return "";
    }

    var paramStr = "[";
    for (var i in arr) {
        paramStr += `${arr[i]}=${obj[arr[i]]}, `
    }


    paramStr = paramStr.slice(0, -2); //remove last comma and space
    paramStr += "]";
    return paramStr
}

function indent(num) {
    var str = "";
    for (var i = 0; i < num; i++) {
        str += "\t"
    }
    return str
}

module.exports = {
    unParsePresentation
}
