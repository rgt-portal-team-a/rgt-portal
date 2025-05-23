import DepartmentsIcon from "@/assets/icons/DepartmentsIcon";
import FeedIcon from "@/assets/icons/FeedIcon";
import ProfileIcon from "@/assets/icons/ProfileIcon";
import TimeIcon from "@/assets/icons/TimeIcon";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { useLocation, useNavigate } from "react-router-dom";

const MobileBottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuthContextProvider();

  return (
    <section className="fixed bottom-0 self-center bg-white border-gray-200 sm:hidden w-[90%] mb-2 shadow-md shadow-gray-600 rounded-[21.5px]"style={{zIndex:"1010"}}>
      <div className="flex justify-between items-center h-14 px-4">
        {/* Main button (1 unit width) */}
        <button
          onClick={() => navigate("feed")}
          className={`flex flex-col items-center justify-center w-1/4 h-full ${
            location.pathname.includes("feed")
              ? "text-[#E328AF]"
              : "text-gray-500"
          }`}
        >
          {location.pathname.includes("feed") ? (
            <FeedIcon
              color="#E328AF"
              size={26}
              className="transition-all duration-300 ease-in-out"
            />
          ) : (
            <FeedIcon
              size={24}
              className="transition-all duration-300 ease-in-out"
            />
          )}
          {/* <span className="text-xs mt-1">Feed</span> */}
        </button>

        {/* Three secondary buttons (0.5 unit width each) */}
        {[
          { icon: DepartmentsIcon, label: "Depts", path: "all-departments" },
          { icon: TimeIcon, label: "Time Off", path: "time-off" },
          currentUser?.role.name === ("MANAGER" as string)
            ? {
                icon: ProfileIcon,
                label: "Employee Time Off",
                path: "employee-requests",
              }
            : null,
        ]
          .filter((item) => item !== null)
          .map((item) => (
            <button
              key={item?.path}
              onClick={() => item?.path && navigate(item.path)}
              className={`flex flex-col items-center justify-center w-1/6 h-full ${
                item && location.pathname.includes(item.path)
                  ? "text-[#E328AF]"
                  : "text-gray-500"
              }`}
            >
              {location.pathname.includes(item.path) ? (
                <item.icon
                  color="#E328AF"
                  size={26}
                  className="transition-all duration-300 ease-in-out"
                />
              ) : (
                <item.icon
                  size={24}
                  className="transition-all duration-300 ease-in-out"
                />
              )}
              {/* <span className="text-xs mt-1">{item.label}</span> */}
            </button>
          ))}
      </div>
    </section>
  );
};

export default MobileBottomBar;
