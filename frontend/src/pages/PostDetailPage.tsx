import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, MessageSquare, ExternalLink } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { getContentObject } from "@/services/contentServices";
import { SuiObjectData } from "@mysten/sui.js/client";
import { Post } from "@/types/post";
import TextContentViewer from "@/components/Content/TextContentViewer";
import ImageContentViewer from "@/components/Content/ImageContentViewer";

const PostDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  const mapSuiObjectToPost = (suiObject: SuiObjectData): Post => {
    const fields = suiObject.content?.fields as any;

    return {
      id: suiObject.objectId || "",
      author: fields?.owner || "Unknown Creator",
      authorId: fields?.owner || "",
      wallet: fields?.owner || "",
      title: fields?.title || "Untitled",
      content: fields?.description || "",
      timestamp: new Date().toISOString(),
      file_type: fields?.file_type?.includes("image") ? "image" : "text",
      likes: 0,
      blob_id: fields?.blob_id || "",
    };
  };

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!id) {
        setError("Post ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const contentObject = await getContentObject(id);
        if (!contentObject) {
          throw new Error("Content not found");
        }

        const postData = mapSuiObjectToPost(contentObject);
        setPost(postData);
      } catch (err) {
        console.error("Error fetching post details:", err);
        setError("Failed to load post. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  const toggleLike = () => {
    setLiked(!liked);
    if (!liked && post) {
      setPost({ ...post, likes: post.likes + 1 });
    } else if (post) {
      setPost({ ...post, likes: Math.max(0, post.likes - 1) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-65px)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-65px)]">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Post not found</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <Link to={`/creator/${post.authorId}`}>
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={`https://source.unsplash.com/random/100x100/?portrait&u=${post.authorId}`}
                  alt={`Creator ${post.authorId.slice(
                    0,
                    5
                  )}...${post.authorId.slice(-4)}`}
                />
                <AvatarFallback>
                  {post.authorId.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                to={`/creator/${post.authorId}`}
                className="font-medium hover:underline"
              >
                Creator {post.authorId.slice(0, 5)}...{post.authorId.slice(-4)}
              </Link>
              <div className="text-xs text-muted-foreground">
                {new Date(post.timestamp).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          <div className="mb-6">
            {post.file_type === "image" ? (
              <ImageContentViewer blobId={post.blob_id} alt={post.title} />
            ) : (
              <TextContentViewer
                blobId={post.blob_id}
                fallbackContent={post.content}
              />
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={toggleLike}
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <Heart
                    className={`mr-1 h-5 w-5 ${
                      liked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  <span>{post.likes} Likes</span>
                </button>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessageSquare className="mr-1 h-5 w-5" />
                  <span>0 Comments</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <a
                  href={`https://suiscan.xyz/testnet/object/${post.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  View on SuiScan
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Blockchain Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground mr-2">
                  Object ID:
                </span>
                <Badge variant="outline" className="px-2 py-0 text-xs">
                  {post.id.slice(0, 10)}...{post.id.slice(-4)}
                  <CopyButton
                    textToCopy={post.id}
                    size={12}
                    tooltipText="Copy object ID"
                  />
                </Badge>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground mr-2">
                  Owner:
                </span>
                <Badge variant="outline" className="px-2 py-0 text-xs">
                  {post.wallet.slice(0, 10)}...{post.wallet.slice(-4)}
                  <CopyButton
                    textToCopy={post.wallet}
                    size={12}
                    tooltipText="Copy wallet address"
                  />
                </Badge>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground mr-2">
                  BlobId:
                </span>
                <Badge
                  variant="outline"
                  className="px-2 py-0 text-xs truncate max-w-xs"
                >
                  {post.blob_id.length > 20
                    ? `${post.blob_id.slice(0, 10)}...${post.blob_id.slice(
                        -10
                      )}`
                    : post.blob_id}
                  <CopyButton
                    textToCopy={post.blob_id}
                    size={12}
                    tooltipText="Copy blob ID"
                  />
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <div className="text-center py-6 text-muted-foreground">
            Comments functionality coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetailsPage;
