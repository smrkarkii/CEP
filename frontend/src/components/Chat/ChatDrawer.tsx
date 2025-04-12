import { X, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

const ChatDrawer = ({ isOpen, onClose }: ChatDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How are you doing today?",
      sender: "other",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      content: "I'm good, thanks for asking! How about you?",
      sender: "user",
      timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
    },
    {
      id: "3",
      content: "Great! I was wondering if you've seen my latest post?",
      sender: "other",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages([...messages, message]);
      setNewMessage("");

      // Simulate response
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          content: "Thanks for your message! I'll get back to you soon.",
          sender: "other",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, response]);
      }, 1000);
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
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">Chat with Creator</h3>
              <p className="text-xs text-muted-foreground">Online</p>
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
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatDrawer;
