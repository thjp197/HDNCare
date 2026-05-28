import { useRef } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
    const inputRef = useRef();
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userMessage = inputRef.current.value.trim();
        if (!userMessage) return;
        inputRef.current.value = "";

        // Cập nhật giao diện với tin nhắn của user
        setChatHistory((history) => [...history, { role: "user", text: userMessage}]);

        setTimeout(() => {
            // Hiển thị trạng thái Thinking...
            setChatHistory((history) => [...history, { role: "model", text: "Thinking..." }]);
            generateBotResponse(chatHistory, userMessage); 
        }, 600);
    }
    
  return (
    <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
        <input ref={inputRef} type="text" placeholder="Nhập tin nhắn..." className="message-input" required />
        <button className="material-symbols-rounded">arrow_upward</button>
    </form>
    )
}

export default ChatForm;