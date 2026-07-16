const express = require('express');
const hostRouter = express.Router();

const hostController = require('../controllers/hostController');

// Home page (IMPORTANT)
// hostRouter.get("/", hostController.getHomes);

// Add Home page
hostRouter.get("/add-home", hostController.getAddHome);

// Form submit
hostRouter.post("/add-home", hostController.postAddHome);
hostRouter.get("/host-home-list", hostController.getHostHomes);
hostRouter.get("/edit-home/:homeId",hostController.getEditHome);
hostRouter.post("/edit-home",hostController.postEditHome);
// ✅ Router same rakho
hostRouter.post("/delete-home/:homeId", hostController.postDeleteHome);

module.exports = hostRouter;