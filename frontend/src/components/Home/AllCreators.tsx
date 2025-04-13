import { useState, useEffect } from "react";
import CreatorCard from "../Creator/CreatorCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Creator } from "@/types/creator";
import {
  getAllCreators,
  getCreatorObjectDetails,
} from "@/services/creatorServices";
import { useLogin } from "@/context/UserContext";
import { SuiObjectData } from "@mysten/sui.js/client";
import { Loader } from "lucide-react";

const AllCreators = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatorIds, setCreatorIds] = useState<string[]>([]);
  const [creatorObjects, setCreatorObjects] = useState<SuiObjectData[]>([]);
  const { isLoggedIn, userDetails } = useLogin();

  useEffect(() => {
    const fetchAllCreators = async () => {
      if (!userDetails?.address) return;

      try {
        setIsLoading(true);
        // Get all creator IDs
        const creatorObjectIds = await getAllCreators(userDetails.address);
        console.log("All creator IDs:", creatorObjectIds);
        setCreatorIds(creatorObjectIds);

        // Get creator object details
        if (creatorObjectIds.length > 0) {
          const creatorDetails = await getCreatorObjectDetails(
            creatorObjectIds
          );
          console.log("Creator object details:", creatorDetails);
          setCreatorObjects(creatorDetails);

          // Map the creator objects to our Creator type
          const mappedCreators = creatorDetails.map((obj) => {
            const fields = obj.content?.fields as any;
            return {
              id: obj.objectId,
              name: fields?.name || "Unknown Creator",
              bio: fields?.bio || "No bio available",
              walletAddress: obj.owner?.AddressOwner || "",
              publishedContentsCount: fields?.published_contents?.length || 0,
              totalEngagement: fields?.total_engagement || "0",
              // Default values for backwards compatibility with existing UI
              followers: 0,
              likes: parseInt(fields?.total_engagement || "0", 10),
              comments: 0,
            };
          });

          setCreators(mappedCreators);
        }
      } catch (error) {
        console.error("Error fetching creators:", error);
        setError("Failed to load creator information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userDetails?.address) {
      fetchAllCreators();
    }
  }, [userDetails?.address]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Popular Creators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin mr-2" />
            <span>Loading creators...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Popular Creators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center py-4">{error}</div>
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
        {creators.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No creators found. Be the first to register!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllCreators;
