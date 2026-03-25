import { useEffect, useRef, useState } from "react";
// ❌ Đã xóa import companyInfo vì Backend sẽ lo việc này
import ChatbotIcon from "./ChatbotIcon";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";

const Chatbot = () => {
  // 1. Khởi tạo mảng rỗng, không cần nhét companyInfo vào nữa
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setChatbot] = useState(false);
  const chatBodyRef = useRef();

  // 2. Thêm tham số currentMessage để tách bạch tin nhắn hiện tại và lịch sử
  const generateBotResponse = async (history, currentMessage) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory(prev => [...prev.filter(msg => msg.text !== "Thinking..."), { role: "model", text, isError }]);
    }

    // Format lịch sử theo chuẩn của Gemini SDK (Gửi cho Backend)
    const formattedHistory = history.map(({role, text}) => ({
        role, 
        parts: [{text}]
    }));

    // 3. Cấu hình gửi body xuống Backend (khớp với chatbotController.js)
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          message: currentMessage, 
          history: formattedHistory
      })
    }
    
    try {
      // 4. Gọi API nội bộ của bạn (Cổng 4000)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const response = await fetch(`${backendUrl}/api/chatbot/message`, requestOptions);
      const data = await response.json();
      
      if(!response.ok || !data.success) throw new Error(data.message || "Lỗi kết nối đến máy chủ!");

      // 5. Lấy kết quả trả về từ Backend (không cần parse lằng nhằng nữa)
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