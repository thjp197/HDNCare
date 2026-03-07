import express from "express";
import { addStylist, loginAdmin } from "../controllers/adminController.js";
import upload from '../middlewares/multer.js';
import authAdmin from "../middlewares/authAdmin.js";

const adminRouter = express.Router();

adminRouter.post("/add-stylist", authAdmin, upload.single("image"), addStylist);
adminRouter.post("/login", loginAdmin);


export default adminRouter;
