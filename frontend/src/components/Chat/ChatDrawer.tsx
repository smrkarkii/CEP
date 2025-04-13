import { X, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "other";
  timestamp: Date;
}

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },
});

const ChatDrawer = ({ isOpen, onClose }: ChatDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() && !isLoading) {
      setIsLoading(true);
      console.log("Sending message:", newMessage);

      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        console.log("Adding to vector DB...");

        // Step 1: Add message to vector database
        const addDataFormData = new FormData();
        addDataFormData.append("text", newMessage);
        addDataFormData.append("collection_name", "chat_collection");
        addDataFormData.append("add_metadata", "true");
        addDataFormData.append("metadata", JSON.stringify({ source: "chat" }));

        const addDataResponse = await api.post(
          "/add_data_with_image",
          addDataFormData
        );
        console.log("Vector DB Response:", addDataResponse.data);

        // Step 2: Get AI response
        const chatFormData = new FormData();
        chatFormData.append("query", newMessage);
        chatFormData.append("collection_name", "chat_collection");
        chatFormData.append(
          "metadata_filter",
          JSON.stringify({ source: "chat" })
        );
        chatFormData.append("limit", "50");
        chatFormData.append("use_metadata", "true");

        console.log("Getting AI response...");
        const chatResponse = await api.post(
          "/chat_with_image_rag",
          chatFormData
        );
        console.log("AI Response:", chatResponse.data);

        // Add AI response to messages
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            chatResponse.data.response ||
            "I apologize, but I couldn't process your request.",
          sender: "other",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error: any) {
        console.error("Chat error:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Error: ${
            error.response?.data?.detail ||
            error.message ||
            "Unknown error occurred"
          }`,
          sender: "other",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setNewMessage("");
        console.log("Request completed");
      }
    }
  };

  return (
    <div
      className={cn(
        "fixed top-[65px] right-0 bottom-0 w-[400px] bg-card border-l border-border shadow-lg transition-transform duration-300 ease-in-out transform z-40",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Thinking..." : "Online"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex", {
                "justify-end": message.sender === "user",
              })}
            >
              <div
                className={cn("max-w-[80%] rounded-lg p-3", {
                  "bg-primary text-primary-foreground":
                    message.sender === "user",
                  "bg-accent": message.sender === "other",
                })}
              >
                <p className="text-sm">{message.content}</p>
                <span className="block text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatDrawer;
