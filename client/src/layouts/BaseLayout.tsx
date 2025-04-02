import { Search, Bell, Loader, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HrSideBar } from "@/components/SideBar/HrSideBar";
import { SideBar } from "@/components/SideBar/SideBar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthContextProvider } from "../hooks/useAuthContextProvider";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useInitializeSharedData } from "@/hooks/useInitializeSharedData";
import { useNotifications } from "@/api/query-hooks/notification";
import { NotificationContainer } from "@/components/common/NotificationsContainer";
import WithRole from "@/common/WithRole";
import { useState, useEffect, useRef } from "react";
import { Employee } from "@/types/employee";
import { employeeService } from "@/api/services/employee.service";
import { debounce } from "lodash";
import { useMemo } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import CalendarIcon2 from "@/assets/icons/CalendarIcon2";
import Upcoming_SpecialCard from "@/components/common/Upcoming_SpecialCard.tsx";
import MobileBottomBar from "@/components/SideBar/MobileBottomBar";
import ProfileIcon from "@/assets/icons/ProfileIcon";
import LogoutIcon from "@/assets/icons/LogoutIcon";
import ConfirmCancelModal from "@/components/common/ConfirmCancelModal";
import HrMobileBottomBar from "@/components/SideBar/HrMobileBottomBar";

