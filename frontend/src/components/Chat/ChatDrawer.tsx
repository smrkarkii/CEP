import { X, Send, ImagePlus, XCircle } from "lucide-react";
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
  image?: string;
}

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },
});

// At the top with other constants
const COLLECTION_NAME = "string";
import.meta.env.VITE_COLLECTION_NAME || "test_collection0";

const ChatDrawer = ({ isOpen, onClose }: ChatDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        alert("Please select an image file");
      }
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    if ((newMessage.trim() || selectedImage) && !isLoading) {
      setIsLoading(true);
      console.log("Sending message:", newMessage);

      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: "user",
        timestamp: new Date(),
        image: imagePreview || undefined,
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        console.log("Adding to vector DB...");

        // Step 1: Add message to vector database
        const addDataFormData = new FormData();
        addDataFormData.append("text", newMessage);
        addDataFormData.append("collection_name", "string");
        addDataFormData.append("add_metadata", "true");
        addDataFormData.append(
          "metadata_filter",
          JSON.stringify({ source: "blog" }) // Changed from blogpost to chat
        );
        const metadata_filter = {
          source: "",
          timestamp: new Date().toISOString(),
          text: newMessage,
        };
        const addDataResponse = {
          status: "success",
          message: "Added 1 documents to string",
          image_processed: false,
        };
        // await api.post(
        //   "/add_data_with_image",
        //   addDataFormData
        // );
        console.log("Vector DB Response:", addDataResponse.data);

        // Step 2: Get AI response
        const chatFormData = new FormData();
        chatFormData.append(
          "query",
          newMessage || "What can you tell me about this image?"
        );
        chatFormData.append("collection_name", "string");
        chatFormData.append("use_metadata", "true");
        chatFormData.append("limit", "50");
        addDataFormData.append(
          "metadata_filter",
          JSON.stringify({ source: "blog" }) // Changed from blogpost to chat
        );

        // Add image if selected
        if (selectedImage) {
          chatFormData.append("file", selectedImage);
        }

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
        removeSelectedImage();
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
              <h3 className="font-medium">AI helper</h3>
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
                {message.image && (
                  <div className="mb-2">
                    <img
                      src={message.image}
                      alt="Uploaded content"
                      className="rounded-lg max-h-[200px] object-cover"
                    />
                  </div>
                )}
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

        {imagePreview && (
          <div className="p-2 border-t border-border">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 rounded-md object-cover"
              />
              <button
                onClick={removeSelectedImage}
                className="absolute -top-2 -right-2 bg-background rounded-full shadow-sm"
              >
                <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                selectedImage ? "Ask about the image..." : "Type a message..."
              }
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || (!newMessage.trim() && !selectedImage)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatDrawer;
