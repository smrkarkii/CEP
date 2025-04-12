import { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLogin } from "@/context/UserContext";

const CreateProfile = () => {
  const { userDetails } = useLogin();

  const [formData, setState] = useState({
    name: "",
    bio: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const profileData = {
      ...formData,
      address: userDetails.address,
    };
    console.log("Profile data:", profileData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">
          Create Your Profile
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Fill in your details to customize your profile.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Bio"
            className="w-full p-2 border rounded min-h-24 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <Button type="submit" className="w-full">
          Create Profile
        </Button>
      </form>
    </>
  );
};

export default CreateProfile;
