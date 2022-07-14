const express = require('express')
const presentationManager = require('../presManager/presManager')
const userStore = require('../userStore/userStore')
const parser = require('../parser/parser')
const router = express.Router()

//Pres manager routes
router.put("/presentation", presentationManager.createPres);
router.post("/presentation", presentationManager.getPres); // Changed from get to post, as get requests aren't supposed to have a body. 
							   // Put is not correct, as each request, even if identical, needs a response.
router.post("/search", presentationManager.search); // Changed from get to post, as get requests aren't supposed to have a body.
router.delete("/presentation", presentationManager.deletePres);

//User store routes
router.put("/login", userStore.login);
router.put("/addPresToUser", userStore.addPresToUser);

//Parser routes
router.put("/import", (req, res) => {
    console.log(req.body.userID + " " + req.body.text);
    res.send(parser.parse(req.body.userID, req.body.text));
});

module.exports = router;
