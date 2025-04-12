import React from "react";
import { Card, CardContent } from "../ui/card";
import { Post } from "@/types/post";
import { Image, Text } from "lucide-react";

interface ContentCardProps {
  post: Post;
}

const ContentCard: React.FC<ContentCardProps> = ({ post }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
      {/* <div>
        {[".png", ".jpg", ".jpeg", "image/png", "image/jpeg"].includes(
          post.file_type
        ) ? (
          <Image size={20} />
        ) : [".txt", "text/plain"].includes(post.file_type) ? (
          <Text className="h-16 w-16 text-white" />
        ) : null}
      </div> */}
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-1">{post.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {post.content}
        </p>
      </CardContent>
    </Card>
  );
};

export default ContentCard;
