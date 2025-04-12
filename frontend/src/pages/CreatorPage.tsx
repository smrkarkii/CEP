import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Post } from "@/types/post";
import ContentCard from "@/components/Content/ContentCard";

interface Creator {
  id: string;
  name: string;
  bio: string;
  followers: number;
  likes: number;
  comments: number;
  walletAddress: string;
}

const dummyCreator: Creator = {
  id: "1",
  name: "Amanda Chen",
  bio: "Digital creator | Travel enthusiast | Sharing stories from around the world",
  followers: 12500,
  likes: 356,
  comments: 128,
  walletAddress: "0x3a5rqtwygsijaklm34rowijr-98c4d",
};

const CreatorPage = () => {
  const { id } = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
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
          file_type: "image",
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
          file_type: "text",
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
          file_type: "image",
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
          file_type: "text",
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

            <div className="text-center md:text-left mt-4">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl font-bold">{creator.name}</h1>
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
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold">
              {creator.followers.toLocaleString()}
            </span>
            <span className="text-muted-foreground">Followers</span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold">{creator.likes}</span>
            <span className="text-muted-foreground">Likes</span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold">{creator.comments}</span>
            <span className="text-muted-foreground">Comments</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center md:justify-start px-4 sm:px-6">
        <Badge variant="outline" className="px-3 py-1 bg-accent">
          {creator.walletAddress.slice(0, 5)}...
          {creator.walletAddress.slice(-4)}
        </Badge>
      </div>

      <div className="mt-6 py-6 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link to={`/post/${post.id}`} key={post.id}>
              <ContentCard post={post} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatorPage;
