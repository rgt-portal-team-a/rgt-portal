import { NavLink, useLocation } from "react-router-dom";
import Avtr from "../Avtr";
import { ChevronDown } from "lucide-react";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { useState } from "react";
import FeedIcon from "@/assets/icons/FeedIcon";
import MessageIcon from "@/assets/icons/MessageIcon";
import TimeIcon from "@/assets/icons/TimeIcon";
import DepartmentsIcon from "@/assets/icons/DepartmentsIcon";
import UserIcon from "@/assets/icons/UserIcon";
import LogoutIcon from "@/assets/icons/LogoutIcon";
import WithRole from "@/common/WithRole";

export const SideBar = () => {
  const { currentUser: user } = useAuthContextProvider();
  const [showProfile, setShowProfile] = useState(false);
  const [showTimeOffDropdown, setShowTimeOffDropdown] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: FeedIcon, label: "Feed", path: "feed" },
    {
      icon: DepartmentsIcon,
      label: "Departments",
      path: "all-departments",
    },
    { icon: MessageIcon, label: "Messages", path: "messages" },
    {
      icon: TimeIcon,
      label: "Time Off",
      path: "time-off",
      subRoutes: [{ label: "Employee Time Off", path: "employee-requests" }],
    },
  ];

  // Handle dropdown toggle for Time Off
  const handleTimeOffClick = () => {
    setShowTimeOffDropdown((prev) => !prev);
  };

  // Close dropdown when another tab is selected
  const handleNavItemClick = () => {
    setShowTimeOffDropdown(false);
  };

  return (
    <section className="space-y-3 flex flex-col items-center h-full">
      {(location.pathname === "/emp/feed" ||
        location.pathname === "/hr/feed") && (
        <header className="md:flex flex-col items-start hidden">
          <p className="font-semibold text-[24px] text-[#706D8A]">
            Hello, there!
          </p>
          <p className="text-sm font-medium text-[#8C8C8C]">
            Welcome back, let's explore now!
          </p>
        </header>
      )}
      <div className="bg-white rounded-[30px] flex flex-col items-center py-[31px] ">
        <div className="space-y-3">
          <div className="flex relative bg-[#452667] text-white justify-start items-center px-4 md:p-[16px] space-x-2 md:space-x-4 rounded-[16px] md:w-[240px] h-[72px]">
            <Avtr
              url={user?.profileImage as string}
              name={user?.username as string}
              className="border-0"
            />
            <div className="md:flex flex-col items-start justify-center hidden">
              <p className="font-bold text-[15px] text-nowrap w-32 truncate">
                {user?.username}
              </p>
              <p className="text-[#F6F6F9] text-[12px] font-medium">
                {user?.role.name}
              </p>
            </div>
            <div
              className={`flex flex-1 justify-end cursor-pointer transition-all duration-300 ease-in ${
                showProfile ? "rotate-180" : ""
              }`}
              onClick={() => setShowProfile(!showProfile)}
            >
              <ChevronDown className="text-white font-bold" size={20} />
            </div>
            {/* Dropdown Menu */}
            {showProfile && (
              <div className="absolute top-[45px] right-0 bg-white border border-gray-200 rounded-lg shadow-lg h-[100px] z-10">
                <div className="py-2 px-2 flex flex-col font-semibold">
                  <NavLink
                    to="/profile"
                    className="  py-2 text-sm text-[#706D8A] md:hover:bg-gray-100 flex items-center border-b"
                  >
                    <UserIcon size={24} className="" />
                    <p className="hidden md:block">Profile</p>
                  </NavLink>
                  <button
                    onClick={() => {
                      // Handle logout logic here
                      console.log("Logout clicked");
                    }}
                    className="flex cursor-pointer items-center w-full text-left py-2 text-sm text-[#EF4444] md:hover:bg-gray-100 "
                  >
                    <LogoutIcon size={24} />
                    <p className="hidden md:block">Logout</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <nav className="rounded-xl justify-start items-center md:items-start sm:min-w-[100px] md:min-w-[280px] flex flex-col pt-[10px] space-y-1">
          {navItems.map((item) => (
            <div className="w-full" key={item.path}>
              <NavLink
                to={item.path}
                onClick={
                  item.label === "Time Off"
                    ? handleTimeOffClick
                    : handleNavItemClick
                }
              >
                {({ isActive }) => (
                  <div
                    className={`
              flex items-center justify-start py-3 transition-colors duration-200 font-medium text-[#706D8A]
              ${isActive ? "text-[#E328AF]" : "hover:bg-gray-100"}
              `}
                  >
                    {isActive && (
                      <div
                        className={`h-[30px] w-[5px] bg-[#E328AF] rounded-r-full transition-transform duration-300 ease-in-out`}
                      />
                    )}
                    <div className="flex items-center gap-3 w-full justify-center sm:justify-start sm:pl-5">
                      {isActive ? (
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
                      <span className="font-semibold text-base hidden md:block">
                        {item.label}
                      </span>
                    </div>
                  </div>
                )}
              </NavLink>

              {/* Add sub-routes for Time Off */}
              {item.label === "Time Off" && showTimeOffDropdown && (
                <WithRole
                  roles={["manager"]}
                  userRole={user?.role.name as string}
                >
                  <div className="pl-8 space-y-1">
                    {item.subRoutes?.map((subItem) => (
                      <NavLink
                        to={`${item.path}/${subItem.path}`}
                        key={subItem.path}
                        onClick={handleNavItemClick}
                      >
                        {({ isActive }) => (
                          <div
                            className={`flex items-center py-2 transition-colors duration-200 font-medium text-[#706D8A]
                      ${isActive ? "text-[#E328AF]" : "hover:bg-gray-100"}`}
                          >
                            <span className="font-semibold text-base hidden md:block pl-8">
                              {subItem.label}
                            </span>
                          </div>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </WithRole>
              )}
            </div>
          ))}
        </nav>
      </div>
    </section>
  );
};
