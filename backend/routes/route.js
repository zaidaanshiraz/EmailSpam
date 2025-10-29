import express from "express";
import {
  saveSentEmail,
  getEmails,
  moveToBin,
  starredEmail,
  deleteEmail,
  checkURLforSpam
} from "../controller/email-controller.js";

const router = express.Router();

router.post("/save", saveSentEmail);
router.get("/emails/:type", getEmails);
router.post("/save-draft", saveSentEmail);
router.post("/bin", moveToBin);
router.post("/starred", starredEmail);
router.delete("/delete", deleteEmail);
router.post("/check-url-spam", checkURLforSpam);

export default router;