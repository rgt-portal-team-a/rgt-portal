import { Search, Bell } from "lucide-react";
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
import { useState, useEffect } from "react";
import { Employee } from "@/types/employee";
import { employeeService } from "@/api/services/employee.service";
import { debounce } from "lodash";
import { useMemo } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";

export const BaseLayout = () => {
  const { currentUser: user } = useAuthContextProvider();
  const {
    isDepartmentsLoading,
    isDepartmentsError,
    refetchDepartments,
    departmentsError,
  } = useInitializeSharedData();
  const { unreadCount } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);


  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const debouncedFetchSearchResults = useMemo(
    () =>
      debounce(async (query: string) => {
        console.log("query:", query);
        if (!query) {
          setSearchResults([]);
          return;
        }

        try {
          const results = await employeeService.getAllEmployees(query);
          console.log("search results:", results);
          setSearchResults(results);
        } catch (error) {
          console.error("Failed to fetch search results:", error);
          setSearchResults([]);
        }
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedFetchSearchResults.cancel();
    };
  }, [debouncedFetchSearchResults]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsDropdownVisible(!!query);
    debouncedFetchSearchResults(query);
  };

  if (isDepartmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner label="Fetching Shared Data..." size={32} />;
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

  return (
    <div>
      <header
        className="fixed top-0 flex items-center justify-between p-4 bg-white border-b w-full"
        style={{ zIndex: 1000 }}
      >
        {/* Left section with logo */}
        <div className="flex items-center">
          <div className="">
            <img src="/RgtPortalLogo.svg" className="w-24" />
          </div>
        </div>

        <div className="flex w-full justify-end gap-3">
          {/* Center section with search */}
          <div className="relative w-[30%]">
            <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search employees..."
              className="pl-10 py-5 bg-gray-50 border-none outline-none shadow-none"
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
                className="absolute top-16 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
                style={{ zIndex: 100 }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((employee) => (
                    <div
                      key={employee.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm text-slate-500 font-semibold text-wrap block"
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
        </div>
      </header>
      <div className="flex px-[13px] sm:space-x-[17px] w-screen h-screen">
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
          className="pt-[78px] flex-1 h-screen overflow-y-auto"
          style={{
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* IE and Edge */,
          }}
        >
          <Outlet />
        </div>
      </div>
      <NotificationContainer
        isOpen={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </div>
  );
};
