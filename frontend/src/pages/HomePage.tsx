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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CreateProfile from "@/components/Profile/CreateProfile";
import { getIsCreator } from "@/services/profileServices";
import {
  getAllCreators,
  getCreatorObjectDetails,
} from "@/services/creatorServices";

const HomePage = () => {
  const { isLoggedIn, userDetails } = useLogin();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const [userContentIds, setUserContentIds] = useState<string[]>([]);
  // const [userContentObjects, setUserContentObjects] = useState<SuiObjectData[]>(
  //   []
  // );
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const handleRegisterNowClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProfileDialogOpen(true);
  };

  useEffect(() => {
    const creatorStatus = async () => {
      if (!userDetails?.address) return;

      try {
        const creator = await getIsCreator(userDetails.address);
        console.log("creator", creator);
        if (creator === 1) {
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }
      } catch (error) {
        console.error("Error checking creator status:", error);
        setError("Failed to check creator status. Please try again later.");
      }
    };

    // const fetchAllCreators = async () => {
    //   if (!userDetails?.address) return;

    //   try {
    //     setIsLoading(true);
    //     // Get all creator IDs
    //     const creatorObjectIds = await getAllCreators(userDetails.address);
    //     console.log("All creator IDs:", creatorObjectIds);
    //     setCreatorIds(creatorObjectIds);

    //     // Get creator object details
    //     if (creatorObjectIds.length > 0) {
    //       const creatorDetails = await getCreatorObjectDetails(
    //         creatorObjectIds
    //       );
    //       console.log("Creator object details:", creatorDetails);
    //       setCreatorObjects(creatorDetails);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching creators:", error);
    //     setError("Failed to load creator information. Please try again later.");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // const fetchContentObjects = async () => {
    //   if (userContentIds.length > 0) {
    //     try {
    //       setIsLoading(true);
    //       const contentObjects = await getContentObjects(userContentIds);
    //       console.log("User content objects:", contentObjects);
    //       setUserContentObjects(contentObjects);
    //     } catch (error) {
    //       console.error("Error fetching content objects:", error);
    //       setError(
    //         "Failed to load your content details. Please try again later."
    //       );
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   }
    // };

    if (isLoggedIn && userDetails?.address) {
      creatorStatus();
      // fetchAllCreators();
      // fetchContentObjects();
    }
  }, [isLoggedIn, userDetails]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <Loader className="animate-spin" />
        </div>
      )}

      {error && (
        <div className="mb-4">
          <span className="text-red-500">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {isLoggedIn ? (
            <>
              {isRegistered ? (
                <UploadPanel />
              ) : (
                <div className="border rounded-md p-4 flex flex-col gap-6 items-center">
                  <span>
                    Register as a Content Creator to upload your content on
                    ChainFluence.
                  </span>
                  <Button onClick={handleRegisterNowClick}>Register now</Button>
                  <Dialog
                    open={isProfileDialogOpen}
                    onOpenChange={setIsProfileDialogOpen}
                  >
                    <DialogContent className="sm:max-w-md">
                      <CreateProfile />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              <AllCreators />
            </>
          ) : (
            <LoggedOutView />
          )}
        </div>

        {isLoggedIn && (
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky">
              {/* <Leaderboard /> */}
              <div className="">
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
