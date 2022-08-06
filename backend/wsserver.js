const express = require("express");
const mongoose = require("mongoose");
const presManager = require("./presManager/presManager")
const { WebSocketServer } = require("ws");
const WebSocket = require("ws");
const presentationUserMap = new Map();
const usermap = new Map();
const presentationFrontHistoryMap = new Map();
const presentationBackHistoryMap = new Map();
const presentationFrontHistoryPositionMap = new Map();
const presentationBackHistoryPositionMap = new Map();
const presentationMap = new Map();

const server = express().listen(80);

const wss = new WebSocketServer({server});
var mongooseConnect = async function () {

    await mongoose.connect("mongodb://localhost:27017/CPEN321", { useNewUrlParser: true });

}
mongooseConnect();



class History {
    constructor(before_text, recent_text, userID, start, end, undoEnd, diff) {
        this.before_text = before_text;
        this.recent_text = recent_text;
        this.userID = userID;
        this.start = start;
        this.end = end;
        this.undoEnd = undoEnd;
        this.diff = diff;
    }
    getBefore_text() {
        return this.before_text;
    }
    getRecent_text() {
        return this.recent_text;
    }
    getuserID() {
        return this.userID;
    }
}



wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + "-" + s4();
};


wss.on("connection",(ws) => {
    var position;
    var PID;
    var userID;
    var a;
    var cueCards_num;
    var newCard;
    var tmpcueCard;
    var tmpFrontHistory;
    var tmpBackHistory;
    var tmpFrontPosition;
    var tmpBackPosition;
    var cardFace;
    var userID;
    var before_text;
    var start;
    var end;
    var diff;
    var undoEnd;
    var undoHistory;
    var length;
    var redoHistory;
    console.log('server:A client logged in');
    ws.id = wss.getUniqueID();

    ws.on("close",() => {
        console.log("server:1 client disconnect");
        PID = usermap.get(ws.id);
        console.log("PID" +PID);
        var presentationID = usermap.get(ws.id).toString();
        console.log("presentationID" +presentationID);
        var num = presentationUserMap.get(PID);
        a = presentationMap.get(PID);
        if(num<2){
            presManager.savePresInternal(PID, a.title, a.cards, a.feedback).then((updatedPresentation) => {
                // things to be done after saving the presentation
                presentationUserMap.delete(PID);
                console.log("Delete presentation" +String(PID));
                presentationFrontHistoryMap.delete(PID);
                presentationBackHistoryMap.delete(PID);
                presentationFrontHistoryPositionMap.delete(PID);
                presentationBackHistoryPositionMap.delete(PID);

                presentationMap.delete(PID);
            }, (err) => {
                // things to do in case of error after attempt to save presentation
                console.log("save presentation fail" +err);
            });
            
        }
        else{
            presentationUserMap.set(PID,num-1);
            console.log("Client number left:" + (num-1));
        }
        usermap.delete(ws.id);
        console.log("Delete user" + ws.id);
    });

    ws.on("message", function message(data) {
        console.log("received: %s, %s", data, typeof data);
        var obj = JSON.parse(data);
        console.log(obj);

        //save history and send edit to change to all client

        if(Object.prototype.hasOwnProperty.call(obj, "edit") && Object.prototype.hasOwnProperty.call(obj, "before_text")){
            console.log("Edit!");
            PID = obj['presentationID'];
            cueCards_num = Number(obj['cueCards_num']);
            cardFace = Number(obj['cardFace']);
            recent_text = obj['recent_text'];
            userID = obj['userID'];
            var before_text = obj['before_text'];
            var start = Number(obj['start']);
            var end = Number(obj['end']);
            var undoEnd = Number(obj['undoEnd']);
            var diff = Number(obj['diff']);
            if(cardFace === 0){//front
                presentationMap.get(PID).cards[cueCards_num].front.content.message = recent_text;
                presentationFrontHistoryPositionMap.get(PID)[cueCards_num] = presentationFrontHistoryPositionMap.get(PID)[cueCards_num]+1;
                position = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
                presentationFrontHistoryMap.get(PID)[cueCards_num].splice(position,0,new History(before_text, recent_text, userID, start, end, undoEnd, diff));
                if(!((position + 1) >= presentationFrontHistoryMap.get(PID)[cueCards_num].length)){
                    presentationFrontHistoryMap.get(PID)[cueCards_num].splice(position+1);
                }
            }
            else if (cardFace === 1) {// back
                presentationMap.get(PID).cards[cueCards_num].back.content.message = recent_text;
                presentationBackHistoryPositionMap.get(PID)[cueCards_num] = presentationBackHistoryPositionMap.get(PID)[cueCards_num]+1;
                position = presentationBackHistoryPositionMap.get(PID)[cueCards_num];
                presentationBackHistoryMap.get(PID)[cueCards_num].splice(position,0,new History(before_text, recent_text, userID, start, end, undoEnd, diff));
                if(!((position + 1) >= presentationBackHistoryMap.get(PID)[cueCards_num].length)){
                    presentationBackHistoryMap.get(PID)[cueCards_num].splice(position+1);
                }
            }
            else{
                console.log("cardFace error");
            }
            console.log(presentationMap.get(PID)['cards'][cueCards_num].front);
            wss.clients.forEach(function each(client){
                if(client.readyState === WebSocket.OPEN){
                    client.send(data);
                    console.log("send to " + client.id);
                }
            });
        }

        //connect to the server

        else if(Object.prototype.hasOwnProperty.call(obj, "StartLiveCollaboration")  &&  Object.prototype.hasOwnProperty.call(obj, "presentationID")){
            console.log("Start Live Collaboration!");
            var PID = obj['presentationID'].toString();
            console.log("PID = " + PID);
            var userID = data.userID;
            if(presentationUserMap.has(PID)){//Not the first in the presentation
                console.log("Not first, id = " + ws.id);
                var a = presentationMap.get(PID);
                ws.send(JSON.stringify(a));
                var index = presentationUserMap.get(PID)+1;
                presentationUserMap.set(PID, index);
                usermap.set(ws.id, PID);
                console.log("Not first, id =" + ws.id);
                const wsIDMess = {
                    "wsserverID": 0
                }
                wsIDMess.wsID = ws.id;
                ws.send(JSON.stringify(wsIDMess));
            }
            else{//First in the presentation
                presentationUserMap.set(PID,1);
                usermap.set(ws.id, PID);

                //get presentation JSON from database by presentationID



                var a;
                presManager.getPresById(PID).then((pres) => {
                    a = pres;
                    console.log(a);

                    var count = Object.keys(a.cards).length;
                    presentationMap.set(PID,a);
                    var presentationFrontHistory = [];
                    var presentationBackHistory = [];
                    var presentationFrontHistoryPosition = [];
                    var presentationBackHistoryPosition = [];
                    for (i = 0; i < count; i++){
                        var presentationFrontCueCardHistory = [];
                        presentationFrontCueCardHistory.push(new History(a.cards[i].front.content.message,a.cards[i].front.content.message,"Initialize",0,0,0,0));
                        presentationFrontHistory.push(presentationFrontCueCardHistory);
                        var presentationBackCueCardHistory = [];
                        presentationBackCueCardHistory.push(new History(a.cards[i].front.content.message,a.cards[i].front.content.message,"Initialize",0,0,0,0));
                        presentationBackHistory.push(presentationBackCueCardHistory);
                        presentationFrontHistoryPosition.push(0);
                        presentationBackHistoryPosition.push(0);
                    }
                    presentationFrontHistoryMap.set(PID,presentationFrontHistory);
                    presentationBackHistoryMap.set(PID,presentationBackHistory);
                    presentationFrontHistoryPositionMap.set(PID,presentationFrontHistoryPosition);
                    presentationBackHistoryPositionMap.set(PID,presentationBackHistoryPosition);
                    console.log("First, id =" + ws.id);
                    ws.send(JSON.stringify(a));
                    const wsIDMess = {
                        "wsserverID": 0
                    }
                    wsIDMess.wsID = ws.id;
                    ws.send(JSON.stringify(wsIDMess));
                }).catch((err) => {
                    console.log("getPresByID fail： " + err);
                    error = err;
                })
                

                
            }
            
        }

        //add cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "add") && Object.prototype.hasOwnProperty.call(obj, "cueCards_num")){
            console.log("Add cueCard!");
            var PID = obj['presentationID'];
            var cueCards_num = Number(obj['cueCards_num']);

            var newCard = {
                backgroundColor: 9,
                transitionPhrase: '-',
                endWithPause: 1,
                front: {
                  backgroundColor: 1,
                  content: {
                    font: 'Times New Roman',
                    style: 'normalfont',
                    size: 12,
                    colour: 0,
                    message: ''
                  }
                },
                back: {
                  backgroundColor: 1,
                  content: {
                    font: 'Times New Roman',
                    style: 'normalfont',
                    size: 12,
                    colour: 0,
                    message: ''
                  }
                },
              };
            presentationMap.get(PID).cards.splice(cueCards_num,0,newCard);
            var presentationFrontCueCardHistory = [];
            presentationFrontCueCardHistory.push(new History('','',"Initialize",0,0,0,0));
            presentationFrontHistoryMap.get(PID).splice(cueCards_num,0,presentationFrontCueCardHistory);
            var presentationBackCueCardHistory = [];
            presentationBackCueCardHistory.push(new History('','',"Initialize",0,0,0,0));
            presentationBackHistoryMap.get(PID).splice(cueCards_num,0,presentationBackCueCardHistory);
            presentationFrontHistoryPositionMap.get(PID).splice(cueCards_num,0,0);
            presentationBackHistoryPositionMap.get(PID).splice(cueCards_num,0,0);
            
            wss.clients.forEach(function each(client){
                if(client.readyState === WebSocket.OPEN){
                    client.send(data);
                    console.log("send to " + client.id);
                }
            });
        }

        //delete cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "delete") && Object.prototype.hasOwnProperty.call(obj, "cueCards_num")){
            console.log("Delete cueCard!");
            var PID = obj['presentationID'];
            var cueCards_num = Number(obj['cueCards_num']);

            presentationMap.get(PID).cards.splice(cueCards_num,1);
            presentationFrontHistoryMap.get(PID).splice(cueCards_num,1);
            presentationBackHistoryMap.get(PID).splice(cueCards_num,1);
            presentationFrontHistoryPositionMap.get(PID).splice(cueCards_num,1);
            presentationBackHistoryPositionMap.get(PID).splice(cueCards_num,1);

            wss.clients.forEach(function each(client){
                if(client.readyState === WebSocket.OPEN){
                    client.send(data);
                    console.log("send to " + client.id);
                }
            });
        }

        //delete last cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "deleteLast") && Object.prototype.hasOwnProperty.call(obj, "userID")){
            console.log("Delete last cueCard!");
            var PID = obj['presentationID'];
            var cueCards_num = Number(obj['cueCards_num']);
            var newCard = {
                backgroundColor: 9,
                transitionPhrase: '-',
                endWithPause: 1,
                front: {
                  backgroundColor: 1,
                  content: {
                    font: 'Times New Roman',
                    style: 'normalfont',
                    size: 12,
                    colour: 0,
                    message: ''
                  }
                },
                back: {
                  backgroundColor: 1,
                  content: {
                    font: 'Times New Roman',
                    style: 'normalfont',
                    size: 12,
                    colour: 0,
                    message: ''
                  }
                },
            };
            presentationMap.get(PID).cards.splice(0,1,newCard);
            var presentationCueCardHistory = [];
            presentationCueCardHistory.push(new History('','',"Initialize",0,0,0,0));
            presentationFrontHistoryMap.get(PID).splice(0,1,presentationCueCardHistory);
            presentationBackHistoryMap.get(PID).splice(0,1,presentationCueCardHistory);
            presentationFrontHistoryPositionMap.get(PID).splice(0,1,0);
            presentationBackHistoryPositionMap.get(PID).splice(0,1,0);
            wss.clients.forEach(function each(client){
                if(client.readyState === WebSocket.OPEN){
                    client.send(data);
                    console.log("send to " + client.id);
                }
            });
        }

        //swap last cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "swapLast") && Object.prototype.hasOwnProperty.call(obj, "cueCards_num")){
            console.log("Swap last cueCard!");
            var PID = obj['presentationID'];
            var cueCards_num = Number(obj['cueCards_num']);

            var tmpcueCard = presentationMap.get(PID).cards[cueCards_num];
            presentationMap.get(PID).cards.splice(cueCards_num,1);
            presentationMap.get(PID).cards.splice(cueCards_num-1,0,tmpcueCard);
            var tmpFrontHistory = presentationFrontHistoryMap.get(PID)[cueCards_num];
            presentationFrontHistoryMap.get(PID).splice(cueCards_num,1);
            presentationFrontHistoryMap.get(PID).splice(cueCards_num-1,0,tmpFrontHistory);
            var tmpBackHistory = presentationBackHistoryMap.get(PID)[cueCards_num];
            presentationBackHistoryMap.get(PID).splice(cueCards_num,1);
            presentationBackHistoryMap.get(PID).splice(cueCards_num-1,0,tmpBackHistory);
            var tmpFrontPosition = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
            presentationFrontHistoryPositionMap.get(PID).splice(cueCards_num,1);
            presentationFrontHistoryPositionMap.get(PID).splice(cueCards_num-1,0,tmpFrontPosition);
            var tmpBackPosition = presentationBackHistoryPositionMap.get(PID)[cueCards_num];
            presentationBackHistoryPositionMap.get(PID).splice(cueCards_num,1);
            presentationBackHistoryPositionMap.get(PID).splice(cueCards_num-1,0,tmpBackPosition);

            wss.clients.forEach(function each(client){
                if(client.readyState === WebSocket.OPEN){
                    client.send(data);
                    console.log("send to " + client.id);
                }
            });
        }

        //swap next cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "swapNext") && Object.prototype.hasOwnProperty.call(obj, "cueCards_num")){
            console.log("Swap next cueCard!");
            var PID = obj['presentationID'];
            var cueCards_num = Number(obj['cueCards_num']);

            var tmpcueCard = presentationMap.get(PID).cards[cueCards_num];
            presentationMap.get(PID).cards.splice(cueCards_num,1);
            presentationMap.get(PID).cards.splice(cueCards_num+1,0,tmpcueCard);
            var tmpFrontHistory = presentationFrontHistoryMap.get(PID)[cueCards_num];
            presentationFrontHistoryMap.get(PID).splice(cueCards_num,1);
            presentationFrontHistoryMap.get(PID).splice(cueCards_num+1,0,tmpFrontHistory);
            var tmpBackHistory = presentationBackHistoryMap.get(PID)[cueCards_num];
            presentationBackHistoryMap.get(PID).splice(cueCards_num,1);
            presentationBackHistoryMap.get(PID).splice(cueCards_num+1,0,tmpBackHistory);
            var tmpFrontPosition = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
            presentationFrontHistoryPositionMap.get(PID).splice(cueCards_num,1);
            presentationFrontHistoryPositionMap.get(PID).splice(cueCards_num+1,0,tmpFrontPosition);
            var tmpBackPosition = presentationBackHistoryPositionMap.get(PID)[cueCards_num];
            presentationBackHistoryPositionMap.get(PID).splice(cueCards_num,1);
            presentationBackHistoryPositionMap.get(PID).splice(cueCards_num+1,0,tmpBackPosition);

            wss.clients.forEach(function each(client){
                if(client.readyState === WebSocket.OPEN){
                    client.send(data);
                    console.log("send to " + client.id);
                }
            });
        }

        //undo cueCard: if undo self or undoRedoEveryOne == true, send it to all clients, else send check command back to ensure whether undo

        else if(Object.prototype.hasOwnProperty.call(obj, "undo") && Object.prototype.hasOwnProperty.call(obj, "cueCards_num")){
            console.log("Undo!");
            var PID = obj['presentationID'];
            var cueCards_num = Number(obj['cueCards_num']);
            var cardFace = Number(obj['cardFace']);
            var userID = obj['userID'];
            var undoRedoSure = Number(obj['undoRedoSure']);

            if(undoRedoSure === 0){//won't skip user check step
        
                if(cardFace === 0){//front
                    var position = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
                    if(position <=0){
                        const presentationMess = {
                            "lastHistory": 0
                        }
                        //const tmpPresentationMess = JSON.parse(presentationMess);
                        presentationMess.cueCards_num = cueCards_num;
                        presentationMess.presentationID = PID;
                        presentationMess.userID = userID;
                        const message = JSON.stringify(presentationMess);
                        ws.send(message);
                        console.log("Undo last history!");
                        return;
                    }
                    var undoHistory = presentationFrontHistoryMap.get(PID)[cueCards_num][position];
                    if(undoHistory.userID === userID){
                        var before_text = undoHistory.before_text;
                        var start = undoHistory.start;
                        var diff = undoHistory.diff;
                        var undoEnd = undoHistory.undoEnd;
                        presentationMap.get(PID).cards[cueCards_num].front.content.message=before_text;
                        position = position -1;
                        presentationFrontHistoryPositionMap.get(PID)[cueCards_num] = position;
                        const presentationMess = {
                            "edit": 0
                        }
                        
                        presentationMess.cueCards_num = cueCards_num;
                        presentationMess.presentationID = PID;
                        presentationMess.userID = userID;
                        presentationMess.cardFace = cardFace;
                        presentationMess.recent_text = before_text;
                        presentationMess.start = start;
                        presentationMess.end = undoEnd;
                        presentationMess.diff = -diff;
                        presentationMess.userID = "Initialize";
                        const message = JSON.stringify(presentationMess);
                        wss.clients.forEach(function each(client){
                            if(client.readyState === WebSocket.OPEN){
                                client.send(message);
                                console.log("send to " + client.id);
                            }
                        });
                    }
                    else{
                        const presentationMess = {
                            "undoSure": 0
                        }
                        //const tmpPresentationMess = JSON.parse(presentationMess);
                        presentationMess.cueCards_num = cueCards_num;
                        presentationMess.presentationID = PID;
                        presentationMess.userID = userID;
                        const message = JSON.stringify(presentationMess);
                        ws.send(message);
                    }
                }
                else if (cardFace === 1){//back
                    var position = presentationBackHistoryPositionMap.get(PID)[cueCards_num];
                    if(position <=0){
                        const presentationMess = {
                            "lastHistory": 0
                        }
                        console.log("Undo last history!");
                        presentationMess.cueCards_num = cueCards_num;
                        presentationMess.presentationID = PID;
                        presentationMess.userID = userID;
                        
                        const message = JSON.stringify(presentationMess);
                        ws.send(message);
                        return;
                    }
                    var undoHistory = presentationBackHistoryMap.get(PID)[cueCards_num][position];
                    if(undoHistory.userID === userID){
                        var before_text = undoHistory.before_text;
                        var start = undoHistory.start;
                        var diff = undoHistory.diff;
                        var undoEnd = undoHistory.undoEnd;
                        presentationMap.get(PID).cards[cueCards_num].back.content.message=before_text;
                        position = position -1;
                        presentationBackHistoryPositionMap.get(PID)[cueCards_num] = position;
                        const presentationMess = {
                            "edit": 0
                        }
                        presentationMess.cueCards_num = cueCards_num;
                        presentationMess.presentationID = PID;
                        presentationMess.userID = userID;
                        presentationMess.cardFace = cardFace;
                        presentationMess.recent_text = before_text;
                        presentationMess.start = start;
                        presentationMess.end = undoEnd;
                        presentationMess.diff = -diff;
                        presentationMess.userID = "Initialize";
                        const message = JSON.stringify(presentationMess);
                        wss.clients.forEach(function each(client){
                            if(client.readyState === WebSocket.OPEN){
                                client.send(message);
                                console.log("send to " + client.id);
                            }
                        });
                    }
                    else{
                        const presentationMess = {
                            "undoSure": 0
                        }
                        presentationMess.cueCards_num = cueCards_num;
                        presentationMess.presentationID = PID;
                        presentationMess.userID = userID;
                        const message = JSON.stringify(presentationMess);
                        ws.send(message);
                    }
                }
                else{
                    console.log("CardFace error!");
                }
            }
            else{
                if(cardFace === 0){
                    var position = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
                    if(position <=0){
                        const presentationMess = {
                            "lastHistory": 0
                        }
                        console.log("Undo last history!");
                        presentationMess.cueCards_num = cueCards_num;
                        presentationMess.presentationID = PID;
                        presentationMess.userID = userID;
                        
                        const message = JSON.stringify(presentationMess);
                        ws.send(message);
                        return;
                    }
                    var undoHistory = presentationFrontHistoryMap.get(PID)[cueCards_num][position];
                    
                    var before_text = undoHistory.before_text;
                    var start = undoHistory.start;
                    var diff = undoHistory.diff;
                    var undoEnd = undoHistory.undoEnd;
                    presentationMap.get(PID).cards[cueCards_num].front.content.message=before_text;
                    position = position -1;
                    presentationFrontHistoryPositionMap.get(PID)[cueCards_num] = position;
                    const presentationMess = {
                        "edit": 0
                    }
                    presentationMess.cueCards_num = cueCards_num;
                    presentationMess.presentationID = PID;
                    presentationMess.userID = userID;
                    presentationMess.cardFace = cardFace;
                    presentationMess.recent_text = before_text;
                    presentationMess.start = start;
                    presentationMess.end = undoEnd;
                    presentationMess.diff = -diff;
                    presentationMess.userID = "Initialize";
                    console.log(presentationMess);
                    const message = JSON.stringify(presentationMess);
                    wss.clients.forEach(function each(client){
                        if(client.readyState === WebSocket.OPEN){
                            client.send(message);
                            console.log("send to " + client.id);
                        }
                    });
                    
                }
                else{
                    var position = presentationBackHistoryPositionMap.get(PID)[cueCards_num];
                    if(position <=0){
                        const presentationMess = {
                            "lastHistory": 0
                        }
                        console.log("Undo last history!");
                        presentationMess.cueCards_num = cueCards_num;
                        presentationMess.presentationID = PID;
                        presentationMess.userID = userID;
                        const message = JSON.stringify(presentationMess);
                        ws.send(message);
                        return;
                    }
                    var undoHistory = presentationBackHistoryMap.get(PID)[cueCards_num][position];
                    
                    var before_text = undoHistory.before_text;
                    var start = undoHistory.start;
                    var diff = undoHistory.diff;
                    var undoEnd = undoHistory.undoEnd;
                    presentationMap.get(PID).cards[cueCards_num].back.content.message=before_text;
                    position = position -1;
                    presentationBackHistoryPositionMap.get(PID)[cueCards_num] = position;
                    const presentationMess = {
                        "edit": 0
                    }
                    presentationMess.cueCards_num = cueCards_num;
                    presentationMess.presentationID = PID;
                    presentationMess.userID = userID;
                    presentationMess.cardFace = cardFace;
                    presentationMess.recent_text = before_text;
                    presentationMess.start = start;
                    presentationMess.end = undoEnd;
                    presentationMess.diff = -diff;
                    presentationMess.userID = "Initialize";
                    console.log(presentationMess);
                    const message = JSON.stringify(presentationMess);
                    wss.clients.forEach(function each(client){
                        if(client.readyState === WebSocket.OPEN){
                            client.send(message);
                            console.log("send to " + client.id);
                        }
                    });
                }
                
            }
        }

        //undoSure cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "undoSure") && Object.prototype.hasOwnProperty.call(obj, "cueCards_num")){
            console.log("UndoSure!");
            var PID = obj['presentationID'];
            var cueCards_num = Number(obj['cueCards_num']);
            var cardFace = Number(obj['cardFace']);
            var userID = obj['userID'];
            if(cardFace === 0){
                var position = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
                if(position <=0){
                    const presentationMess = {
                        "lastHistory": 0
                    }
                    console.log("Undo last history!");
                    presentationMess.cueCards_num = cueCards_num;
                    presentationMess.presentationID = PID;
                    presentationMess.userID = userID;
                    const message = JSON.stringify(presentationMess);
                    ws.send(message);
                    return;
                }
                var undoHistory = presentationFrontHistoryMap.get(PID)[cueCards_num][position];
                
                var before_text = undoHistory.before_text;
                var start = undoHistory.start;
                var diff = undoHistory.diff;
                var undoEnd = undoHistory.undoEnd;
                presentationMap.get(PID).cards[cueCards_num].front.content.message=before_text;
                position = position -1;
                presentationFrontHistoryPositionMap.get(PID)[cueCards_num] = position;
                const presentationMess = {
                    "edit": 0
                }
                presentationMess.cueCards_num = cueCards_num;
                presentationMess.presentationID = PID;
                presentationMess.userID = userID;
                presentationMess.cardFace = cardFace;
                presentationMess.recent_text = before_text;
                presentationMess.start = start;
                presentationMess.end = undoEnd;
                presentationMess.diff = -diff;
                presentationMess.userID = "Initialize";
                console.log(presentationMess);
                const message = JSON.stringify(presentationMess);
                wss.clients.forEach(function each(client){
                    if(client.readyState === WebSocket.OPEN){
                        client.send(message);
                        console.log("send to " + client.id);
                    }
                });
                
            }
            else{
                var position = presentationBackHistoryPositionMap.get(PID)[cueCards_num];
                if(position <=0){
                    const presentationMess = {
                        "lastHistory": 0
                    }
                    console.log("Undo last history!");
                    presentationMess.cueCards_num = cueCards_num;
                    presentationMess.presentationID = PID;
                    presentationMess.userID = userID;
                    const message = JSON.stringify(presentationMess);
                    ws.send(message);
                    return;
                }
                var undoHistory = presentationBackHistoryMap.get(PID)[cueCards_num][position];
                
                var before_text = undoHistory.before_text;
                var start = undoHistory.start;
                var diff = undoHistory.diff;
                var undoEnd = undoHistory.undoEnd;
                presentationMap.get(PID).cards[cueCards_num].back.content.message=before_text;
                position = position -1;
                presentationBackHistoryPositionMap.get(PID)[cueCards_num] = position;
                const presentationMess = {
                    "edit": 0
                }
                presentationMess.cueCards_num = cueCards_num;
                presentationMess.presentationID = PID;
                presentationMess.userID = userID;
                presentationMess.cardFace = cardFace;
                presentationMess.recent_text = before_text;
                presentationMess.start = start;
                presentationMess.end = undoEnd;
                presentationMess.diff = -diff;
                presentationMess.userID = "Initialize";
                console.log(presentationMess);
                const message = JSON.stringify(presentationMess);
                wss.clients.forEach(function each(client){
                    if(client.readyState === WebSocket.OPEN){
                        client.send(message);
                        console.log("send to " + client.id);
                    }
                });
            }
        }

        //redo cueCard: if redo self or undoRedoEveryOne == true, send it to all clients, else send check command back to ensure whether undo

        else if(Object.prototype.hasOwnProperty.call(obj, "redo") && Object.prototype.hasOwnProperty.call(obj, "cueCards_num")){
            console.log("Redo");
            var PID = obj['presentationID'];
            var cueCards_num = Number(obj['cueCards_num']);
            var cardFace = Number(obj['cardFace']);
            var userID = obj['userID'];
            if(cardFace === 0){//front
                var position = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
                var length = presentationFrontHistoryMap.get(PID)[cueCards_num].length;
                if(position >= (length-1)){//check position 
                    const presentationMess = {
                        "firstHistory": 0
                    }
                    console.log("Redo first history!");
                    presentationMess.cueCards_num = cueCards_num;
                    presentationMess.presentationID = PID;
                    presentationMess.userID = userID;
                    const message = JSON.stringify(presentationMess);
                    ws.send(message);
                    return;
                }
                var redoHistory = presentationFrontHistoryMap.get(PID)[cueCards_num][position+1];
                
                var recent_text = redoHistory.recent_text;
                var start = redoHistory.start;
                var end = redoHistory.end;
                var diff = redoHistory.diff;
                presentationMap.get(PID).cards[cueCards_num].front.content.message=recent_text;
                position = position + 1;
                presentationFrontHistoryPositionMap.get(PID)[cueCards_num] = position;
                const presentationMess = {
                    "edit": 0
                }
                presentationMess.cueCards_num = cueCards_num;
                presentationMess.presentationID = PID;
                presentationMess.userID = userID;
                presentationMess.cardFace = cardFace;
                presentationMess.recent_text = recent_text;
                presentationMess.start = start;
                presentationMess.end = end;
                presentationMess.diff = diff;
                presentationMess.userID = "Initialize";
                console.log(presentationMess);
                const message = JSON.stringify(presentationMess);
                wss.clients.forEach(function each(client){
                    if(client.readyState === WebSocket.OPEN){
                        client.send(message);
                        console.log("send to " + client.id);
                    }
                });
            }
            else if (cardFace === 1){//back
                var position = presentationBackHistoryPositionMap.get(PID)[cueCards_num];
                var length = presentationBackHistoryMap.get(PID)[cueCards_num].length;
                if(position >= (length-1)){//check position 
                    const presentationMess = {
                        "firstHistory": 0
                    }
                    console.log("Redo first history!");
                    presentationMess.cueCards_num = cueCards_num;
                    presentationMess.presentationID = PID;
                    presentationMess.userID = userID;
                    const message = JSON.stringify(presentationMess);
                    ws.send(message);
                    return;
                }
                var redoHistory = presentationBackHistoryMap.get(PID)[cueCards_num][position+1];
                var recent_text = redoHistory.recent_text;
                var start = redoHistory.start;
                var end = redoHistory.end;
                var diff = redoHistory.diff;
                presentationMap.get(PID).cards[cueCards_num].back.content.message=recent_text;
                position = position + 1;
                presentationBackHistoryPositionMap.get(PID)[cueCards_num] = position;
                const presentationMess = {
                    "edit": 0
                }
                presentationMess.cueCards_num = cueCards_num;
                presentationMess.presentationID = PID;
                presentationMess.userID = userID;
                presentationMess.cardFace = cardFace;
                presentationMess.recent_text = recent_text;
                presentationMess.start = start;
                presentationMess.end = end;
                presentationMess.diff = diff;
                presentationMess.userID = "Initialize";
                console.log(presentationMess);
                const message = JSON.stringify(presentationMess);
                wss.clients.forEach(function each(client){
                    if(client.readyState === WebSocket.OPEN){
                        client.send(message);
                        console.log("send to " + client.id);
                    }
                });

            }
            else{
                console.log("CardFace error!");
            }
        }

        //Refresh presentation to specific client

        else if(Object.prototype.hasOwnProperty.call(obj, "refreshPresentation")){
            console.log("Refresh Presentation");
            var PID = obj['presentationID'];
            var a = presentationMap.get(PID);
            ws.send(JSON.stringify(a));

            //save presentation to the database

        }    
        
        else{
            console.log("Other message error");
        }
      });

})
