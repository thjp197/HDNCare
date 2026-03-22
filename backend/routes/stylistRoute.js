import express from 'express';
import {stylistList, loginStylist, appointmentsStylist, appointmentComplete, appointmentCancel} from '../controllers/stylistController.js';
import authStylist from '../middlewares/authStylist.js';

const stylistRouter = express.Router();

stylistRouter.get('/list', stylistList)
stylistRouter.post('/login', loginStylist)
stylistRouter.get('/appointments', authStylist, appointmentsStylist)
stylistRouter.post('/complete-appointment', authStylist, appointmentComplete)
stylistRouter.post('/cancel-appointment', authStylist, appointmentCancel)
export default stylistRouter