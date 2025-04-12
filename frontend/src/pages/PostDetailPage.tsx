import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Heart, MessageSquare, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Leaderboard from "@/components/Leaderboard";
import AskQuestions from "@/components/AskQuestions";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if we need to scroll to comments section
  useEffect(() => {
    if (location.hash === "#comments" && commentsRef.current) {
      setTimeout(() => {
        commentsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.hash]);

  // In a real app, you'd fetch the post data based on the ID
  // For now, we'll use dummy data
  const post = {
    id,
    author: "591_68",
    authorId: "112",
    wallet: "0x1abc...",
    title: "How will Nepal Be in 25 Years?",
    content:
      "In the next ten years, Nepal's economy could experience steady growth, particularly through infrastructure development, tourism, and a thriving digital economy. Hydropower projects and improved transportation could transform the nation's connectivity, while tourism may thrive with eco-friendly initiatives. The digital economy, driven by IT startups, could also see significant growth, and new infrastructure to alleviate Thoranko's traffic burden will be key to sustaining this growth, as Nepal's government has faced challenges that could affect future socio-economic development. Additionally, Nepal's strategic location between India and China positions it as a key player in the region, and it may continue to benefit from development partnerships with both countries. Remittances from overseas workers will likely remain a central part of the economy, though it poses challenges for sustainable economic transformation.",
    timestamp: "2 hours ago",
    imageUrl:
      id === "2"
        ? "/lovable-uploads/183c2abd-abad-444f-8df8-954de4ce94e9.png"
        : id === "3"
        ? "/lovable-uploads/55734868-5a2b-497b-b73e-55a5db80d233.png"
        : undefined,
    type: id === "2" || id === "3" ? "image" : "text",
    likes: 112,
  };

  // Dummy comments
  const comments = [
    {
      id: "c1",
      author: "user123",
      authorId: "56",
      content: "This is a really insightful analysis!",
      timestamp: "1 hour ago",
      likes: 8,
    },
    {
      id: "c2",
      author: "nepal_fan",
      authorId: "78",
      content: "I think tourism will be the biggest growth sector for Nepal.",
      timestamp: "45 minutes ago",
      likes: 5,
    },
  ];

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    // In a real app, you'd send this to your backend
    console.log("Comment submitted:", comment);
    setComment("");
  };

  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader className="p-4">
            <Link
              to={`/profile/${post.authorId}`}
              className="flex items-center gap-3"
            >
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>{post.author.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.author}</p>
                <p className="text-xs text-gray-500">{post.timestamp}</p>
              </div>
            </Link>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

            {post.imageUrl && (
              <div className="mb-4">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full rounded-md"
                />
              </div>
            )}

            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{post.content}</p>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setLiked(!liked)}
              >
                <Heart
                  className={`h-4 w-4 ${
                    liked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span>{post.likes + (liked ? 1 : 0)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={scrollToComments}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{comments.length}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div ref={commentsRef} id="comments">
          <h2 className="text-xl font-semibold">Comments</h2>

          <Card className="p-4">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={!comment.trim()}>
                  Comment
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardHeader className="p-4 pb-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {comment.author.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {comment.timestamp}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <p>{comment.content}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Heart className="h-3 w-3" />
                    <span className="text-xs">{comment.likes}</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Leaderboard />
        <AskQuestions />
      </div>
    </div>
  );
};

export default PostDetailPage;
