import { NavLink } from "react-router-dom";
import FeedIcon from "@/assets/icons/FeedIcon";
import EmployeesIcon from "@/assets/icons/EmployeesIcon";
import TimeIcon from "@/assets/icons/TimeIcon";
import ProfileAdd2 from "@/assets/icons/ProfileAdd2";
import ChartIcon from "@/assets/icons/ChartIcon";
import CalendarIcon from "@/assets/icons/CalendarIcon";

export const HrMobileBottomBar = () => {
  const mobileNavItems = [
    { icon: FeedIcon, label: "Feed", path: "/hr/feed" },
    {
      icon: EmployeesIcon,
      label: "Manage",
      path: "/hr/manageemployees",
    },
    {
      icon: EmployeesIcon,
      label: "Departments",
      path: "/hr/alldepartments",
    },
    {
      icon: TimeIcon,
      label: "My Time",
      path: "/hr/time-off",
    },
    {
      icon: TimeIcon,
      label: "Emp Time",
      path: "/hr/emp-time-off",
    },
    {
      icon: ProfileAdd2,
      label: "FullTime",
      path: "/hr/recruitment/employee",
    },
    {
      icon: ProfileAdd2,
      label: "NSS",
      path: "/hr/recruitment/nss",
    },
    { icon: CalendarIcon, label: "Events", path: "/hr/events" },
    {
      icon: ChartIcon,
      label: "Regular",
      path: "/hr/reports/regularreport",
    },
    {
      icon: ChartIcon,
      label: "Advanced",
      path: "/hr/reports/advancedreport",
    },
  ];

  return (
    <div
      className="fixed bottom-0 self-center bg-white border-gray-200 sm:hidden w-[90%] mb-2 shadow-md shadow-gray-600 rounded-[21.5px]"
      style={{ zIndex: "1010" }}
    >
      <div className="relative h-16 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-full flex items-center overflow-x-auto scrollbar-hide px-2">
          <div className="flex space-x-4">
            {mobileNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex flex-col items-center justify-center 
                  min-w-max px-2 py-1 rounded-lg transition-colors
                  ${
                    isActive
                      ? " text-purple-600"
                      : "text-gray-500 hover:bg-gray-100"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      color={isActive ? "#9810fa" : "#6b7280"}
                    />
                    <span className="text-xs mt-0.5">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrMobileBottomBar;
