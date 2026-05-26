import express from 'express';
import {stylistList, loginStylist, appointmentsStylist, appointmentComplete, appointmentCancel, stylistDashboard, stylistProfile, updateStylistProfile, changeStylistPassword, branchManagerDashboard, branchManagerAppointments, branchManagerStylists, branchManagerInfo} from '../controllers/stylistController.js';
import authStylist from '../middlewares/authStylist.js';

const stylistRouter = express.Router();

stylistRouter.get('/list', stylistList)
stylistRouter.post('/login', loginStylist)
stylistRouter.get('/appointments', authStylist, appointmentsStylist)
stylistRouter.post('/complete-appointment', authStylist, appointmentComplete)
stylistRouter.post('/cancel-appointment', authStylist, appointmentCancel)
stylistRouter.get('/dashboard', authStylist, stylistDashboard)
stylistRouter.get('/profile', authStylist, stylistProfile)
stylistRouter.post('/update-profile', authStylist, updateStylistProfile)
stylistRouter.post('/change-password', authStylist, changeStylistPassword)

// Branch Manager Routes
stylistRouter.get('/branch-manager-dashboard', authStylist, branchManagerDashboard)
stylistRouter.get('/branch-manager-appointments', authStylist, branchManagerAppointments)
stylistRouter.get('/branch-manager-stylists', authStylist, branchManagerStylists)
stylistRouter.get('/branch-manager-info', authStylist, branchManagerInfo)

export default stylistRouter