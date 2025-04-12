import React, { useState } from "react";
import UserResponse from "./UserResponse";
import BotResponse from "./BotResponse";
import { Send, X, MessageCircle } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessages: Message[] = [
        ...messages,
        { sender: "user", text: input },
        {
          sender: "bot",
          text: "Thank you for the message, lemme get back to you in 2 mins.",
        },
      ];
      setMessages(newMessages);
      setInput("");
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button - Top Right */}
      {!isOpen && (
        <button
          className="fixed top-0 right-5 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Panel */}
      <div
        className={`fixed bottom-0 right-0 w-[400px] h-screen bg-[#1E1E2F] rounded-sm shadow-2xl border border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-[120%]"
        } flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#2A2A3F] text-white font-semibold border-b border-gray-600">
          <span>AI Assistant</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#1E1E2F] text-white">
          {messages.map((message, index) =>
            message.sender === "user" ? (
              <UserResponse key={index} text={message.text} />
            ) : (
              <BotResponse key={index} text={message.text} />
            )
          )}
        </div>

        {/* Input */}
        <div className="flex items-center p-3 border-t border-gray-600 bg-[#2A2A3F]">
          <input
            className="flex-grow p-2 rounded-full bg-[#3B3B4F] text-sm text-white placeholder-gray-400 border border-gray-500 focus:outline-none"
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            className="ml-2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
            onClick={handleSendMessage}
          >
            <Send size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
};

export default AiChat;
