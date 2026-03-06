import express from "express";
import { addStylist } from "../controllers/adminController.js";
import multer from "multer";
// import upload from '../middlewares/multer.js';
const upload = multer({ dest: "uploads/" });

const adminRouter = express.Router();

adminRouter.post("/add-stylist", upload.single("image"), addStylist);

export default adminRouter;
