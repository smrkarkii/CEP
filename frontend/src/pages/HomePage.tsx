import { useState } from "react";
import ContentFeed from "../components/Home/ContentFeed";
import UploadPanel from "../components/Home/UploadPanel";
import Leaderboard from "@/components/Leaderboard";
import AskQuestions from "@/components/AskQuestions";
import { Post, PostType } from "@/types/post";
import { useLogin } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";

const HomePage = () => {
  const { isLoggedIn, login } = useLogin();
  // Typed posts data with proper type definitions
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: "591_68",
      authorId: "112",
      wallet: "0x1abc...",
      title: "How will Nepal Be in 25 Years?",
      content:
        "In the next ten years, Nepal's economy could experience steady growth, particularly through infrastructure development, tourism, and a thriving digital economy. Hydropower projects and improved transportation could transform the nation's connectivity, while tourism may thrive with eco-friendly initiatives. The digital economy, driven by IT startups, could also see significant growth, and new infrastructure to alleviate Thoranko's traffic burden will be key to sustaining this growth, as Nepal's government has faced challenges that could affect future socio-economic development. Additionally, Nepal's strategic location between India and China positions it as a key player in the region, and it may continue to benefit from development partnerships with both countries. Remittances from overseas workers will likely remain a central part of the economy, though it poses challenges for sustainable economic transformation.",
      timestamp: "2 hours ago",
      file_type: "text" as PostType,
      likes: 112,
    },
    {
      id: "2",
      author: "591_68",
      authorId: "112",
      wallet: "0x1abc...",
      title: "Beautiful city of Nepal",
      content: "",
      timestamp: "2 hours ago",
      imageUrl: "/lovable-uploads/183c2abd-abad-444f-8df8-954de4ce94e9.png",
      file_type: "image" as PostType,
      likes: 89,
    },
    {
      id: "3",
      author: "591_68",
      authorId: "112",
      wallet: "0x1abc...",
      title: "How will Nepal Be in 25 Years?",
      content:
        "A comprehensive analysis of Nepal's economic future and global standing.",
      timestamp: "2 hours ago",
      imageUrl: "/lovable-uploads/55734868-5a2b-497b-b73e-55a5db80d233.png",
      file_type: "image" as PostType,
      likes: 74,
    },
    {
      id: "4",
      author: "591_68",
      authorId: "112",
      wallet: "0x1abc...",
      title: "How will Nepal Be in 25 Years?",
      content:
        "A comprehensive analysis of Nepal's economic future and global standing.",
      timestamp: "2 hours ago",
      imageUrl: "/lovable-uploads/55734868-5a2b-497b-b73e-55a5db80d233.png",
      file_type: "image" as PostType,
      likes: 74,
    },
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area - 8 columns on large screens */}
        <div className="lg:col-span-8 space-y-6">
          {isLoggedIn ? (
            <UploadPanel />
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">
                Join the Conversation
              </h2>
              <p className="text-muted-foreground mb-4">
                zkLogin is a Sui primitive that provides the ability for you to
                send transactions from a Sui address using an OAuth credential,
                without publicly linking the two.
              </p>
              <Button onClick={login}>
                <FaGoogle />
                Sign in with Google
              </Button>
            </div>
          )}
          <ContentFeed posts={posts} />
        </div>

        {/* Sidebar - 4 columns on large screens */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24">
            <Leaderboard />
            <div className="mt-6">
              <AskQuestions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
