import express from 'express';
import { addStylist } from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';

const adminRouter = express.Router();

adminRouter.post('/add-stylist', upload.single('image'), addStylist);

export default adminRouter;