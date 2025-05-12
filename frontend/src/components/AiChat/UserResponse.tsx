import React from "react";

interface Props {
  text: string;
}

const UserResponse: React.FC<Props> = ({ text }) => {
  return (
    <div className="flex justify-end">
      <div className="bg-purple-500 text-white px-4 py-2 rounded-2xl max-w-xs text-sm">
        {text}
      </div>
    </div>
  );
};

export default UserResponse;
