import express from 'express';
import {stylistList} from '../controllers/stylistController.js';

const stylistRouter = express.Router();

stylistRouter.get('/list', stylistList)

export default stylistRouter