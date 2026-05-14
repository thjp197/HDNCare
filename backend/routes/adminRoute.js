import express from "express";
import { addStylist, loginAdmin, allStylists, appointmentsAdmin, appointmentCancel, adminDashboard, updateStylist, penalizedUsers, resetUserPenalty, updateUserPenalty } from "../controllers/adminController.js";
import upload from '../middlewares/multer.js';
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailablity } from "../controllers/stylistController.js";

const adminRouter = express.Router();

adminRouter.post("/add-stylist", authAdmin, upload.single("image"), addStylist);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-stylists", authAdmin, allStylists);
adminRouter.post("/change-availability", authAdmin, changeAvailablity);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.post("/update-stylist", authAdmin, upload.single("image"), updateStylist);
adminRouter.get("/penalized-users", authAdmin, penalizedUsers);
adminRouter.post("/reset-user-penalty", authAdmin, resetUserPenalty);
adminRouter.post("/update-user-penalty", authAdmin, updateUserPenalty);




export default adminRouter;
