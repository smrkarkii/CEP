import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Creator } from "@/types/creator";
import CopyButton from "../CopyButton";

const CreatorCard = ({ creator }: { creator: Creator }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/creator/${creator.id}`);
  };

  return (
    <div
      className="flex flex-col items-center border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={handleClick}
    >
      <Avatar className="w-16 h-16 border-2 border-background">
        <AvatarImage
          src={`https://source.unsplash.com/random/200x200/?portrait&u=${creator.id}`}
          alt={creator.name}
        />
        <AvatarFallback>{creator.name.slice(0, 2)}</AvatarFallback>
      </Avatar>

      <div className="text-center mt-4 w-full">
        <h3 className="text-lg font-bold">{creator.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {creator.bio}
        </p>

        <div className="flex items-center justify-center gap-3 mt-3 text-xs">
          {creator.followers && (
            <div className="flex flex-col items-center">
              <span className="font-semibold">
                {creator.followers.toLocaleString()}
              </span>
              <span className="text-muted-foreground">Followers</span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <span className="font-semibold">{creator.likes}</span>
            <span className="text-muted-foreground">Likes</span>
          </div>
        </div>

        <Badge variant="outline" className="mt-4 px-2 py-1 bg-accent text-xs">
          {creator.walletAddress.slice(0, 5)}...
          {creator.walletAddress.slice(-4)}
          <CopyButton
            textToCopy={creator.walletAddress}
            size={14}
            tooltipText="Copy wallet address"
          />
        </Badge>

        <Button variant="outline" size="sm" className="mt-4 w-full">
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default CreatorCard;
