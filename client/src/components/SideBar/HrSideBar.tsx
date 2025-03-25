import { NavDropdown } from "./NavDropdown";
import { NavLink } from "react-router-dom";
import FeedIcon from "@/assets/icons/FeedIcon"
import MessageIcon from "@/assets/icons/MessageIcon"
import TimeIcon from "@/assets/icons/TimeIcon"
import CalendarIcon from "@/assets/icons/CalendarIcon"
import ChartIcon from "@/assets/icons/ChartIcon"
import EmployeesIcon from "@/assets/icons/EmployeesIcon"
import ProfileAdd2 from "@/assets/icons/ProfileAdd2"

export const HrSideBar = () => {
  const navItems = [
    { icon: FeedIcon, label: "Feed", path: "feed" },
    {
      icon: EmployeesIcon,
      label: "Employees",
      labelClassName: "ml-4",
      path: "/employees",
      items: [
        { label: "Manage Employees", path: "manageemployees" },
        { label: "All Departments", path: "alldepartments" },
      ],
    },
    {
      icon: TimeIcon,
      label: "Time Off",
      labelClassName: "ml-4",
      path: "/time-off",
      items: [
        { label: "My Time Off", path: "time-off" },
        { label: "Employee Time Off", path: "emp-time-off" },
      ],
    },
    { icon: ProfileAdd2, 
      label: 'Recruitment',
      labelClassName: "ml-3",
      path: '/hr/recruitment',
      items: [
        { label: 'FullTime', path: '/hr/recruitment/employee' },
        { label: 'NSS', path: '/hr/recruitment/nss' }
      ] 
    },
    { icon: MessageIcon, label: "Messages", path: "messages" },
    { icon: CalendarIcon, label: "Events", path: "events" },
    { icon: ChartIcon, label: "Reports", path: "reports" },
  ];

  return (
    <nav className="w-[280px] rounded-4xl h-fit text-center bg-white flex-col hidden md:flex">
      <NavLink
        to="/hr/dashboard"
        end={true}
        className={({ isActive }) => `
            group flex items-center justify-center text-center font-medium text-sm 
            rounded-t-4xl py-4 mb-2 w-full transition-colors ease-in-out duration-400
            ${
              isActive
                ? "bg-rgtviolet text-white" // Active state styles
                : "hover:bg-rgtviolet hover:text-white" // Base + hover state
            }`}
      >
        {({ isActive }) => (
          <>
            <span>HR Dashboard</span>
            <div className="relative ml-2 w-6 h-6">
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
          </>
        )}
      </NavLink>
      <div className=" pb-2.5 w-full text-center flex flex-col gap-3">
        {navItems.map((item) =>
          item.items ? (
            <NavDropdown
              items={item.items}
              label={item.label}
              icon={item.icon}
              className="w-48 "
              labelClassName={item.labelClassName}
              itemlabelClassName="ml-6 text-sm"
            />
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
            relative flex items-center gap-3 px-4 py-2.5 
            transition-colors duration-200 
            ${
              isActive
                ? " text-purple-600 font-bold"
                : " hover:bg-gray-50"
            }
            `}
            >
              {({ isActive }) => (
                <>
                  {/* Left accent bar */}
                  <span
                    className={`absolute left-0 top-0 h-full w-[5px] rounded-r-xl transition-all 
                    ${isActive ? "bg-purple-600" : "bg-transparent"}`}
                  />
                  {/* <img src={item.icon} className="h-6 w-6 mr-4" /> */}
                  {isActive ? <item.icon color="#9810fa" /> : <item.icon />}
                  <span className="text-sm font-medium ml-4">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        )}
      </div>
    </nav>
  );
};
