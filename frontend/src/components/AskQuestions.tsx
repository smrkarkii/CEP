import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { ChatContext } from "@/context/ChatContext";
import { HelpCircle } from "lucide-react";

const AskQuestions = () => {
  const { toggleChat } = useContext(ChatContext);

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-2 py-6 rounded-xl bg-gradient-to-r from-background to-muted/50 border border-border hover:from-muted/50 hover:to-background transition-all duration-300"
      onClick={toggleChat}
    >
      <HelpCircle className="h-5 w-5" />
      <span>Ask Questions</span>
    </Button>
  );
};

export default AskQuestions;
