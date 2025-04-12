import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Edit,
  Settings,
  Share2,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Post } from "@/types/post";

interface Creator {
  id: string;
  name: string;
  username: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  isVerified: boolean;
  coverImage: string;
  joinDate: string;
  walletAddress: string;
}

const dummyCreator: Creator = {
  id: "1",
  name: "Amanda Chen",
  username: "amandachen",
  bio: "Digital creator | Travel enthusiast | Sharing stories from around the world",
  followers: 12500,
  following: 356,
  posts: 128,
  isVerified: true,
  coverImage: "https://source.unsplash.com/random/1200x400/?landscape",
  joinDate: "May 2023",
  walletAddress: "0x3a5e...8c4d",
};

const ProfilePage = () => {
  const { id } = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setCreator(dummyCreator);

      const dummyPosts: Post[] = [
        {
          id: "1",
          author: dummyCreator.name,
          authorId: dummyCreator.id,
          wallet: dummyCreator.walletAddress,
          title: "My journey through the Himalayas",
          content: "I spent 3 weeks exploring the beautiful mountain range...",
          timestamp: "2023-06-15T08:30:00Z",
          type: "image",
          likes: 1249,
          imageUrl: "https://source.unsplash.com/random/600x400/?mountains",
        },
        {
          id: "2",
          author: dummyCreator.name,
          authorId: dummyCreator.id,
          title: "Creating digital art with AI",
          content:
            "Here's how I use AI tools to enhance my creative process...",
          timestamp: "2023-06-10T14:20:00Z",
          type: "text",
          likes: 532,
        },
        {
          id: "3",
          author: dummyCreator.name,
          authorId: dummyCreator.id,
          wallet: dummyCreator.walletAddress,
          title: "Street food adventures in Bangkok",
          content: "The vibrant street food scene in Bangkok is unmatched...",
          timestamp: "2023-06-05T18:45:00Z",
          type: "video",
          likes: 876,
          imageUrl: "https://source.unsplash.com/random/600x400/?food",
        },
        {
          id: "4",
          author: dummyCreator.name,
          authorId: dummyCreator.id,
          title: "5 tips for better landscape photography",
          content:
            "After years of taking landscape photos, here are my best tips...",
          timestamp: "2023-05-28T11:15:00Z",
          type: "text",
          likes: 1053,
        },
      ];

      setPosts(dummyPosts);
    }, 500);
  }, [id]);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  if (!creator) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-65px)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden">
        <img
          src={creator.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Info */}
      <div className="relative px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
            <Avatar className="w-24 h-24 border-4 border-background -mt-12 relative z-10">
              <AvatarImage
                src={`https://source.unsplash.com/random/200x200/?portrait&u=${creator.id}`}
                alt={creator.name}
              />
              <AvatarFallback>{creator.name.slice(0, 2)}</AvatarFallback>
            </Avatar>

            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl font-bold">{creator.name}</h1>
                {creator.isVerified && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground justify-center md:justify-start">
                <span>@{creator.username}</span>
                <span>•</span>
                <span>Joined {creator.joinDate}</span>
              </div>
              <p className="mt-2 text-sm max-w-md">{creator.bio}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-center md:self-auto">
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={toggleFollow}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold">{creator.posts}</span>
            <span className="text-muted-foreground">Posts</span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold">
              {creator.followers.toLocaleString()}
            </span>
            <span className="text-muted-foreground">Followers</span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold">
              {creator.following.toLocaleString()}
            </span>
            <span className="text-muted-foreground">Following</span>
          </div>
        </div>
      </div>

      {/* Wallet Badge */}
      <div className="flex justify-center md:justify-start px-4 sm:px-6">
        <Badge variant="outline" className="px-3 py-1 bg-accent">
          {creator.walletAddress}
        </Badge>
      </div>

      {/* Tabs & Content */}
      <div className="mt-6">
        <Tabs
          defaultValue="posts"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <div className="px-4 sm:px-6">
            <TabsList className="w-full grid grid-cols-3 mb-8">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="posts" className="space-y-8 px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Link to={`/post/${post.id}`} key={post.id}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
                    {post.imageUrl && (
                      <div className="aspect-video w-full">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {new Date(post.timestamp).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">
                            {post.likes.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            likes
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collections" className="px-4 sm:px-6">
            <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
              No collections yet
            </div>
          </TabsContent>

          <TabsContent value="activity" className="px-4 sm:px-6">
            <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
              No recent activity
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
