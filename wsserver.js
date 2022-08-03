const express = require("express");
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


class history {
    constructor(before_text, recent_text, userID) {
        this.before_text = before_text;
        this.recent_text = recent_text;
        this.userID = userID;
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

wss.warning = function( warningMessage ) {
    wss.clients.forEach(function each(client){
        if(client !== ws && client.readyState === WebSocket.OPEN){
            client.send(warningMessage);
            console.log(warningMessage + " send to " + client.id);
        }
    });
}

wss.on("connection",(ws) => {
    console.log('server:A client logged in');
    ws.id = wss.getUniqueID();

    ws.on("close",() => {
        console.log("server:1 client disconnect");
        var PID = usermap.get(ws.id);
        var num = presentationUserMap.get(PID);
        if(num<2){
            presentationUserMap.delete(PID);
            console.log("Delete presentation" +String(PID));
            presentationFrontHistoryMap.delete(PID);
            presentationBackHistoryMap.delete(PID);
            presentationFrontHistoryPositionMap.delete(PID);
            presentationBackHistoryPositionMap.delete(PID);

            //save presentation
            var pres = presentationMap.get(PID); 

            presentationMap.delete(PID);
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
            var PID = data.presentationID;
            var cueCards_num = Number(data.cueCards_num);
            var cardFace = Number(data.cardFace);
            var recent_text = data.recent_text;
            var userID = data.userID;
            var before_text = data.before_text;
            if(cardFace = 0){//front
                presentationMap.get(PID).cards[cueCards_num].front.message = recent_text;
                presentationFrontHistoryPositionMap.get(PID)[cueCards_num] = presentationFrontHistoryPositionMap.get(PID)[cueCards_num]+1;
                var position = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
                presentationFrontHistoryMap.get(PID)[cueCards_num].splice(position,0,new history(before_text, recent_text, userID));
                if(!((position + 1) >= presentationFrontHistoryMap.get(PID)[cueCards_num].length)){
                    presentationFrontHistoryMap.get(PID)[cueCards_num].splice(position+1);
                }
            }
            else if (cardFace = 1) {// back
                presentationMap.get(PID).cards[cueCards_num].back.message = recent_text;
                presentationBackHistoryPositionMap.get(PID)[cueCards_num] = presentationBackHistoryPositionMap.get(PID)[cueCards_num]+1;
                var position = presentationBackHistoryPositionMap.get(PID)[cueCards_num];
                presentationBackHistoryMap.get(PID)[cueCards_num].splice(position,0,new history(before_text, recent_text, userID));
                if(!((position + 1) >= presentationBackHistoryMap.get(PID)[cueCards_num].length)){
                    presentationBackHistoryMap.get(PID)[cueCards_num].splice(position+1);
                }
            }
            else{
                wss.warning("cardFace Error");
            }
            wss.clients.forEach(function each(client){
                if(client !== ws && client.readyState === WebSocket.OPEN){
                    client.send(data);
                    console.log("send to " + client.id);
                }
            });
        }

        //connect to the server

        else if(Object.prototype.hasOwnProperty.call(obj, "StartLiveCollaboration")  &&  Object.prototype.hasOwnProperty.call(obj, "presentationID")){
            console.log("Start Live Collaboration!");
            var PID = data.presentationID;
            console.log("PID = " + PID);
            var userID = data.userID;
            if(presentationUserMap.has(PID)){//Not the first in the presentation
                wss.clients.forEach(function each(client){
                    if(client !== ws && client.readyState === WebSocket.OPEN){
                        var presentationMessage = presentationMap.get(PID);
                        client.send(JSON.stringify(presentationMessage));
                    }
                });
                var index = presentationUserMap.get(PID)+1;
                presentationUserMap.set(PID, index);
                usermap.set(ws.id, PID);
                console.log("Not first, id =" + ws.id);
            }
            else{//First in the presentation
                presentationUserMap.set(PID,1);
                usermap.set(ws.id, PID);

                //get presentation JSON from database by presentationID

                

                var a = {
                    //_id: ObjectId("62e6f42bef901099b2b2d634"),
                    title: ' Sample Presentation: Speeches',
                    cards: [
                      {
                        backgroundColor: 9,
                        transitionPhrase: ' Knowing targed audience leads to better hooks',
                        endWithPause: 1,
                        front: {
                          backgroundColor: 1,
                          content: {
                            font: 'Times New Roman',
                            style: 'normalfont',
                            size: 12,
                            colour: 0,
                            message: ' Speeches often start with a hook'
                          }
                        },
                        back: {
                          backgroundColor: 1,
                          content: {
                            font: 'Times New Roman',
                            style: 'normalfont',
                            size: 12,
                            colour: 0,
                            message: '\n' +
                              " > A hook is anything that grabs the audience's attention\n" +
                              ' > Examples of hooks are anecdotes, jokes, $"hot takes"$\n' +
                              ' > Knowing target audience leads to better hooks'
                          }
                        },
                        //_id: ObjectId("62e84adfab620c1f7ee70c4f")
                      },
                      {
                        backgroundColor: 1,
                        transitionPhrase: ' Then, deliver on your promise',
                        endWithPause: 1,
                        front: {
                          backgroundColor: 1,
                          content: {
                            font: 'Times New Roman',
                            style: 'normalfont',
                            size: 12,
                            colour: 0,
                            message: ' Bottom line upfront'
                          }
                        },
                        back: {
                          backgroundColor: 1,
                          content: {
                            font: 'Times New Roman',
                            style: 'normalfont',
                            size: 12,
                            colour: 2,
                            message: '\n' +
                              ' > The audience needs to first know why they should pay attention to your speech\n' +
                              ' > Then, deliver on your promise'
                          }
                        },
                        //_id: ObjectId("62e84adfab620c1f7ee70c50")
                      }
                    ],
                    feedback: [],
                    users: [
                      {
                        id: '104866131128716891939',
                        permission: 'owner',
                        //_id: ObjectId("62e6f42bef901099b2b2d637")
                      }
                    ],
                    __v: 0
                }
                var count = Object.keys(a.cards).length;
                presentationMap.set(PID,a);
                var presentationFrontHistory = [];
                var presentationBackHistory = [];
                var presentationFrontHistoryPosition = [];
                var presentationBackHistoryPosition = [];
                for (i = 0; i < count; i++){
                    var presentationFrontCueCardHistory = [];
                    presentationFrontCueCardHistory.push(new history(a.cards[i].front.content.message,a.cards[i].front.content.message,"Initialize"));
                    presentationFrontHistory.push(presentationFrontCueCardHistory);
                    var presentationBackCueCardHistory = [];
                    presentationBackCueCardHistory.push(new history(a.cards[i].front.content.message,a.cards[i].front.content.message,"Initialize"));
                    presentationBackHistory.push(presentationBackCueCardHistory);
                    presentationFrontHistoryPosition.push(0);
                    presentationBackHistoryPosition.push(0);
                }
                presentationFrontHistoryMap.set(PID,presentationFrontHistory);
                presentationBackHistoryMap.set(PID,presentationBackHistory);
                presentationFrontHistoryPositionMap.set(PID,presentationFrontHistoryPosition);
                presentationBackHistoryPositionMap.set(PID,presentationBackHistoryPosition);
                console.log("First, id =" + ws.id);
                wss.send(a);
            }
            
        }

        //add cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "add") && Object.prototype.hasOwnProperty.call(obj, "cueCard_num")){
            console.log("Add cueCard!");
            var PID = data.presentationID;
            var cueCards_num = Number(data.cueCards_num);

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
            presentationMap.get(PID)[cards].splice(cueCards_num,0,newCard);
            var presentationFrontCueCardHistory = [];
            presentationFrontCueCardHistory.push(new history('','',"Initialize"));
            presentationFrontHistoryMap.get(PID).splice(cueCards_num,0,presentationFrontCueCardHistory);
            var presentationBackCueCardHistory = [];
            presentationBackCueCardHistory.push(new history('','',"Initialize"));
            presentationBackHistoryMap.get(PID).splice(cueCards_num,0,presentationBackCueCardHistory);
            presentationFrontHistoryPositionMap.get(PID).splice(cueCards_num,0,0);
            presentationBackHistoryPositionMap.get(PID).splice(cueCards_num,0,0);
            
            wss.clients.forEach(function each(client){
                if(client !== ws && client.readyState === WebSocket.OPEN){
                    client.send(data);
                    console.log("send to " + client.id);
                }
            });
        }

        //delete cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "delete") && Object.prototype.hasOwnProperty.call(obj, "cueCard_num")){
            console.log("Delete cueCard!");
            var PID = data.presentationID;
            var cueCards_num = Number(data.cueCards_num);

            presentationMap.get(PID)[cards].splice(cueCards_num,1);
            presentationFrontHistoryMap.get(PID).splice(cueCards_num,1);
            presentationBackHistoryMap.get(PID).splice(cueCards_num,1);
            presentationFrontHistoryPositionMap.get(PID).splice(cueCards_num,1);
            presentationBackHistoryPositionMap.get(PID).splice(cueCards_num,1);

            wss.clients.forEach(function each(client){
                if(client !== ws && client.readyState === WebSocket.OPEN){
                    client.send(data);
                    console.log("send to " + client.id);
                }
            });
        }

        //delete last cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "deleteLast") && Object.prototype.hasOwnProperty.call(obj, "userID")){
            console.log("Delete last cueCard!");
            var PID = data.presentationID;
            var cueCards_num = Number(data.cueCards_num);
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
            presentationMap.get(PID)[cards].splice(0,1,newCard);
            var presentationCueCardHistory = [];
            presentationFrontCueCardHistory.push(new history('','',"Initialize"));
            presentationFrontHistoryMap.get(PID).splice(0,1,presentationCueCardHistory);
            presentationBackHistoryMap.get(PID).splice(0,1,presentationCueCardHistory);
            presentationFrontHistoryPositionMap.get(PID).splice(0,1,0);
            presentationBackHistoryPositionMap.get(PID).splice(0,1,0);
            wss.clients.forEach(function each(client){
                if(client !== ws && client.readyState === WebSocket.OPEN){
                    client.send(data);
                    console.log("send to " + client.id);
                }
            });
        }

        //swap last cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "swapLast") && Object.prototype.hasOwnProperty.call(obj, "cueCard_num")){
            console.log("Swap last cueCard!");
            var PID = data.presentationID;
            var cueCards_num = Number(data.cueCards_num);

            var tmpcueCard = presentationMap.get(PID).cards[cueCards_num];
            presentationMap.get(PID)[cards].splice(cueCards_num,1);
            presentationMap.get(PID)[cards].splice(cueCards_num-1,0,tmpcueCard);
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
                if(client !== ws && client.readyState === WebSocket.OPEN){
                    client.send(data);
                    console.log("send to " + client.id);
                }
            });
        }

        //swap next cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "swapNext") && Object.prototype.hasOwnProperty.call(obj, "cueCard_num")){
            console.log("Swap next cueCard!");
            var PID = data.presentationID;
            var cueCards_num = Number(data.cueCards_num);

            var tmpcueCard = presentationMap.get(PID).cards[cueCards_num];
            presentationMap.get(PID)[cards].splice(cueCards_num,1);
            presentationMap.get(PID)[cards].splice(cueCards_num+1,0,tmpcueCard);
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
                if(client !== ws && client.readyState === WebSocket.OPEN){
                    client.send(data);
                    console.log("send to " + client.id);
                }
            });
        }

        //undo cueCard: if undo self or undoRedoEveryOne == true, send it to all clients, else send check command back to ensure whether undo

        else if(Object.prototype.hasOwnProperty.call(obj, "undo") && Object.prototype.hasOwnProperty.call(obj, "cueCard_num")){
            console.log("Undo!");
            var undoRedoSure = Number(data.undoRedoSure);
            var PID = data.presentationID;
            var userID = data.userID;
            var cueCards_num = Number(data.cueCards_num);
            var cardFace = Number(data.cardFace);

            if(undoRedoSure === 0){//won't skip user check step
        
                if(cardFace === 0){//front
                    var position = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
                    if(position <=0){
                        const presentationMess = {
                            "lastHistory": 0
                        }
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.send(message);
                        console.log("Undo last history!");
                        return;
                    }
                    var undoHistory = presentationFrontHistoryMap.get(PID)[cueCards_num][position];
                    if(undoHistory.userID === userID){
                        var before_text = undoHistory.before_text;
                        presentationMap.get(PID).cards[cueCards_num].front.content.message=before_text;
                        position = position -1;
                        presentationFrontHistoryPositionMap.get(PID)[cueCards_num] = position;
                        const presentationMess = {
                            "edit": 0
                        }
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        tmpPresentationMess.cardFace = cardFace;
                        tmpPresentationMess.recent_text = before_text;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.clients.forEach(function each(client){
                            if(client !== ws && client.readyState === WebSocket.OPEN){
                                client.send(message);
                                console.log("send to " + client.id);
                            }
                        });
                    }
                    else{
                        const presentationMess = {
                            "undoSure": 0
                        }
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.send(message);
                    }
                }
                else if (cardFace === 1){//back
                    var position = presentationBackHistoryPositionMap.get(PID)[cueCards_num];
                    if(position <=0){
                        const presentationMess = {
                            "lastHistory": 0
                        }
                        console.log("Undo last history!");
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.send(message);
                        return;
                    }
                    var undoHistory = presentationBackHistoryMap.get(PID)[cueCards_num][position];
                    if(undoHistory.userID === userID){
                        var before_text = undoHistory.before_text;
                        presentationMap.get(PID).cards[cueCards_num].back.content.message=before_text;
                        position = position -1;
                        presentationBackHistoryPositionMap.get(PID)[cueCards_num] = position;
                        const presentationMess = {
                            "edit": 0
                        }
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        tmpPresentationMess.cardFace = cardFace;
                        tmpPresentationMess.recent_text = before_text;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.clients.forEach(function each(client){
                            if(client !== ws && client.readyState === WebSocket.OPEN){
                                client.send(message);
                                console.log("send to " + client.id);
                            }
                        });
                    }
                    else{
                        const presentationMess = {
                            "undoSure": 0
                        }
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.send(message);
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
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.send(message);
                        return;
                    }
                    var undoHistory = presentationFrontHistoryMap.get(PID)[cueCards_num][position];
                    
                    var before_text = undoHistory.before_text;
                    presentationMap.get(PID).cards[cueCards_num].front.content.message=before_text;
                    position = position -1;
                    presentationFrontHistoryPositionMap.get(PID)[cueCards_num] = position;
                    const presentationMess = {
                        "edit": 0
                    }
                    const tmpPresentationMess = JSON.parse(presentationMess);
                    tmpPresentationMess.cueCards_num = cueCards_num;
                    tmpPresentationMess.presentationID = PID;
                    tmpPresentationMess.userID = userID;
                    tmpPresentationMess.cardFace = cardFace;
                    tmpPresentationMess.recent_text = before_text;
                    const message = JSON.stringify(tmpPresentationMess);
                    wss.clients.forEach(function each(client){
                        if(client !== ws && client.readyState === WebSocket.OPEN){
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
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.send(message);
                        return;
                    }
                    var undoHistory = presentationBackHistoryMap.get(PID)[cueCards_num][position];
                    
                    var before_text = undoHistory.before_text;
                    presentationMap.get(PID).cards[cueCards_num].back.content.message=before_text;
                    position = position -1;
                    presentationBackHistoryPositionMap.get(PID)[cueCards_num] = position;
                    const presentationMess = {
                        "edit": 0
                    }
                    const tmpPresentationMess = JSON.parse(presentationMess);
                    tmpPresentationMess.cueCards_num = cueCards_num;
                    tmpPresentationMess.presentationID = PID;
                    tmpPresentationMess.userID = userID;
                    tmpPresentationMess.cardFace = cardFace;
                    tmpPresentationMess.recent_text = before_text;
                    const message = JSON.stringify(tmpPresentationMess);
                    wss.clients.forEach(function each(client){
                        if(client !== ws && client.readyState === WebSocket.OPEN){
                            client.send(message);
                            console.log("send to " + client.id);
                        }
                    });
                }
                
            }
        }

        //undoSure cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "undoSure") && Object.prototype.hasOwnProperty.call(obj, "cueCard_num")){
            console.log("UndoSure!");
            var undoRedoSure = Number(data.undoRedoSure);
            var PID = data.presentationID;
            var userID = data.userID;
            var cueCards_num = Number(data.cueCards_num);
            var cardFace = Number(data.cardFace);
            if(cardFace === 0){
                var position = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
                if(position <=0){
                    const presentationMess = {
                        "lastHistory": 0
                    }
                    console.log("Undo last history!");
                    const tmpPresentationMess = JSON.parse(presentationMess);
                    tmpPresentationMess.cueCards_num = cueCards_num;
                    tmpPresentationMess.presentationID = PID;
                    tmpPresentationMess.userID = userID;
                    const message = JSON.stringify(tmpPresentationMess);
                    wss.send(message);
                    return;
                }
                var undoHistory = presentationFrontHistoryMap.get(PID)[cueCards_num][position];
                
                var before_text = undoHistory.before_text;
                presentationMap.get(PID).cards[cueCards_num].front.content.message=before_text;
                position = position -1;
                presentationFrontHistoryPositionMap.get(PID)[cueCards_num] = position;
                const presentationMess = {
                    "edit": 0
                }
                const tmpPresentationMess = JSON.parse(presentationMess);
                tmpPresentationMess.cueCards_num = cueCards_num;
                tmpPresentationMess.presentationID = PID;
                tmpPresentationMess.userID = userID;
                tmpPresentationMess.cardFace = cardFace;
                tmpPresentationMess.recent_text = before_text;
                const message = JSON.stringify(tmpPresentationMess);
                wss.clients.forEach(function each(client){
                    if(client !== ws && client.readyState === WebSocket.OPEN){
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
                    const tmpPresentationMess = JSON.parse(presentationMess);
                    tmpPresentationMess.cueCards_num = cueCards_num;
                    tmpPresentationMess.presentationID = PID;
                    tmpPresentationMess.userID = userID;
                    const message = JSON.stringify(tmpPresentationMess);
                    wss.send(message);
                    return;
                }
                var undoHistory = presentationBackHistoryMap.get(PID)[cueCards_num][position];
                
                var before_text = undoHistory.before_text;
                presentationMap.get(PID).cards[cueCards_num].back.content.message=before_text;
                position = position -1;
                presentationBackHistoryPositionMap.get(PID)[cueCards_num] = position;
                const presentationMess = {
                    "edit": 0
                }
                const tmpPresentationMess = JSON.parse(presentationMess);
                tmpPresentationMess.cueCards_num = cueCards_num;
                tmpPresentationMess.presentationID = PID;
                tmpPresentationMess.userID = userID;
                tmpPresentationMess.cardFace = cardFace;
                tmpPresentationMess.recent_text = before_text;
                const message = JSON.stringify(tmpPresentationMess);
                wss.clients.forEach(function each(client){
                    if(client !== ws && client.readyState === WebSocket.OPEN){
                        client.send(message);
                        console.log("send to " + client.id);
                    }
                });
            }
        }

        //redo cueCard: if redo self or undoRedoEveryOne == true, send it to all clients, else send check command back to ensure whether undo

        else if(Object.prototype.hasOwnProperty.call(obj, "redo") && Object.prototype.hasOwnProperty.call(obj, "cueCard_num")){
            console.log("Redo!");
            var undoRedoSure = Number(data.undoRedoSure);
            var PID = data.presentationID;
            var userID = data.userID;
            var cueCards_num = Number(data.cueCards_num);
            var cardFace = Number(data.cardFace);

            if(undoRedoSure === 0){//won't skip user check step
        
                if(cardFace === 0){//front
                    var position = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
                    var length = presentationFrontHistoryMap.get(PID)[cueCards_num].length;
                    if(position >= (length-1)){//check position 
                        const presentationMess = {
                            "firstHistory": 0
                        }
                        console.log("Redo first history!");
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.send(message);
                        return;
                    }
                    var redoHistory = presentationFrontHistoryMap.get(PID)[cueCards_num][position+1];
                    if(redoHistory.userID === userID){// if user ID same, don't need to check
                        var recent_text = redoHistory.recent_text;
                        presentationMap.get(PID).cards[cueCards_num].front.content.message=recent_text;
                        position = position + 1;
                        presentationFrontHistoryPositionMap.get(PID)[cueCards_num] = position;
                        const presentationMess = {
                            "edit": 0
                        }
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        tmpPresentationMess.cardFace = cardFace;
                        tmpPresentationMess.recent_text = recent_text;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.clients.forEach(function each(client){
                            if(client !== ws && client.readyState === WebSocket.OPEN){
                                client.send(message);
                                console.log("send to " + client.id);
                            }
                        });
                    }
                    else{//user ID different
                        const presentationMess = {
                            "redoSure": 0
                        }
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.send(message);
                    }
                }
                else if (cardFace === 1){//back
                    var position = presentationBackHistoryPositionMap.get(PID)[cueCards_num];
                    var length = presentationBackHistoryMap.get(PID)[cueCards_num].length;
                    if(position >= (length-1)){//check position 
                        const presentationMess = {
                            "firstHistory": 0
                        }
                        console.log("Redo first history!");
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.send(message);
                        return;
                    }
                    var redoHistory = presentationBackHistoryMap.get(PID)[cueCards_num][position+1];
                    if(redoHistory.userID === userID){// if user ID same, don't need to check
                        var recent_text = redoHistory.recent_text;
                        presentationMap.get(PID).cards[cueCards_num].back.content.message=recent_text;
                        position = position + 1;
                        presentationBackHistoryPositionMap.get(PID)[cueCards_num] = position;
                        const presentationMess = {
                            "edit": 0
                        }
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        tmpPresentationMess.cardFace = cardFace;
                        tmpPresentationMess.recent_text = recent_text;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.clients.forEach(function each(client){
                            if(client !== ws && client.readyState === WebSocket.OPEN){
                                client.send(message);
                                console.log("send to " + client.id);
                            }
                        });
                    }
                    else{//user ID different
                        const presentationMess = {
                            "redoSure": 0
                        }
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.send(message);
                    }
                }
                else{
                    console.log("CardFace error!");
                }
            }
            else{
                if(cardFace === 0){//front
                    var position = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
                    var length = presentationFrontHistoryMap.get(PID)[cueCards_num].length;
                    if(position >= (length-1)){//check position 
                        const presentationMess = {
                            "firstHistory": 0
                        }
                        console.log("Redo first history!");
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.send(message);
                        return;
                    }
                    var redoHistory = presentationFrontHistoryMap.get(PID)[cueCards_num][position+1];
                    
                    var recent_text = redoHistory.recent_text;
                    presentationMap.get(PID).cards[cueCards_num].front.content.message=recent_text;
                    position = position + 1;
                    presentationFrontHistoryPositionMap.get(PID)[cueCards_num] = position;
                    const presentationMess = {
                        "edit": 0
                    }
                    const tmpPresentationMess = JSON.parse(presentationMess);
                    tmpPresentationMess.cueCards_num = cueCards_num;
                    tmpPresentationMess.presentationID = PID;
                    tmpPresentationMess.userID = userID;
                    tmpPresentationMess.cardFace = cardFace;
                    tmpPresentationMess.recent_text = recent_text;
                    const message = JSON.stringify(tmpPresentationMess);
                    wss.clients.forEach(function each(client){
                        if(client !== ws && client.readyState === WebSocket.OPEN){
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
                        const tmpPresentationMess = JSON.parse(presentationMess);
                        tmpPresentationMess.cueCards_num = cueCards_num;
                        tmpPresentationMess.presentationID = PID;
                        tmpPresentationMess.userID = userID;
                        const message = JSON.stringify(tmpPresentationMess);
                        wss.send(message);
                        return;
                    }
                    var redoHistory = presentationBackHistoryMap.get(PID)[cueCards_num][position+1];
                    var recent_text = redoHistory.recent_text;
                    presentationMap.get(PID).cards[cueCards_num].back.content.message=recent_text;
                    position = position + 1;
                    presentationBackHistoryPositionMap.get(PID)[cueCards_num] = position;
                    const presentationMess = {
                        "edit": 0
                    }
                    const tmpPresentationMess = JSON.parse(presentationMess);
                    tmpPresentationMess.cueCards_num = cueCards_num;
                    tmpPresentationMess.presentationID = PID;
                    tmpPresentationMess.userID = userID;
                    tmpPresentationMess.cardFace = cardFace;
                    tmpPresentationMess.recent_text = recent_text;
                    const message = JSON.stringify(tmpPresentationMess);
                    wss.clients.forEach(function each(client){
                        if(client !== ws && client.readyState === WebSocket.OPEN){
                            client.send(message);
                            console.log("send to " + client.id);
                        }
                    });

                }
                else{
                    console.log("CardFace error!");
                }
            }
        }

        //redoSure cueCard and send it to all clients

        else if(Object.prototype.hasOwnProperty.call(obj, "redoSure") && Object.prototype.hasOwnProperty.call(obj, "cueCard_num")){
            console.log("RedoSure!");
            if(cardFace === 0){//front
                var position = presentationFrontHistoryPositionMap.get(PID)[cueCards_num];
                var length = presentationFrontHistoryMap.get(PID)[cueCards_num].length;
                if(position >= (length-1)){//check position 
                    const presentationMess = {
                        "firstHistory": 0
                    }
                    console.log("Redo first history!");
                    const tmpPresentationMess = JSON.parse(presentationMess);
                    tmpPresentationMess.cueCards_num = cueCards_num;
                    tmpPresentationMess.presentationID = PID;
                    tmpPresentationMess.userID = userID;
                    const message = JSON.stringify(tmpPresentationMess);
                    wss.send(message);
                    return;
                }
                var redoHistory = presentationFrontHistoryMap.get(PID)[cueCards_num][position+1];
                
                var recent_text = redoHistory.recent_text;
                presentationMap.get(PID).cards[cueCards_num].front.content.message=recent_text;
                position = position + 1;
                presentationFrontHistoryPositionMap.get(PID)[cueCards_num] = position;
                const presentationMess = {
                    "edit": 0
                }
                const tmpPresentationMess = JSON.parse(presentationMess);
                tmpPresentationMess.cueCards_num = cueCards_num;
                tmpPresentationMess.presentationID = PID;
                tmpPresentationMess.userID = userID;
                tmpPresentationMess.cardFace = cardFace;
                tmpPresentationMess.recent_text = recent_text;
                const message = JSON.stringify(tmpPresentationMess);
                wss.clients.forEach(function each(client){
                    if(client !== ws && client.readyState === WebSocket.OPEN){
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
                    const tmpPresentationMess = JSON.parse(presentationMess);
                    tmpPresentationMess.cueCards_num = cueCards_num;
                    tmpPresentationMess.presentationID = PID;
                    tmpPresentationMess.userID = userID;
                    const message = JSON.stringify(tmpPresentationMess);
                    wss.send(message);
                    return;
                }
                var redoHistory = presentationBackHistoryMap.get(PID)[cueCards_num][position+1];
                var recent_text = redoHistory.recent_text;
                presentationMap.get(PID).cards[cueCards_num].back.content.message=recent_text;
                position = position + 1;
                presentationBackHistoryPositionMap.get(PID)[cueCards_num] = position;
                const presentationMess = {
                    "edit": 0
                }
                const tmpPresentationMess = JSON.parse(presentationMess);
                tmpPresentationMess.cueCards_num = cueCards_num;
                tmpPresentationMess.presentationID = PID;
                tmpPresentationMess.userID = userID;
                tmpPresentationMess.cardFace = cardFace;
                tmpPresentationMess.recent_text = recent_text;
                const message = JSON.stringify(tmpPresentationMess);
                wss.clients.forEach(function each(client){
                    if(client !== ws && client.readyState === WebSocket.OPEN){
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
            var PID = data.presentationID;
            ws.send(JSON.stringify(presentationMap.get(PID)))

            //save presentation to the database

        }    
        
        else{
            console.log("Other message error");
        }
      });

})
