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
import { getAvatarFallback } from "@/lib/helpers";
import MarketingIcon from "@/assets/icons/MarketingIcon";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { MoreVerticalIcon } from "lucide-react";
import { useState } from "react";
import { Popover } from "./ui/popover";
import DeleteIcon from "@/assets/icons/DeleteIcon";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import ConfirmCancelModal from "./common/ConfirmCancelModal";
import DeleteRippleIcon from "./common/DeleteRippleIcon";
import WithRole from "@/common/WithRole";

const DepartmentCard: React.FC<IDepartmentCard> = ({
  employees,
  name,
  manager,
  id,
  path,
}) => {

  // console.log("manager:",manager)
  const maxVisible = 3;
  const extraCount = employees.length - maxVisible;
  const [showMore, setShowMore] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const totalEmployees = employees.length;
  const { currentUser } = useAuthContextProvider();
  const { deleteDepartment, isDepartmentDeleting } = useDepartmentsData();

  // might change later to pick image based on what hr types in during department creation.
  const renderDepartmentIcon = () => {
    const patterns = {
      design: /design|ui\/ux/i,
      blockchain: /block\s*chain|blockchain/i,
      fullstack: /full\s*stack|fullstack/i,
      pm: /\bpm\b|project\s*manager/i,
      ai: /\bai\b|artificial\s*intelligence/i,
      qa: /\bqa\b|quality\s*assurance/i,
      mobile: /mobile\s*dev/i,
      marketing: /marketing/i,
    };

    if (patterns.design.test(name)) {
      return <DesignIcon />;
    }
    if (patterns.blockchain.test(name)) {
      return <BlckChainIcon />;
    }
    if (patterns.fullstack.test(name)) {
      return <FullStackIcon />;
    }
    if (patterns.pm.test(name)) {
      return <PMIcon />;
    }
    if (patterns.ai.test(name)) {
      return <AIIcon />;
    }
    if (patterns.qa.test(name)) {
      return <QAIcon />;
    }
    if (patterns.mobile.test(name)) {
      return <MobileIcon />;
    }
    if (patterns.marketing.test(name)) {
      return <MarketingIcon />;
    }
    return null;
  };

  // Check if current user is in the department
  const isInDepartment = employees.find(
    (item) => item.user?.id === currentUser?.id
  );

  // delete department
  const handleDelete = async (id: string) => {
    if (isDepartmentDeleting) return;
    await deleteDepartment(id);
  };

  return (
    <>
      <NavLink
        to={`${path}`}
        key={id}
        className={`relative flex flex-col space-y-2 bg-white rounded-[12px] p-2 lg:min-w-64 lg:w-[32%]  w-full h-[150px] shadow-md hover:shadow-gray-400 transition-all duration-300 ease-in overflow-hidden ${
          isInDepartment ? "border-[#E328AF] border-[2px]" : ""
        }`}
      >
        <div className="pb-4 border-b-[1px]  border-gray-200">
          <header className="text-[#706D8A] text-[20px] font-semibold flex justify-between items-center">
            <div className="flex items-center space-x-1">
              {renderDepartmentIcon()}
              <p className="max-w-44 text-nowrap truncate">{name}</p>
            </div>
            <WithRole
              userRole={currentUser?.role.name as string}
              roles={["hr"]}
            >
              <div
                className="relative"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMore(!showMore);
                }}
              >
                <MoreVerticalIcon
                  className="transition-colors duration-300 ease-in rounded-full cursor-pointer"
                  color="#CBD5E1"
                />
                {showMore && (
                  <div
                    className="absolute right-0 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Popover>
                      <div
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <DeleteIcon color="red" />
                        <p className="text-sm text-red-500">Delete</p>
                      </div>
                    </Popover>
                  </div>
                )}
              </div>
            </WithRole>
          </header>
          <div className="flex">
            <div>
              {manager && manager.firstName && manager.lastName && (
                <p className=" text-[#C9ADFF] font-semibold text-[15.09px] max-w-60 xl:max-w-72 truncate">
                  Manager - {manager?.firstName + " " + manager?.lastName}
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
                  className="w-9 h-9 rounded-full absolute border-2 border-[#E328AF] text-white font-semibold text-sm"
                  avtBg="bg-rgtpurple"
                />
              ))}

              {extraCount > 0 && (
                <div
                  className={`absolute flex items-center justify-center w-9 h-9 text-xs font-bold text-white  rounded-full border-2 border-[#E328AF] bg-[#E328AF]`}
                  style={{ left: `${maxVisible * 24}px`, zIndex: "140" }}
                >
                  +{extraCount}
                </div>
              )}
            </div>
          )}
        </div>
      </NavLink>
      <ConfirmCancelModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onSubmit={() => handleDelete(String(id))}
        isSubmitting={isDepartmentDeleting}
        submitText="Delete"
        onOpenChange={() => console.log("")}
      >
        <div className="flex flex-col justify-center items-center space-y-2">
          <DeleteRippleIcon />
          <p className="text-lg font-semibold">Delete Department?</p>
          <p className="font-light text-[#535862] text-sm text-center text-wrap w-[300px]">
            Are you sure you want to delete this department? This action cannot
            be undone.
          </p>
        </div>
      </ConfirmCancelModal>
    </>
  );
};

export default DepartmentCard;
