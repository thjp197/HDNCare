import express from 'express';
import {stylistList, loginStylist, appointmentsStylist} from '../controllers/stylistController.js';
import authStylist from '../middlewares/authStylist.js';

const stylistRouter = express.Router();

stylistRouter.get('/list', stylistList)
stylistRouter.post('/login', loginStylist)
stylistRouter.get('/appointments', authStylist, appointmentsStylist)
export default stylistRouter