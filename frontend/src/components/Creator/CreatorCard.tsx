import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Creator } from "@/types/creator";

const CreatorCard = ({ creator }: { creator: Creator }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/creator/${creator.walletAddress}`);
  };

  const generateColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase().padStart(6, "0");
    return `#${c}`;
  };

  const bgColor = generateColor(creator.name);

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
        <AvatarFallback style={{ backgroundColor: bgColor }}>
          {creator.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="text-center mt-4 w-full">
        <h3 className="text-lg font-bold">{creator.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {creator.bio}
        </p>

        <Button variant="outline" size="sm" className="mt-4 w-full">
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default CreatorCard;
