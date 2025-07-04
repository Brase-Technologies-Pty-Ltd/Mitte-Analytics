import express from "express";
import updatePassController from "../controllers/passwordReset.controller.js";
const router = express.Router();

router.post("/", updatePassController.updatePassword);
router.post("/updateThroughAdmin", updatePassController.updateForAdminPassword);

export default router;