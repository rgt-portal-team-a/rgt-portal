import { NavLink } from "react-router-dom";
import Avtr from "./Avtr";
import { IDepartmentCard } from "@/types/employee";
import DesignIcon from "@/assets/icons/DesignIcon";
import BlckChainIcon from "@/assets/icons/BlckChainIcon";
import FullStackIcon from "@/assets/icons/FullStackIcon";
import PMIcon from "@/assets/icons/PMIcon";
import AIIcon from "@/assets/icons/AIIcon";
import QAIcon from "@/assets/icons/QAIcon";
import MobileIcon from "@/assets/icons/MobileIcon";
import ArrowIcon from "@/assets/icons/ArrowIcon";
import { getAvatarFallback } from "@/lib/helpers";
import MarketingIcon from "@/assets/icons/MarketingIcon";

const DepartmentCard: React.FC<IDepartmentCard> = ({
  employees,
  name,
  leadName,
  id,
}) => {
  const maxVisible = 3;
  const extraCount = employees.length - maxVisible;

  const totalEmployees = employees.length;

  // might change later to pick image based on what hr types in during department creation.
  const renderDepartmentIcon = () => {
    switch (name.toLowerCase()) {
      case "design":
        return (
          <div>
            <DesignIcon />
          </div>
        );
      case "ui/ux":
        return <DesignIcon />;
      case "blockchain":
        return (
          <div>
            <BlckChainIcon />
          </div>
        );
      case "full stack":
        return (
          <div>
            <FullStackIcon />
          </div>
        );
      case "pm":
        return (
          <div>
            <PMIcon />
          </div>
        );
      case "ai":
        return (
          <div>
            <AIIcon />
          </div>
        );
      case "qa":
        return <QAIcon />;
      case "mobile dev":
        return <MobileIcon />;
      case "marketing":
        return <MarketingIcon />;
    }
  };

  return (
    <div
      key={id}
      className="relative flex flex-col space-y-2 bg-white rounded-md p-2 md:min-w-64 md:w-[375px] w-full  shadow-md hover:shadow-gray-400 transition-all duration-300 ease-in overflow-hidden"
    >
      <div className="pb-4 border-b-[1px]  border-gray-200">
        <header className="text-[#706D8A] text-[20px] font-semibold flex justify-between items-center">
          <div className="flex items-center space-x-1">
            {renderDepartmentIcon()}
            <p className="w-44 text-nowrap truncate">{name}</p>
          </div>
          <NavLink to={`${id}`}>
            <ArrowIcon
              className="-rotate-90 hover:bg-slate-200 transition-colors duration-300 ease-in rounded-full"
              stroke="#6418C3"
            />
          </NavLink>
        </header>
        <div className="flex ">
          <div>
            {leadName && (
              <p className=" text-[#C9ADFF] font-semibold text-[15.09px]">
                Manager - {leadName}
              </p>
            )}
            <p className="text-[#A2A1A8] text-sm">{totalEmployees} Members</p>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center h-10">
        {employees.length > 0 && (
          <div className="relative w-[80px] h-10">
            {employees.slice(0, maxVisible).map((employee, index) => (
              <Avtr
                key={index}
                index={index}
                url={employee.user?.profileImage as string}
                name={getAvatarFallback(employee)}
                className="w-9 h-9 rounded-full absolute borde-0 border-3 text-white font-semibold text-sm"
                avtBg="bg-[#E328AF]"
              />
            ))}

            {extraCount > 0 && (
              <div
                className={`absolute flex items-center justify-center w-9 h-9 text-xs font-bold text-white  rounded-full border-2 border-[#E328AF]`}
                style={{ left: `${maxVisible * 24}px`, zIndex: "140" }}
              >
                +{extraCount}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Background Image (Gradient Splash)
      {includeBgImg && (
        <div className="absolute  translate-x-56 top-1/7 h-full w-1/2  pointer-events-none opacity-50 ">
          <img
            src={"/RGT PATTERN 1.svg"}
            style={{ width: "130px", height: "135px" }}
          />
        </div>
      )} */}
    </div>
  );
};

export default DepartmentCard;
