import { useState, useEffect, useRef } from "react";
import { Send, Search, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "other";
  timestamp: Date;
}

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState<string | null>("1");
  const [newMessage, setNewMessage] = useState("");
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chats: Chat[] = [
    {
      id: "1",
      name: "Jane Smith",
      lastMessage: "Hey, I saw your latest post!",
      timestamp: "2m ago",
      unread: 2,
    },
    {
      id: "2",
      name: "Robert Johnson",
      lastMessage: "When will you post the next update?",
      timestamp: "1h ago",
      unread: 0,
    },
    {
      id: "3",
      name: "Alice Williams",
      lastMessage: "Thanks for your response!",
      timestamp: "5h ago",
      unread: 0,
    },
    {
      id: "4",
      name: "David Brown",
      lastMessage: "Can we collaborate on a project?",
      timestamp: "1d ago",
      unread: 0,
    },
  ];

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "1": [
      {
        id: "m1",
        content: "Hi there! I really enjoyed your content.",
        sender: "other",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        id: "m2",
        content: "Thank you so much! I appreciate the feedback.",
        sender: "user",
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
      },
      {
        id: "m3",
        content: "Are you planning to make more content about Nepal?",
        sender: "other",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        id: "m4",
        content:
          "Yes, I'm working on a series about Nepal's cultural heritage.",
        sender: "user",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        id: "m5",
        content: "Hey, I saw your latest post!",
        sender: "other",
        timestamp: new Date(Date.now() - 1 * 60 * 1000),
      },
    ],
    "2": [
      {
        id: "m1",
        content: "When will you post the next update?",
        sender: "other",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
    "3": [
      {
        id: "m1",
        content: "I had a question about your recent article.",
        sender: "other",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        id: "m2",
        content: "What would you like to know?",
        sender: "user",
        timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000),
      },
      {
        id: "m3",
        content: "Thanks for your response!",
        sender: "other",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    ],
    "4": [
      {
        id: "m1",
        content: "Can we collaborate on a project?",
        sender: "other",
        timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000),
      },
    ],
  });

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), message],
    }));

    setNewMessage("");

    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for your message! I'll get back to you soon.",
        sender: "other",
        timestamp: new Date(),
      };

      setMessages((prev) => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), response],
      }));
    }, 1000);
  };

  const toggleMobileView = () => {
    setIsMobileListVisible(!isMobileListVisible);
  };

  return (
    <div className="h-[calc(100vh-130px)] flex overflow-hidden rounded-lg shadow-lg bg-card">
      {/* Chat list sidebar */}
      <div
        className={`md:w-80 border-r border-border overflow-hidden flex flex-col ${
          isMobileListVisible ? "w-full" : "hidden md:block"
        }`}
      >
        <div className="p-4 border-b border-border bg-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-10" />
          </div>
        </div>

        <ScrollArea className="flex-grow">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 cursor-pointer hover:bg-accent flex items-center gap-3 border-b border-border ${
                activeChat === chat.id ? "bg-accent" : ""
              }`}
              onClick={() => {
                setActiveChat(chat.id);
                setIsMobileListVisible(false);
              }}
            >
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>{chat.name.slice(0, 2)}</AvatarFallback>
              </Avatar>

              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium truncate">{chat.name}</h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {chat.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage}
                </p>
              </div>

              {chat.unread > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  {chat.unread}
                </span>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat conversation area */}
      <div
        className={`flex-grow flex flex-col ${
          !isMobileListVisible ? "block" : "hidden md:block"
        }`}
      >
        {activeChat ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleMobileView}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>
                  {chats.find((c) => c.id === activeChat)?.name.slice(0, 2) ||
                    ""}
                </AvatarFallback>
              </Avatar>

              <div>
                <h2 className="font-semibold">
                  {chats.find((c) => c.id === activeChat)?.name}
                </h2>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>

            {/* Message area with fixed height to accommodate input at bottom */}
            <div className="flex-grow overflow-hidden relative">
              <ScrollArea className="h-full pb-2">
                <div className="space-y-4 p-4">
                  {messages[activeChat]?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.sender === "other" && (
                        <Avatar className="h-8 w-8 mr-2 flex-shrink-0 self-end mb-1">
                          <AvatarFallback>
                            {chats
                              .find((c) => c.id === activeChat)
                              ?.name.slice(0, 2) || ""}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <Card
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="block text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </Card>

                      {message.sender === "user" && (
                        <Avatar className="h-8 w-8 ml-2 flex-shrink-0 self-end mb-1">
                          <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {/* Empty div for scrolling to the bottom */}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Fixed input area at bottom */}
            <div className="p-4 border-t border-border bg-card mt-auto">
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
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center text-muted-foreground">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
