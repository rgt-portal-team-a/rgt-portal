import { IDepartmentCard } from "@/types/employee";
import Avtr from "../Avtr";
import { getAvatarFallback } from "@/lib/helpers";

const DepartmentTable = ({ detail }: { detail: IDepartmentCard | null }) => {
  return (
    <main className="flex flex-col max-w-[360px] sm:max-w-full overflow-scroll">
      <table className="border-collapse rounded-lg w-full">
        {/* Table Head */}
        <thead>
          <tr className=" text-gray-700 text-left">
            <th className="text-[#A3A7AA] font-semibold text-sm p-3 md:pl-16">
              Employee Name
            </th>
            <th className="text-[#A3A7AA] font-semibold text-sm p-3">
              Department Role
            </th>
            <th className="text-[#A3A7AA] font-semibold text-sm p-3">Type</th>
            <th className="p-3 text-center text-[#A3A7AA] font-semibold text-sm ">
              User Type
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {detail &&
            detail?.employees.map((item, index) => (
              <tr
                key={index}
                className=" hover:bg-gray-50 transition-all space-y-3"
              >
                {/* Assigned To */}
                <td className="p-3 flex items-center gap-3">
                  <Avtr
                    url={item.user.profileImage as string}
                    name={getAvatarFallback(item)}
                    index={index}
                    className="border-3 text-white font-semibold text-sm"
                    avtBg="bg-[#E328AF]"
                  />
                  <span className="text-sm font-semibold text-[#8A8A8C] text-nowrap">
                    {item.user.username}
                  </span>
                </td>

                {/* Department */}
                <td className="p-3">
                  <span className="px-2 text-nowrap py-1 bg-green-100 text-[#039855] text-sm font-semibold rounded">
                    {detail.name}
                  </span>
                </td>

                {/* Role */}
                <td className="p-3">
                  <span className="px-2 py-1 text-nowrap bg-green-100 text-[#039855] text-sm rounded font-semibold">
                    {item.user.role.name.toUpperCase()}
                  </span>
                </td>

                {/* Action */}
                <td className="p-3 text-center">
                  <button className="cursor-pointer">
                    <img
                      src="/Delete.svg"
                      className="p-1 bg-red-600 hover:bg-red-700 rounded-md"
                    />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {!detail && (
        <div className="w-full flex justify-center items-center p-3">
          <p className="text-slate-500 font-semibold text-sm">
            No Data available
          </p>
        </div>
      )}
    </main>
  );
};

export default DepartmentTable;
