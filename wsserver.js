const express = require("express");
const { WebSocketServer } = require("ws");
const WebSocket = require("ws");
const map1 = new Map();
const usermap = new Map();

const server = express().listen(80);

const wss = new WebSocketServer({server});

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + "-" + s4();
};

wss.on("connection",(ws) => {
    //console.log('server:A client logged in');
    ws.id = wss.getUniqueID();

    ws.on("close",() => {
        //console.log("server:1 client disconnect");
        var pid = usermap.get(ws.id);
        var num = map1.get(pid);
        if(num<2){
            map1.delete(pid);
//             console.log("Delete presentation" +String(pid));
        }
        else{
            map1.set(pid,num-1);
//             console.log("Client number left:" + (num-1));
        }
        usermap.delete(ws.id);
//         console.log("Delete user" + ws.id);
    });

    ws.on("message", function message(data) {
//         console.log("received: %s, %s", data, typeof data);
        var obj = JSON.parse(data);
//         console.log(obj);
        if(obj.hasOwnProperty('cueCards_num') && obj.hasOwnProperty('cardFace')){//send change to all other client
//             console.log("Change!");
            wss.clients.forEach(function each(client){
                if(client !== ws && client.readyState === WebSocket.OPEN){
                    client.send(data);
//                     console.log("send to " + client.id);
                }
            });
        }
        else if(Object.prototype.hasOwnProperty.call(obj, "title")){//send presentation to new connected client or save presentation
//             console.log("Presentation Obj!");
            wss.clients.forEach(function each(client){
                if(client !== ws && client.readyState === WebSocket.OPEN){
                    client.send(data);
//                     console.log("send to " + client.id);
                }
            });

            //save presentation to the database

        }    
        else if(Object.prototype.hasOwnProperty.call(obj, "presentationID")){//connect to the server
//             console.log("PID!");
            var PID = data.presentationID;
//             console.log(PID);
//             var userID = data.userID;
            if(map1.has(PID)){//Not the first in the presentation
                wss.clients.forEach(function each(client){
                    if(client !== ws && client.readyState === WebSocket.OPEN){
var presentationMessage = {
    presentation:"0",
  };
                        client.send(JSON.stringify(msg_presentation));
                    }
                });
                var index = map1.get(PID)+1;
                map1.set(PID, index);
                usermap.set(ws.id, PID);
//                 console.log("Not first, id =" + ws.id);
            }
            else{//First in the presentation
                map1.set(PID,1);
                usermap.set(ws.id, PID);
//                 console.log("First, id =" + ws.id);
            }
            
        }
//         else{
//             console.log("other");
//         }
        
        // var forwardThis = JSON.stringify(data);
        // broker.clients.forEach((client) => {
        //     if (client !== ws) client.send(forwardThis);
        // });
        // var newMsg = JSON.parse(data);
        // messages[newMsg.roomId].push({username:newMsg.username, text:newMsg.text});
      });

})
