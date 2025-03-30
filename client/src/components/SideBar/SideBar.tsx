/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Avtr from "../Avtr";
import { ChevronDown } from "lucide-react";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { useEffect, useRef, useState } from "react";
import FeedIcon from "@/assets/icons/FeedIcon";
import TimeIcon from "@/assets/icons/TimeIcon";
import DepartmentsIcon from "@/assets/icons/DepartmentsIcon";
import UserIcon from "@/assets/icons/UserIcon";
import LogoutIcon from "@/assets/icons/LogoutIcon";
import ConfirmCancelModal from "../common/ConfirmCancelModal";
import NavDropdown from "./NavDropdown";

export const SideBar = () => {
  const { currentUser: user, logout } = useAuthContextProvider();
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutModal, setLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const moreRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    navigate("/", { replace: true });
  };

  const navItems = [
    { icon: FeedIcon, label: "Feed", path: "feed" },
    {
      icon: DepartmentsIcon,
      label: "Departments",
      path: "all-departments",
    },
    {
      icon: TimeIcon,
      label: "Time Off",
      subRoutes: [
        {
          label: "My TimeOff",
          path: "time-off",
          icon: TimeIcon,
          roles: ["employee", "manager", "hr", "admin"],
        },
        {
          label: "Employee Time Off",
          path: "employee-requests",
          icon: TimeIcon,
          roles: ["hr", "admin", "manager"],
        },
      ],
    },
  ];

  // Filter subroutes based on user role
  const getFilteredSubRoutes = (subRoutes: any[]) => {
    if (!user?.role?.name) return [];
    return subRoutes.filter((route) =>
      route.roles?.includes(user.role.name.toLowerCase())
    );
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      const profileBox = document.querySelector(".show-profile-box");
      const dropdownMenu = moreRef.current;

      if (
        profileBox &&
        dropdownMenu &&
        !profileBox.contains(event.target as Node) &&
        !dropdownMenu.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="space-y-3 flex flex-col items-center h-full overflow-y-auto overflow-x-hidden">
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
      <div className="bg-white h-full rounded-[30px] flex flex-col items-center py-[31px] w-full max-w-[280px]">
        <div className="space-y-3">
          <div className="flex relative bg-[#452667] text-white justify-start items-center px-4 md:p-[16px] space-x-2 md:space-x-4 rounded-[16px] sm:w-[200px] md:w-[240px] h-[72px]">
            <Avtr
              url={user?.profileImage as string}
              name={user?.username as string}
              className="border-0"
            />
            <div className="sm:flex flex-col items-start justify-start hidden">
              <p className="font-bold text-[15px] text-nowrap sm:w-[97px] md:w-32 text-start truncate">
                {user?.username}
              </p>
              <p className="text-[#F6F6F9] text-[12px] font-medium">
                {user?.role.name}
              </p>
            </div>
            <div
              className={`show-profile-box flex flex-1 justify-end cursor-pointer transition-all duration-300 ease-in ${
                showProfile ? "rotate-180" : ""
              }`}
              onClick={() => setShowProfile(!showProfile)}
            >
              <ChevronDown className="text-white font-bold" size={20} />
            </div>
            {/* Dropdown Menu */}
            {showProfile && (
              <div
                className="absolute top-[45px] right-0  mx-2 bg-white border border-gray-200 rounded-lg shadow-lg  w-fit"
                ref={moreRef}
              >
                <div className=" flex flex-col items-center font-semibold">
                  <NavLink
                    to="profile"
                    className=" py-2 px-2  text-sm text-[#706D8A] md:hover:bg-gray-100 rounded-t-lg flex items-center border-b"
                  >
                    <UserIcon size={24} className="" />
                    <p className="hidden md:block">Profile</p>
                  </NavLink>
                  <button
                    onClick={() => setLogoutModal(true)}
                    className="flex cursor-pointer items-center  text-left py-2 px-2  text-sm text-[#EF4444]  rounded-b-lg  md:hover:bg-gray-100 "
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
          {navItems.map((item) => {
            const hasSubRoutes =
              item.subRoutes && getFilteredSubRoutes(item.subRoutes).length > 0;

            return hasSubRoutes ? (
              <NavDropdown
                key={item.label}
                items={getFilteredSubRoutes(item.subRoutes)}
                label={item.label}
                icon={item.icon}
                className="w-24 h-10"
                itemlabelClassName="ml-6 text-sm"
                activeBgClr="bg-[#E328AF]"
                activeTabClr="#E328AF"
                activeTxtClr="text-[#E328AF]"
              />
            ) : (
              <div className="w-full" key={item.path}>
                <NavLink to={item.path as string}>
                  {({ isActive }) => (
                    <div
                      className={`flex items-center justify-start py-3 transition-colors duration-200 font-medium text-[#706D8A] ${
                        isActive ? "text-[#E328AF]" : "hover:bg-gray-100"
                      }`}
                    >
                      {isActive && (
                        <div className="h-[30px] w-[5px] bg-[#E328AF] rounded-r-full" />
                      )}
                      <div className="flex items-center gap-3 w-full justify-center sm:justify-start sm:pl-5">
                        {isActive ? (
                          <item.icon color="#E328AF" size={26} />
                        ) : (
                          <item.icon size={24} />
                        )}
                        <span className="font-semibold text-base hidden sm:block">
                          {item.label}
                        </span>
                      </div>
                    </div>
                  )}
                </NavLink>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Logging out modal */}
      <ConfirmCancelModal
        isOpen={showLogoutModal}
        onCancel={() => setLogoutModal(false)}
        onSubmit={handleLogout}
        submitText="Logout"
        onOpenChange={() => setLogoutModal(false)}
        isSubmitting={loggingOut}
      >
        <div className="flex justify-center flex-col items-center gap-1">
          <div className="rounded-full p-2 w-fit bg-red-50">
            <div className="rounded-full px-[10px] py-[8px] bg-red-100 w-fit flex justify-center">
              <LogoutIcon size={25} />
            </div>
          </div>
          <header className="text-lg font-semibold">Logging Out?</header>
          <p className="w-64 text-center font-medium text-slate-500 text-sm">
            Are you sure you want to log out? We're going to miss you
          </p>
        </div>
      </ConfirmCancelModal>
    </section>
  );
};
