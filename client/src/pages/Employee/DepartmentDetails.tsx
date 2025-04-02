import ArrowIcon from "@/assets/icons/ArrowIcon";
import WithRole from "@/common/WithRole";
import Avtr from "@/components/Avtr";
import { DataTable } from "@/components/common/DataTable";
import Filters, { FilterConfig } from "@/components/common/Filters";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { RootState } from "@/state/store";
import { IDepartmentCard } from "@/types/employee";
import { Column } from "@/types/tables";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const DepartmentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { departments } = useSelector((state: RootState) => state.sharedState);
  const { currentUser } = useAuthContextProvider();

  const [details, setDetails] = useState<IDepartmentCard | null>(null);
  const [selectedWorkType, setSelectedWorkType] =
    useState<string>("Work Types");
  const [selectedUserType, setSelectedUserType] =
    useState<string>("All User Types");
  const [selectStatus, setSelectStatus] = useState<string>("Permanent");

  useEffect(() => {
    const department = departments.find(
      (item) => Number(item.id) === Number(id)
    );

    if (!department) {
      return;
    }

    setDetails(department);
  }, [id, departments]);
  console.log("details:", details);

  const transformedData = details?.employees.map((employee) => ({
    id: employee.id,
    username: employee.user?.username || "N/A",
    email: employee.user?.email || "N/A",
    type: employee.employeeType?.split("_").join(" ").toUpperCase() || "N/A",
    userType: employee.user?.role.name.toUpperCase() || "N/A",
    positionStatus: (!employee.position
      ? "Permanent"
      : "Nsp"
    ).toLocaleUpperCase(),
    ptoRequest: employee.activePtoRequest ? "Active" : "Inactive",
    profileImage: employee.user?.profileImage,
  }));

  const columns: Column[] = [
    {
      key: "username",
      header: "Employee Name",
      render: (row) => (
        <div className="flex items-center gap-1">
          {row && (
            <>
              <Avtr name={row.username} url={row.profileImage} />
              <div>
                <p>{row.username}</p>
                <p>{row.email}</p>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
    },
    {
      key: "userType",
      header: "User Type",
    },
    {
      key: "positionStatus",
      header: "Position Status",
      cellClassName: (row) => {
        const lowerCase = row.positionStatus.toLowerCase();
        return `py-2 text-center rounded-md ${
          lowerCase === "nsp"
            ? "bg-[#FFF7D8] text-rgtyellow"
            : "bg-[#C9ADFF] text-[#6418C3]"
        }`;
      },
    },
    {
      key: (
        <WithRole
          userRole={currentUser?.role.name as string}
          roles={["hr", "manager"]}
        >
          pto request
        </WithRole>
      ),
      header: (
        <WithRole
          userRole={currentUser?.role.name as string}
          roles={["hr", "manager"]}
        >
          PTO Request
        </WithRole>
      ),
      render: (row) => (
        <>
          <WithRole
            userRole={currentUser?.role.name as string}
            roles={["hr", "manager"]}
          >
            {row && (
              <div className="flex items-center gap-1">
                <p
                  className={`font-semibold text-xs rounded-[6px] h-[30px] flex items-center justify-center ${
                    row.ptoRequest.toLowerCase() === "active"
                      ? "bg-[#DFFFC7] w-[182px] text-confirmgreen"
                      : "bg-[#FEE4E2] w-[182px] text-[#FF4A55] "
                  }`}
                >
                  {row.ptoRequest}
                </p>
              </div>
            )}
          </WithRole>
        </>
      ),
    },
  ];

  const handleResetFilters = () => {
    setSelectedWorkType("Work Types");
    setSelectedUserType("All User Types");
    setSelectStatus("Permanent");
  };

  const filters: FilterConfig[] = [
    {
      type: "select",
      options: [
        { label: "Work Types", value: "Work Types" },
        { label: "Full Time", value: "full time" },
        { label: "Part Time", value: "part time" },
      ],
      value: selectedWorkType,
      onChange: setSelectedWorkType,
    },
    {
      type: "select",
      options: [
        { label: "All User Types", value: "All User Types" },
        { label: "Manager", value: "manager" },
        { label: "Employee", value: "employee" },
        { label: "Marketer", value: "marketer" },
      ],
      value: selectedUserType,
      onChange: setSelectedUserType,
    },
    {
      type: "select",
      options: [
        { label: "Position Status", value: "Position Status" },
        { label: "Permanent", value: "permanent" },
        { label: "Nsp", value: "nsp" },
      ],
      value: selectStatus,
      onChange: setSelectStatus,
    },
  ];

  const filteredData = transformedData?.filter((employee) => {
    const workTypes =
      selectedWorkType === "Work Types" ||
      employee.type.toLowerCase() === selectedWorkType.toLowerCase();

    const userTypeMatch =
      selectedUserType === "All User Types" ||
      employee.userType.toLowerCase() === selectedUserType.toLowerCase();

    const status =
      selectedWorkType === "Position Status" ||
      employee.positionStatus.toLowerCase() === selectStatus.toLowerCase();

    console.log("position status:");

    return workTypes && userTypeMatch && status;
  });

  return (
    <main className="space-y-2 w-full ">
      <header className="">
        <h3 className="text-[#706D8A] font-semibold text-xl">
          {details?.name}
        </h3>
        <div className="flex items-center">
          <p
            className="text-[#AEB1B7] text-sm font-semibold cursor-pointer"
            onClick={() => navigate(-1)}
          >
            All Projects
          </p>
          <ArrowIcon className="-rotate-90" />
          <p className="text-[#79797E] text-sm font-semibold">
            {details?.name}
          </p>
        </div>
      </header>

      {details ? (
        <div
          className="w-full flex justify-center sm:block bg-white rounded-md shadow-sm mt-5"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style>
            {`
                .hide-scrollbar::-webkit-scrollbar {
                display: none; /* Chrome, Safari, and Opera */
              }
              `}
          </style>

          <div className="py-[10px] px-[20px] w-full">
            <Filters filters={filters} onReset={handleResetFilters} />
            <DataTable
              columns={columns}
              data={filteredData || []}
              actionBool={false}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-gray-200 h-screen flex justify-center items-center text-rgtpurple font-semibold">
          <p>No data available</p>
        </div>
      )}

      {/* <SideModal
        title="Review Time Off"
        isOpen={showSideModal}
        showCloseButton={false}
        onOpenChange={() => setShowSideModal(false)}
        headerClassName="font-semibold text-slate-500"
        className="flex flex-col items-center sm:w-1/2"
        footerClassName="w-full p-0 h-full flex"
        footerContent={
          <div className="w-full flex justify-center bg-green-500 items-end gap-4">
            <Button
              variant={"ghost"}
              className="w-1/2 py-7 border-1 border-[#FF0000] text-[#FF0000] hover:text-[#FF0000] cursor-pointer transition-all duration-300 ease-in"
              // onClick={() => handleReject(selectedEmployee?.id)}
            >
              Reject
            </Button>
            <Button
              variant={"secondary"}
              className="w-1/2 py-7 bg-[#DFFFC7] text-[#15FF00] cursor-pointer transition-all duration-300 ease-in hover:text-[#15FF00] hover:bg-[#DFFFC7]"
              // onClick={() => handleApprove(selectedEmployee?.id)}
            >
              Approve
            </Button>
          </div>
        }
      >
        <div className="flex flex-col p-3">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[#73727675] font-semibold text-sm flex flex-col">
                Time Off Type
              </label>
              <div className="flex text-sm gap-1 items-center">
                <div className="bg-[#F6F6F9] text-[#73727675] font-semibold text-[13.5px] px-[15px] py-[10px] rounded-md">
                  <p>PTO</p>
                </div>
                <div className="bg-[#E328AF] text-white font-semibold text-[13.5px] px-[15px] py-[10px] rounded-md">
                  <p>Sick Leave</p>
                </div>
              </div>
            </div>
            <div className="">
              <label className="text-[#73727675] font-semibold text-sm flex flex-col space-y-1">
                <p>Employee Name</p>
                <input
                  value={viewRequest?.username}
                  disabled
                  className="bg-[#F6F6F9] p-2 text-[#73727675] font-medium text-base rounded-md"
                />
              </label>
            </div>
            <section className="flex gap-2">
              <div>
                <label className="text-[#73727675] font-semibold text-sm">
                  From
                </label>
                <Input
                  value={format(
                    new Date(viewRequest?.startDate ?? new Date()),
                    "dd MMM yyyy"
                  )}
                  className="shadow-none border-0 py-[22px] rounded-md bg-[#F6F6F9] text-[#73727675] font-medium text-base"
                  disabled
                />
              </div>

              <div>
                <label className="text-[#73727675] font-semibold text-sm">
                  To
                </label>
                <Input
                  // value={
                  //   viewPtoData.endDate
                  //     ? new Date(viewPtoData.endDate).toDateString()
                  //     : ""
                  // }
                  className="shadow-none border-0 py-[22px] rounded-md bg-[#F6F6F9] text-[#73727675] font-medium text-base"
                  disabled
                />
              </div>
            </section>
            <section className="space-y-5 pt-3">
              <div className="flex flex-col gap-1">
                <label className="text-[#73727675] font-semibold text-sm">
                  Reason
                </label>
                <textarea
                  className="resize-none bg-[#F6F6F9] p-2 text-[#73727675] font-medium text-base rounded-md"
                  disabled
                />
              </div>
            </section>
          </div>
        </div>
      </SideModal> */}
    </main>
  );
};

export default DepartmentDetails;
