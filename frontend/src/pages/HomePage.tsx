import { useEffect, useState } from "react";
import UploadPanel from "../components/Home/UploadPanel";
import Leaderboard from "@/components/Leaderboard";
import AskQuestions from "@/components/AskQuestions";
import { useLogin } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import AllCreators from "@/components/Home/AllCreators";
import {
  getAllContentsByUser,
  getContentObject,
  getContentObjects,
} from "@/services/contentServices";
import { SuiObjectData } from "@mysten/sui.js/client";

const HomePage = () => {
  const { isLoggedIn, login, userDetails } = useLogin();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userContentIds, setUserContentIds] = useState<string[]>([]);
  const [userContentObjects, setUserContentObjects] = useState<SuiObjectData[]>(
    []
  );

  useEffect(() => {
    const fetchUserContentIds = async () => {
      if (isLoggedIn && userDetails?.address) {
        try {
          setIsLoading(true);
          setError(null);
          const contentIds = await getAllContentsByUser(userDetails.address);
          console.log("User content IDs:", contentIds);
          setUserContentIds(contentIds);
        } catch (err) {
          console.error("Error fetching user content IDs:", err);
          setError("Failed to load your content IDs. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserContentIds();
  }, [isLoggedIn, userDetails?.address]);

  useEffect(() => {
    const fetchContentObjects = async () => {
      if (userContentIds.length > 0) {
        try {
          setIsLoading(true);
          const contentObjects = await getContentObjects(userContentIds);
          console.log("User content objects:", contentObjects);
          setUserContentObjects(contentObjects);
        } catch (err) {
          console.error("Error fetching content objects:", err);
          setError(
            "Failed to load your content details. Please try again later."
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchContentObjects();
  }, [userContentIds]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
          <AllCreators />
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
