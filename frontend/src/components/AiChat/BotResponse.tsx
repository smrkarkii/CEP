import React from "react";

interface BotResponseProps {
  text: string;
  isLoading?: boolean;
}

const BotResponse: React.FC<BotResponseProps> = ({ text, isLoading }) => {
  return (
    <div className="flex items-start space-x-2">
      <div className="p-3 bg-[#2A2A3F] rounded-lg max-w-[80%]">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
          </div>
        ) : (
          text
        )}
      </div>
    </div>
  );
};

export default BotResponse;
