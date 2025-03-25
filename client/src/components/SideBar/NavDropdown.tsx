import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Dot } from "lucide-react";
import { IconTypes } from "@/assets/icons/types";

interface Item {
  path: string;
  label: string;
}

interface INavDropdown {
  items: Item[];
  icon: React.FC<IconTypes>;
  label: string;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  itemlabelClassName?: string;
}

export const NavDropdown = ({
  items,
  icon,
  label = "Select an option",
  className = "",
  labelClassName = "",
  itemlabelClassName = "",
}: INavDropdown) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasActiveChild, setHasActiveChild] = useState(false);
  const location = useLocation();
  const IconComponent = icon;

  useEffect(() => {
    const currentPath = location.pathname.toLowerCase();
    
    const isAnyChildActive = items.some(item => {
      const itemPath = item.path.toLowerCase().replace(/^\/|\/$/g, '');
      
      return currentPath === `/${itemPath}` || 
             currentPath === itemPath || 
             currentPath.startsWith(`/${itemPath}/`) ||
             (currentPath.endsWith(`/${itemPath}`) && currentPath.includes(itemPath));
    });
    
    setHasActiveChild(isAnyChildActive);
  }, [location, items]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div 
        onClick={toggleDropdown}
        className="relative flex items-center gap-3 px-4 py-2.5 transition-colors duration-200 cursor-pointer justify-between"
      >
        {/* Left accent bar - shows when any child is active */}
        <span
          className={`absolute left-0 top-0 h-full w-[5px] rounded-r-xl transition-all
          ${hasActiveChild ? "bg-purple-600" : "bg-transparent"}`}
        />
        
        <div className="flex items-center gap-3">
          {hasActiveChild ? <IconComponent color="#9810fa" /> : <IconComponent />}
          <span className={`text-sm ${labelClassName} ${hasActiveChild ? "text-purple-600 " : ""}`}>{label}</span>
        </div>
        
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
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
                  flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-all duration-300 font-medium
                  ${
                    isActive
                      ? " text-purple-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                `}
                // onClick={() => setIsOpen(false)}
              >
                <Dot className="h-6 w-6 transition-all ease-in-out duration-300" />
                <p className={itemlabelClassName}>{item.label}</p>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavDropdown;