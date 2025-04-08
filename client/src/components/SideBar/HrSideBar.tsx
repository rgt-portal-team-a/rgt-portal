import { NavLink } from "react-router-dom";
import FeedIcon from "@/assets/icons/FeedIcon";
import TimeIcon from "@/assets/icons/TimeIcon";
import CalendarIcon from "@/assets/icons/CalendarIcon";
import ChartIcon from "@/assets/icons/ChartIcon";
import EmployeesIcon from "@/assets/icons/EmployeesIcon";
import ProfileAdd2 from "@/assets/icons/ProfileAdd2";
import NavDropdown from "./NavDropdown";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export const HrSideBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: FeedIcon, label: "Feed", path: "feed" },
    {
      icon: EmployeesIcon,
      label: "Employees",
      labelClassName: "ml-4",
      path: "/employees",
      items: [
        {
          label: "Manage Employees",
          path: "manageemployees",
          icon: EmployeesIcon,
        },
        {
          label: "All Departments",
          path: "alldepartments",
          icon: EmployeesIcon,
        },
      ],
    },
    {
      icon: TimeIcon,
      label: "Time Off",
      labelClassName: "ml-4",
      path: "/time-off",
      items: [
        { label: "My Time Off", path: "time-off", icon: TimeIcon },
        { label: "Employee Time Off", path: "emp-time-off", icon: TimeIcon },
      ],
    },
    {
      icon: ProfileAdd2,
      label: "Recruitment",
      labelClassName: "ml-3",
      path: "/hr/recruitment",
      items: [
        {
          label: "FullTime",
          path: "/hr/recruitment/employee",
          icon: ProfileAdd2,
        },
        { label: "NSS", path: "/hr/recruitment/nss", icon: ProfileAdd2 },
      ],
    },
    { icon: CalendarIcon, label: "Events", path: "events" },
    {
      icon: ChartIcon,
      label: "Reports",
      path: "/reports",
      items: [
        {
          label: "Regular Report",
          path: "/hr/reports/regularreport",
          icon: ChartIcon,
        },
        {
          label: "Advanced Report",
          path: "/hr/reports/advancedreport",
          icon: ChartIcon,
        },
      ],
    },
  ];

  return (
    <div className="bg-pink-700 h-[610px]">
      {/* Mobile Menu Button */}
      <button
        className="sm:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <nav
        className={`
          fixed sm:relative z-40 md:w-[280px] h-full text-center bg-white flex-col rounded-[24px]
          transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? "left-0" : "-left-full sm:left-0"}
        `}
      >
        {/* Overlay for mobile */}
        {mobileMenuOpen && (
          <div
            className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <NavLink
          to="/hr/dashboard"
          end={true}
          className={({ isActive }) => `
            group flex items-center justify-center text-center font-medium text-sm 
            rounded-t-2xl py-4 mb-2 w-full transition-colors ease-in-out duration-400
            ${
              isActive
                ? "bg-rgtviolet text-white"
                : "hover:bg-rgtviolet hover:text-white"
            }`}
          onClick={() => setMobileMenuOpen(false)}
        >
          {({ isActive }) => (
            <div className="flex items-center justify-center gap-2">
              <span>HR Dashboard</span>
              <div className="relative w-6 h-6">
                <img
                  src="/Dashboard3.svg"
                  className={`absolute inset-0 w-full h-full transition-opacity duration-300 
                      ${isActive ? "opacity-0" : "opacity-100"}`}
                />
                <img
                  src="/DashboardWhite.svg"
                  className={`absolute inset-0 w-full h-full transition-opacity duration-300
                      ${isActive ? "opacity-100" : "opacity-0"}`}
                />
              </div>
            </div>
          )}
        </NavLink>

        <div className="pb-2.5 w-full text-center flex flex-col gap-3 overflow-y-auto h-[calc(100%-70px)]">
          {navItems.map((item, index) =>
            item.items ? (
              <NavDropdown
                key={index}
                items={item.items}
                label={item.label}
                icon={item.icon}
                activeBgClr="bg-rgtviolet"
                activeTxtClr="text-rgtviolet"
                activeTabClr="#6418c3"
                onItemClick={() => setMobileMenuOpen(false)}
              />
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  relative flex items-center gap-3 py-2.5 
                  transition-colors duration-200 
                  ${isActive ? "text-purple-600 font-bold" : "hover:bg-gray-50"}
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`h-[30px] w-[5px] rounded-r-xl transition-all 
                        ${isActive ? "bg-purple-600" : "bg-transparent"}`}
                    />
                    {isActive ? (
                      <item.icon color="#9810fa" size={26} />
                    ) : (
                      <item.icon size={24} color="#706D8A" />
                    )}
                    <span
                      className={`text-base text-[#706D8A] font-semibold ${
                        isActive ? "text-[#9810fa]" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          )}
        </div>
      </nav>
    </div>
  );
};
