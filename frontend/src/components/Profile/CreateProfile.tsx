import { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLogin } from "@/context/UserContext";
import { toast } from "sonner";
import { useEnokiFlow } from "@mysten/enoki/react";
import { CreateUserProfile } from "@/services/profileServices";

const CreateProfile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  });

  const { userDetails } = useLogin();
  const flow = useEnokiFlow();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const profileData = {
        ...formData,
        address: userDetails.address,
      };
      console.log("Profile data:", profileData);

      await CreateUserProfile(formData.name, formData.bio, flow);

      toast.success("Profile Created", {
        description:
          "Your profile has been successfully created on the blockchain!",
      });
    } catch (error) {
      console.error("Failed to create profile:", error);
      toast.error("Error", {
        description: "Failed to create your profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            required
          />
        </div>

        <div>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Bio"
            className="w-full p-2 border rounded min-h-24 focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating Profile..." : "Create Profile"}
        </Button>
      </form>
    </>
  );
};

export default CreateProfile;
