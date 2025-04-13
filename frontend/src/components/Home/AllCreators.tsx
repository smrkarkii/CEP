import { useState, useEffect } from "react";
import CreatorCard from "../Creator/CreatorCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Creator } from "@/types/creator";

const AllCreators = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const dummyCreators = [
        {
          id: "1",
          name: "Amanda Chen",
          bio: "Digital creator | Travel enthusiast | Sharing stories from around the world",
          followers: 12500,
          likes: 356,
          comments: 128,
          walletAddress: "0x3a5rqtwygsijaklm34rowijr-98c4d",
        },
        {
          id: "2",
          name: "John Smith",
          bio: "Tech enthusiast | NFT artist | Building the future of web3",
          followers: 8750,
          likes: 291,
          comments: 86,
          walletAddress: "0x4b2cst6yhnjklio75pojutgfr-12e8f",
        },
        {
          id: "3",
          name: "Sophie Martinez",
          bio: "Photography & Visual storytelling | Documenting life's precious moments",
          followers: 15300,
          likes: 427,
          comments: 152,
          walletAddress: "0x7d9xzewtbhnjikolp65reqdst-34a2c",
        },
        {
          id: "4",
          name: "Raj Patel",
          bio: "Blockchain developer | Crypto analyst | Sharing insights on decentralized systems",
          followers: 9250,
          likes: 318,
          comments: 94,
          walletAddress: "0x2f6rstuvwxyzabcde87fghijk-56b3d",
        },
        {
          id: "5",
          name: "Emma Wilson",
          bio: "Digital art creator | Animation enthusiast | Turning ideas into visual reality",
          followers: 10750,
          likes: 342,
          comments: 115,
          walletAddress: "0x9e1qazwsxedc45rfvtgbyhnuj-78m2k",
        },
        {
          id: "6",
          name: "Alex Johnson",
          bio: "Content creator | Travel blogger | Exploring one destination at a time",
          followers: 7800,
          likes: 263,
          comments: 76,
          walletAddress: "0x6h7jklmnopqrstuv12wxyzab-90c4e",
        },
      ];

      setCreators(dummyCreators);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Popular Creators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div
                key={index}
                className="h-48 rounded-lg bg-accent animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Creators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AllCreators;