export const BaseLayout = () => {
  const { currentUser: user, logout } = useAuthContextProvider();
  const {
    isDepartmentsLoading,
    isDepartmentsError,
    refetchDepartments,
    departmentsError,
    isEmployeesLoading,
    isEmployeesError,
    refetchEmployees,
    employeesError,
  } = useInitializeSharedData();
  const { unreadCount } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const navigate = useNavigate();
  const debouncedFetchSearchResults = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query) {
          setSearchResults([]);
          return;
        }

        try {
          setLoadingSearch(true);
          const results = await employeeService.getAllEmployees(query);
          setSearchResults(results);
        } catch (error) {
          console.error("Failed to fetch search results:", error);
          setSearchResults([]);
        } finally {
          setLoadingSearch(false);
        }
      }, 500),
    []
  );
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setLogoutModal] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const handleCalendarShow = () => {
    setShowCalendar(!showCalendar);
  };

  useEffect(() => {
    return () => {
      debouncedFetchSearchResults.cancel();
    };
  }, [debouncedFetchSearchResults]);

  // outside click handler for calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        showCalendar
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsDropdownVisible(!!query);
    debouncedFetchSearchResults(query);
  };

  if (isDepartmentsLoading || isEmployeesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner label="Fetching Shared Data..." size={60} />
      </div>
    );
  }

  if (isDepartmentsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage
          title="Error Loading Shared Data"
          error={departmentsError}
          refetchFn={refetchDepartments}
        />
      </div>
    );
  }

  if (isEmployeesError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage
          title="Error Loading Shared Data"
          error={employeesError}
          refetchFn={refetchEmployees}
        />
      </div>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    navigate("/", { replace: true });
  };

  return (
    <div>
      <header
        className="fixed top-0 flex items-center justify-between p-4 bg-white border-b w-full h-18"
        style={{ zIndex: 1000 }}
      >
        {/* Left section with logo */}
        <div className="flex items-center">
          <div className="hidden sm:block">
            <img src="/RgtPortalLogo.svg" className="w-24" />
          </div>

          {/* Mobile profile dropdown */}
          <div
            className={`${
              user?.role.name === "HR" ? "sm:ml-4 pr-1" : "sm:hidden"
            } relative`}
            ref={profileDropdownRef}
          >
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <ChevronDown
                className={`h-4 w-4 text-gray-600 transition-transform ${
                  profileDropdownOpen ? "rotate-180" : ""
                }`}
              />
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {user?.employee.firstName?.charAt(0)}
                    {user?.employee.lastName?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p>Hello {user?.employee?.firstName}!</p>
                <p>This is the RGT team.</p>
              </div>
            </div>

            {profileDropdownOpen && (
              <div className="absolute right-0 border mt-2 sm:w-32 bg-white rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    navigate("/emp/profile");
                    setProfileDropdownOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left border-b"
                >
                  <ProfileIcon size={24} />
                  <p className="hidden sm:block">Profile</p>
                </button>
                <button
                  onClick={() => {
                    // logout();
                    setProfileDropdownOpen(false);
                    setLogoutModal(true);
                  }}
                  className=" px-4 py-2 items-center text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex"
                >
                  <LogoutIcon size={24} />
                  <p className="hidden sm:block">Logout</p>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full justify-end gap-3">
          <div className="relative w-full flex justify-end gap-1">
            {/* Center section with search */}
            <div className="relative w-full md:w-[400px] flex items-center">
              <Search className="absolute left-2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search employees..."
                className="pl-10 py-5 bg-gray-50 border-1 outline-none shadow-none w-full"
                value={searchQuery}
                onChange={handleOnChange}
                onFocus={() => setIsDropdownVisible(!!searchQuery)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsDropdownVisible(false);
                  }
                }}
              />
              {/* Dropdown for search results */}
              {isDropdownVisible && (
                <div
                  className="absolute top-16 left-0 w-[250px] sm:w-full bg-white border border-gray-200 rounded-lg shadow-lg"
                  style={{ zIndex: 100 }}
                >
                  {loadingSearch ? (
                    <div className="flex w-full p-2 items-center justify-center">
                      <Loader className="animate-spin text-rgtpurple" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((employee) => (
                      <div
                        key={employee.id}
                        className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm text-slate-500 font-semibold text-wrap block"
                        onClick={() => setIsDropdownVisible(false)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setIsDropdownVisible(false);
                          navigate(`/emp/${employee.id}`);
                        }}
                      >
                        {employee.firstName} {employee.lastName} -{" "}
                        {employee.user?.email}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No employees found</div>
                  )}
                </div>
              )}
            </div>

            {/* Right section with notification */}
            <div className="flex items-center">
              <button
                className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                onClick={() => setNotificationsOpen(true)}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
            <div
              className="xl:hidden flex justify-center items-center md:h-[60px] w-[60px] rounded-[16px] bg-[#F6F6F9] cursor-pointer hover:bg-slate-200 transition-all duration-300 ease-in"
              onClick={handleCalendarShow}
            >
              <CalendarIcon2 />
            </div>
            {showCalendar && (
              <div className="absolute -right-3 top-10" ref={calendarRef}>
                <div
                  className="h-[620px] w-[300px] pb-3 bg-white overflow-auto border-gray-400 border- shadow-lg shadow-gray-600 rounded-2xl"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  <Upcoming_SpecialCard />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex w-screen h-screen px-[13px] gap-[17px]">
        <div
          className="h-screen text-center sm:py-[78px] hidden sm:block overflow-y-scroll"
          style={{
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* IE and Edge */,
          }}
        >
          <WithRole
            roles={["hr", "admin"]}
            userRole={user?.role.name as string}
          >
            <HrSideBar />
          </WithRole>
          <WithRole
            roles={["employee", "manager", "marketer"]}
            userRole={user?.role.name as string}
          >
            <SideBar />
          </WithRole>
        </div>

        <div
          className="pt-[78px] flex-1 h-screen overflow-y-auto relative pb-[60px] sm:pb-0"
          style={{
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* IE and Edge */,
          }}
        >
          <Outlet />
        </div>
        <WithRole
          roles={["manager", "employee", "marketer"]}
          userRole={user?.role.name as string}
        >
          <MobileBottomBar />
        </WithRole>
        <WithRole roles={["hr"]} userRole={user?.role.name as string}>
          <HrMobileBottomBar />
        </WithRole>
      </div>
      <NotificationContainer
        isOpen={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />

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
    </div>
  );
};
