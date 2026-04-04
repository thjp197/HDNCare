import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext"; // Kéo AppContext vào để lấy data user
import ChatbotIcon from "./ChatbotIcon";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";

const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setChatbot] = useState(false);
  const chatBodyRef = useRef();

  // 1. Lấy token và thông tin user từ Context (để biết họ đã đăng nhập chưa)
  // LƯU Ý: Nếu biến của bạn tên là 'user' thay vì 'userData', hãy sửa lại cho khớp nhé!
  const { token, userData } = useContext(AppContext); 

  const generateBotResponse = async (history, currentMessage) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory(prev => [...prev.filter(msg => msg.text !== "Thinking..."), { role: "model", text, isError }]);
    }

    const formattedHistory = history.map(({role, text}) => ({
        role, 
        parts: [{text}]
    }));

    // 2. Đóng gói thông tin user hiện tại (nếu có)
    const currentUserInfo = (token && userData) ? {
        name: userData.name,
        phone: userData.phone
    } : null;

    // 3. Gửi kèm currentUser xuống Backend
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          message: currentMessage, 
          history: formattedHistory,
          currentUser: currentUserInfo // Backend sẽ dùng cái này để phân luồng
      })
    }
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const response = await fetch(`${backendUrl}/api/chatbot/message`, requestOptions);
      const data = await response.json();
      
      if(!response.ok || !data.success) throw new Error(data.message || "Lỗi kết nối đến máy chủ!");

      const apiResponseText = data.reply.replace(/\*\*(.*?)\*\*/g, '$1').trim();
      updateHistory(apiResponseText);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  useEffect(() => {
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button onClick={() => setChatbot(prev => !prev)} id="chatbot-toggler">
        <span className="material-symbols-rounded">mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>
      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button onClick={() => setChatbot(prev => !prev)} className="material-symbols-rounded">keyboard_arrow_down</button>
        </div>

        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
          <ChatbotIcon />
          <p className="message-text">
            Chào bạn! <br /> HDNCare có thể giúp gì cho bạn hôm nay?
          </p>
          </div>

          {chatHistory.map((chat, index)=> (
            <ChatMessage key={index} chat={chat} />
          ))}
          
        </div>

        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
        </div>
      </div>
    </div>
  );
};
export default Chatbot;