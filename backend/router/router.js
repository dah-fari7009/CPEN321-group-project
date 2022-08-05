const express = require('express')
const presentationManager = require('../presManager/presManager')
const userStore = require('../userStore/userStore')
const parser = require('../parser/parser')
const exporter = require('../parser/export')

const router = express.Router()

//Pres manager routes
router.put("/presentation", presentationManager.createPres);
//router.get("/presentation", presentationManager.getPres);						   								
//router.get("/search", presentationManager.search);
router.delete("/presentation", presentationManager.deletePres);
router.get("/allPresentationsOfUser", presentationManager.getAllPresOfUser);
router.put("/savePresentation", presentationManager.savePres);
router.put("/share", presentationManager.share);
//router.put("/unshare", presentationManager.unShare);

//User store routes
router.put("/login", userStore.login);
router.put("/addPresToUser", userStore.addPresToUser);

//Parser routes
router.put("/import", parser.parse);

//Exporter routes
router.post("/export", exporter.unParsePresentation);

module.exports = router;
