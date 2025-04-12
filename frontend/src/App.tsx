import { RouterProvider } from "react-router-dom";
import routes from "./routes/route";
import { ChatProvider, ChatContext } from "./context/ChatContext";
import ChatDrawer from "./components/Chat/ChatDrawer";
import { useContext } from "react";
import { useParams } from "react-router-dom";

function AppContent() {
  const { isChatOpen, setIsChatOpen } = useContext(ChatContext);

  return (
    <>
      <RouterProvider router={routes} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
