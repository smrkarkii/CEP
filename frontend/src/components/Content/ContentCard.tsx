import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Image } from "lucide-react";
import { Post } from "@/types/post";
import { Badge } from "@/components/ui/badge";

interface ContentCardProps {
  post: Post;
}

const ContentCard: React.FC<ContentCardProps> = ({ post }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col pt-0">
      {post.file_type === "image" ? (
        <div className="aspect-video w-full flex items-center justify-center bg-muted max-h-28">
          <Image className="h-16 w-16 text-muted-foreground opacity-50" />
        </div>
      ) : (
        <div className="aspect-video w-full flex items-center justify-center bg-muted max-h-28">
          <FileText className="h-16 w-16 text-muted-foreground opacity-50" />
        </div>
      )}

      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="px-2 py-0 text-xs">
            {post.file_type === "image" ? "Image" : "Text"}
          </Badge>
        </div>

        <h3 className="font-bold text-lg mb-1">{post.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
          {post.content}
        </p>
      </CardContent>
    </Card>
  );
};

export default ContentCard;
