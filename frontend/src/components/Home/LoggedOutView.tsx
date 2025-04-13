import { useLogin } from "@/context/UserContext";
import { Button } from "../ui/button";
import { FaGoogle } from "react-icons/fa";

const LoggedOutView = () => {
  const { login } = useLogin();
  return (
    <div className="flex w-full">
      <div className="hidden md:block md:w-1/3  h-full">
        <div className="h-full p-2">
          <img
            alt="CEP background"
            className="w-full h-full object-cover rounded-xl"
            style={{ maxHeight: "100%" }}
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center gap-6 md:gap-10 justify-center z-10">
        <div className="h-[6rem] md:h-[8rem] w-[6rem] md:w-[8rem]">
          <img src="vite.svg" className="h-full w-full object-cover" />
        </div>
        <h2 className="mt-2 md:mt-6 text-xl md:text-3xl font-semibold font-poppins text-primary">
          Welcome to cre8Space
        </h2>

        <Button onClick={login}>
          <FaGoogle />
          Sign in with Google
        </Button>

        <p className="text-xs text-center text-gray-500 px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoggedOutView;
