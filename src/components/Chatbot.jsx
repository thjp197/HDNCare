import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext"; // Kéo AppContext vào để lấy data user
import ChatbotIcon from "./ChatbotIcon";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";

const Chatbot = () => {
  // 1. CẬP NHẬT: Khởi tạo State từ localStorage (Nếu có dữ liệu cũ thì lấy ra, không thì mảng rỗng)
  const [chatHistory, setChatHistory] = useState(() => {
    const savedChat = localStorage.getItem("hdncare_chat_history");
    return savedChat ? JSON.parse(savedChat) : [];
  });
  const [showChatbot, setChatbot] = useState(false);
  const chatBodyRef = useRef();

  // Lấy token và thông tin user từ Context (để biết họ đã đăng nhập chưa)
  const { token, userData } = useContext(AppContext); 

  // 2. CẬP NHẬT: Tự động đồng bộ mảng chatHistory vào localStorage mỗi khi có tin nhắn mới
  useEffect(() => {
    localStorage.setItem("hdncare_chat_history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  const generateBotResponse = async (history, currentMessage) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory(prev => [...prev.filter(msg => msg.text !== "Thinking..."), { role: "model", text, isError }]);
    }

    const formattedHistory = history.map(({role, text}) => ({
        role, 
        parts: [{text}]
    }));

    // Đóng gói thông tin user hiện tại (nếu có)
    const currentUserInfo = (token && userData) ? {
        name: userData.name,
        phone: userData.phone
    } : null;

    // Gửi kèm currentUser xuống Backend
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
      const backendUrl =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_BACKEND_URL ||
        "http://localhost:4000";
      const response = await fetch(`${backendUrl}/api/gemini/chat`, requestOptions);
      const data = await response.json();
      
      if(!response.ok || !data.success) throw new Error(data.message || "Lỗi kết nối đến máy chủ!");

      const apiResponseText = data.reply.replace(/\*\*(.*?)\*\*/g, '$1').trim();
      updateHistory(apiResponseText);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  // Cuộn xuống cuối mỗi khi có tin nhắn mới
  useEffect(() => {
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory]);

  // 3. CẬP NHẬT: Xoá sạch lịch sử chat trong State và LocalStorage khi Đăng xuất (!token)
  useEffect(() => {
    if (!token) {
      setChatHistory([]); // Reset về mảng rỗng
      setChatbot(false);  // Đóng khung chat lại cho gọn
      localStorage.removeItem("hdncare_chat_history"); // Xóa dữ liệu chat khỏi trình duyệt
    }
  }, [token]);

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