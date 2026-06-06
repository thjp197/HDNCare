import express from "express";
// BỔ SUNG: Thêm forceAssignBranch vào cuối danh sách import
import { addStylist, adminDashboard, allStylists, appointmentCancel, appointmentsAdmin, assignBranch, assignBranchManager, deleteStylist, forceAssignBranch, getBranchesInfo, getStylistsByBranch, loginAdmin, penalizedUsers, removeBranchManager, resetUserPenalty, updateStylist, updateUserPenalty } from "../controllers/adminController.js";
import { addDiscountCode, deleteDiscountCode, getAllDiscountCodes, updateDiscountCode } from "../controllers/discountCodeController.js";
import { changeAvailablity } from "../controllers/stylistController.js";
import authAdmin from "../middlewares/authAdmin.js";
import upload from '../middlewares/multer.js';

const adminRouter = express.Router();

adminRouter.post("/add-stylist", authAdmin, upload.single("image"), addStylist);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-stylists", authAdmin, allStylists);
adminRouter.post("/change-availability", authAdmin, changeAvailablity);
adminRouter.post("/delete-stylist", authAdmin, deleteStylist);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.post("/update-stylist", authAdmin, upload.single("image"), updateStylist);
adminRouter.get("/penalized-users", authAdmin, penalizedUsers);
adminRouter.post("/reset-user-penalty", authAdmin, resetUserPenalty);
adminRouter.post("/update-user-penalty", authAdmin, updateUserPenalty);

// Branch Management Routes
adminRouter.post("/get-stylists-by-branch", authAdmin, getStylistsByBranch);
adminRouter.get("/get-branches-info", authAdmin, getBranchesInfo);
adminRouter.post("/assign-branch", authAdmin, assignBranch);
adminRouter.post("/update-stylist-branch", authAdmin, assignBranch);
adminRouter.post("/assign-branch-manager", authAdmin, assignBranchManager);
adminRouter.post("/remove-branch-manager", authAdmin, removeBranchManager);
// BỔ SUNG: Tuyến đường (route) cho API ép buộc chuyển chi nhánh
adminRouter.post("/force-assign-branch", authAdmin, forceAssignBranch);

// Discount Code Routes
adminRouter.post("/add-discount-code", authAdmin, addDiscountCode);
adminRouter.get("/discount-codes", authAdmin, getAllDiscountCodes);
adminRouter.post("/update-discount-code", authAdmin, updateDiscountCode);
adminRouter.post("/delete-discount-code", authAdmin, deleteDiscountCode);

export default adminRouter;