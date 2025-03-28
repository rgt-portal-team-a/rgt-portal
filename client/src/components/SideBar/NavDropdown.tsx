import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Dot } from "lucide-react";
import { IconTypes } from "@/assets/icons/types";

interface Item {
  path: string;
  label: string;
  icon: React.FC<IconTypes>;
}

interface INavDropdown {
  items: Item[];
  icon: React.FC<IconTypes>;
  label: string;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  itemlabelClassName?: string;
  activeBgClr: string;
  activeTxtClr: string;
  activeTabClr: string;
}

export const NavDropdown = ({
  items,
  icon,
  activeBgClr,
  activeTxtClr,
  label = "Select an option",
  className = "",
  labelClassName = "",
  itemlabelClassName = "",
  activeTabClr = "#6418c3",
}: INavDropdown) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasActiveChild, setHasActiveChild] = useState(false);
  const location = useLocation();
  const IconComponent = icon;

  useEffect(() => {
    const currentPath = location.pathname.toLowerCase();

    const isAnyChildActive = items.some((item) => {
      const itemPath = item.path.toLowerCase().replace(/^\/|\/$/g, "");

      return (
        currentPath === `/${itemPath}` ||
        currentPath === itemPath ||
        currentPath.startsWith(`/${itemPath}/`) ||
        (currentPath.endsWith(`/${itemPath}`) && currentPath.includes(itemPath))
      );
    });

    setHasActiveChild(isAnyChildActive);
  }, [location, items]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`w-full py-2 ${className}`}>
      <div
        onClick={toggleDropdown}
        className={`flex items-center gap-3 transition-colors duration-200 cursor-pointer text-slate-500 ${
          hasActiveChild ? activeTxtClr : "hover:bg-gray-100"
        }`}
      >
        {/* Left accent bar - shows when any child is active */}
        <span
          className={`h-[30px] w-[5px] rounded-r-xl transition-all
              ${hasActiveChild ? `${activeBgClr}` : "bg-transparent"}`}
        />

        <div className="w-full flex">
          <div className="flex items-center gap-3">
            {hasActiveChild ? (
              <IconComponent color={`${activeTabClr}`} size={26} />
            ) : (
              <IconComponent color="gray" size={24} />
            )}
            <span
              className={`hidden md:block text-base font-semibold ${labelClassName} ${
                hasActiveChild ? activeTxtClr : ""
              }`}
            >
              {label}
            </span>
            <ChevronDown
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              } `}
              size={24}
              color={`${hasActiveChild ? activeTabClr : "gray"}`}
            />
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden w-full transition-all duration-500 ease-in-out
          ${isOpen ? "max-h-96" : "max-h-0"}`}
      >
        <div
          className={`mt-2 w-full rounded-md bg-white transition-all duration-500 ease-in-out
            ${
              isOpen
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform -translate-y-4"
            }`}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center md:gap-3 px-4 py-1 rounded-lg
                  transition-all duration-300 font-medium
                  ${isActive ? activeTxtClr : "text-gray-600 hover:bg-gray-50"}
                `}
                // onClick={() => setIsOpen(false)}
              >
                <Dot className=" h-6 w-6 transition-all ease-in-out duration-300" />
                <p className={`hidden md:block ${itemlabelClassName}`}>
                  {item.label}
                </p>
                <div className="md:hidden">{<item.icon size={18} />}</div>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavDropdown;
