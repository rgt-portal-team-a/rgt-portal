import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import rgtpatternimg1 from "@/assets/images/rgtpatternimg1.svg";
import loginMainImg from "@/assets/images/WomanAndBackground.png";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { UserStatus } from "@/lib/enums";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const WaitRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuthContextProvider();

  useEffect(() => {
    if (currentUser && currentUser.status === UserStatus.ACTIVE) {
      const from = location.state?.from?.pathname || "/emp/feed";
      navigate(from, { replace: true });
    }

    if (!currentUser) {
      navigate("/login", { replace: true });
    }

  }, [currentUser, location.state?.from?.pathname, navigate]);

  return (
    <div className="w-full min-h-screen overflow-hidden flex flex-col md:flex-row rounded-3xl">
      <div className="bg-white flex flex-col justify-center items-center px-4 sm:px-8 py-8 md:py-0 flex-grow order-2 md:order-1">
        <div className="w-full rounded-2xl shadow-md max-w-md space-y-2">
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-xl font-bold mb-4">Hang Tight!</h1>
            <p className="text-gray-600 text-lg mb-8">
              HR is working on your account for you!
            </p>
            <LoadingSpinner label=" You'll be allowed in as soon as onboarding is complete..."  />
          </div>
        </div>
      </div>


      <div className="hidden px-auto md:flex w-full  md:w-1/2 lg:w-1/2  xl:w-1/2 2xl:w-1/2 bg-purpleaccent2 text-center pb-20 flex-col justify-center order-1 md:order-2">
        <div className="relative  flex justify-center h-fit ">
          <img
            src={loginMainImg}
            alt="MainLogin Image"
            className="xl:scale-130"
          />
          <img
            src={rgtpatternimg1}
            className="absolute right-1/5 md:right-1/8 top-0"
          />
        </div>
      </div>
    </div>
  );
};

export default WaitRoom;
