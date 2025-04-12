import { useState } from "react";
import { Image, FileText, Video, X, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface UploadPanelProps {
  onNewPost: (post: any) => void;
}

const UploadPanel = ({ onNewPost }: UploadPanelProps) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create a preview URL for the selected file
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setPreviewUrl(event.target.result);
        }
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Create a new post
    const newPost = {
      id: Date.now().toString(),
      author: "591_68", // Default user
      authorId: "112",
      title,
      content,
      timestamp: "Just now",
      type: selectedFile
        ? selectedFile.type.includes("image")
          ? "image"
          : "text"
        : "text",
      imageUrl: previewUrl || undefined,
      likes: 0,
    };

    onNewPost(newPost);

    // Reset form
    setContent("");
    setTitle("");
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 mb-4">
            <Upload />
            <p className="font-medium">Upload Content</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />

            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />

            {previewUrl && (
              <div className="relative">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto rounded-md max-h-[300px] object-contain bg-gray-100"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-gray-500"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <Image className="h-4 w-4" />
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-gray-500"
              >
                <Video className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-gray-500"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>

            <Button type="submit" disabled={!title.trim()}>
              Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadPanel;
