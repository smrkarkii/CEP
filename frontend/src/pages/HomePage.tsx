import { useEffect, useState } from "react";
import UploadPanel from "../components/Home/UploadPanel";
import Leaderboard from "@/components/Leaderboard";
import AskQuestions from "@/components/AskQuestions";
import { useLogin } from "@/context/UserContext";
import AllCreators from "@/components/Home/AllCreators";
import {
  getAllContentsByUser,
  getContentObject,
  getContentObjects,
} from "@/services/contentServices";
import { SuiObjectData } from "@mysten/sui.js/client";
import LoggedOutView from "@/components/Home/LoggedOutView";
import { Loader } from "lucide-react";

const HomePage = () => {
  const { isLoggedIn, userDetails } = useLogin();
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

  {
    isLoading && (
      <>
        <Loader />
      </>
    );
  }

  {
    error && (
      <>
        <span className="text-red-500">{error}</span>
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {isLoggedIn ? (
            <>
              <UploadPanel />
              <AllCreators />
            </>
          ) : (
            <LoggedOutView />
          )}
        </div>

        {isLoggedIn && (
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24">
              <Leaderboard />
              <div className="mt-6">
                <AskQuestions />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
