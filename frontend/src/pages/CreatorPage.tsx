import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Post } from "@/types/post";
import ContentCard from "@/components/Content/ContentCard";
import { SuiObjectData } from "@mysten/sui.js/client";
import {
  getAllContentsByUser,
  getContentObjects,
} from "@/services/contentServices";
import CopyButton from "@/components/CopyButton";

interface Creator {
  id: string;
  name: string;
  bio: string;
  followers: number;
  likes: number;
  comments: number;
  walletAddress: string;
}

const mapSuiObjectToPost = (suiObject: SuiObjectData): Post => {
  const fields = suiObject.content?.fields as any;

  return {
    id: suiObject.objectId || "",
    author: fields?.owner || "Unknown Creator",
    authorId: fields?.owner || "",
    wallet: fields?.owner || "",
    title: fields?.title || "Untitled",
    content: fields?.description || "",
    blob_id: fields?.blob_id ?? "",
    timestamp: new Date().toISOString(),
    file_type: fields?.file_type?.includes("image") ? "image" : "text",
    likes: 0,
  };
};

const CreatorPage = () => {
  const { id } = useParams<{ id: string }>();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!id) {
        setError("Creator ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const creatorProfile: Creator = {
          id: id,
          name: `Creator ${id.slice(0, 5)}...${id.slice(-4)}`,
          bio: "Digital creator on the Sui blockchain",
          followers: 0,
          likes: 0,
          comments: 0,
          walletAddress: id,
        };

        setCreator(creatorProfile);

        const contentIds = await getAllContentsByUser(id);
        console.log("objectids", contentIds);
        if (contentIds && contentIds.length > 0) {
          const contentObjects = await getContentObjects(contentIds);

          const creatorPosts = contentObjects.map(mapSuiObjectToPost);
          setPosts(creatorPosts);
          console.log("User content objects:", contentObjects);
          console.log("posts", creatorPosts);
        }
      } catch (err) {
        console.error("Error fetching creator data:", err);
        setError("Failed to load creator data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatorData();
  }, [id]);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-65px)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-65px)]">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-65px)]">
        <div className="text-center">
          <p className="text-lg">Creator not found</p>
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
              <AvatarFallback>
                {creator.walletAddress.slice(0, 2).toUpperCase()}
              </AvatarFallback>
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
          <CopyButton
            textToCopy={creator.walletAddress}
            size={14}
            tooltipText="Copy wallet address"
          />
        </Badge>
      </div>

      <div className="mt-6 py-6 border-t">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link to={`/post/${post.id}`} key={post.id}>
                <ContentCard post={post} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              This creator hasn't published any content yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorPage;
