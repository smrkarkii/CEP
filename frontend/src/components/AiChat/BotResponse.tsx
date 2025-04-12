import React from "react";

interface Props {
  text: string;
}

const BotResponse: React.FC<Props> = ({ text }) => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl max-w-xs text-sm">
        {text || "Thank you for the message, lemme get back to you in 2 mins."}
      </div>
    </div>
  );
};

export default BotResponse;
