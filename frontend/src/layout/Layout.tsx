import { Outlet } from "react-router-dom";
import { useContext } from "react";
import ChatDrawer from "@/components/Chat/ChatDrawer";
import { ChatContext } from "@/context/ChatContext";
import Navbar from "./NavBar";

const Layout = () => {
  const { isChatOpen, setIsChatOpen } = useContext(ChatContext);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex">
        <main className="flex-1 p-4 md:p-8 w-full max-w-full">
          <Outlet />
        </main>
        <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </div>
  );
};

export default Layout;
