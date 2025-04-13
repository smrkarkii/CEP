import React, { useState } from "react";
import UserResponse from "./UserResponse";
import BotResponse from "./BotResponse";
import { Send, X, MessageCircle } from "lucide-react";
import axios from "axios";

interface Message {
  sender: "user" | "bot";
  text: string;
}

// Since your API is running on 0.0.0.0:8000
const API_URL = "http://localhost:8000";

const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log("Ai chat component rendered");

  const handleSendMessage = async () => {
    // Debug log to ensure function is called
    console.log("handleSendMessage called with input:", input);

    if (input.trim() && !isLoading) {
      setIsLoading(true);
      console.log("Starting API calls...");

      // Add user message immediately
      const userMessage: Message = { sender: "user", text: input };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Step 1: Add the message to vector database
        const addDataFormData = new FormData();
        addDataFormData.append("text", input);
        addDataFormData.append("collection_name", "test_collection");
        addDataFormData.append("add_metadata", "true");
        addDataFormData.append("metadata", JSON.stringify({ source: "chat" }));

        console.log("Sending to /add_data_with_image:", {
          text: input,
          collection_name: "test_collection",
          metadata: { source: "chat" },
        });

        const addDataResponse = {
          status: "success",
          message: "Added 1 documents to string",
          image_processed: false,
        };
        // await axios.post(
        //   `${API_URL}/add_data_with_image`,
        //   addDataFormData,
        //   {
        //     headers: {
        //       "Content-Type": "multipart/form-data",
        //       Accept: "application/json",
        //     },
        //   }
        // );

        console.log("Vector DB Response:", addDataResponse.data);

        // Step 2: Get AI response using chat endpoint
        const chatFormData = new FormData();
        chatFormData.append("query", input);
        chatFormData.append("collection_name", "test_collection");
        chatFormData.append(
          "metadata_filter",
          JSON.stringify({ source: "chat" })
        );
        chatFormData.append("limit", "1");
        chatFormData.append("use_metadata", "true");

        console.log("Sending to /chat_with_image_rag:", {
          query: input,
          collection_name: "test_collection",
          metadata_filter: { source: "blog" },
        });

        const chatResponse = await axios.post(
          `${API_URL}/chat_with_image_rag`,
          chatFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
          }
        );

        console.log("Chat Response:", chatResponse.data);

        // Add bot response
        const botResponse = chatResponse.data.response;
        console.log("Bot will respond with:", botResponse);

        const botMessage: Message = {
          sender: "bot",
          text:
            botResponse || "I apologize, but I couldn't process your request.",
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error: any) {
        // Detailed error logging
        console.error("Error occurred:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });

        const errorMessage: Message = {
          sender: "bot",
          text: `Error: ${
            error.response?.data?.detail ||
            error.message ||
            "Unknown error occurred"
          }`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setInput("");
        console.log("Request completed. Loading state reset.");
      }
    }
  };

  // Let's add a test function to verify the API connection
  const testApiConnection = async () => {
    try {
      const response = await axios.get(`${API_URL}/docs`);
      console.log("API connection test successful:", response.status);
    } catch (error) {
      console.error("API connection test failed:", error);
    }
  };

  // Call the test function when component mounts
  React.useEffect(() => {
    testApiConnection();
    console.log("Component mounted, API URL:", API_URL);
  }, []);

  return (
    <>
      {/* Chatbot Toggle Button - Top Right */}
      {!isOpen && (
        <button
          className="fixed top-0 right-5 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg"
          onClick={() => {
            console.log("Opening chat window");
            setIsOpen(true);
          }}
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
          <span>AI Assistant {isLoading ? "(Loading...)" : ""}</span>
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
              <BotResponse
                key={index}
                text={message.text}
                isLoading={isLoading && index === messages.length - 1}
              />
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
            onChange={(e) => {
              console.log("Input changed:", e.target.value);
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log("Enter key pressed");
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <button
            className={`ml-2 p-2 ${
              isLoading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
            } text-white rounded-full`}
            onClick={() => {
              console.log("Send button clicked");
              handleSendMessage();
            }}
            disabled={isLoading}
          >
            <Send size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
};

export default AiChat;
