import express from 'express';
import { handleChatbotMessage } from '../controllers/chatbotController.js';

const chatbotRoute = express.Router();

// Route nhận tin nhắn: POST http://localhost:4000/api/chatbot/message
chatbotRoute.post('/message', handleChatbotMessage);

export default chatbotRoute;