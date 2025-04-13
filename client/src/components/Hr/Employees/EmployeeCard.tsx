import Avtr from "@/components/Avtr";
import { Card, CardContent } from "@/components/ui/card";
import { Employee } from "@/types/employee";
import { Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const EmployeeCard = ({ employee }: { employee: Employee }) => {
  console.log("employee:", employee);
  return (
    <Card className="overflow-hidden w-full md:w-[280px] h-[210px]  rounded-[12px] ">
      <CardContent className="p-6 flex flex-col gap-2">
        <div className="flex mb-4 space-x-2">
          <div className="">
            {employee.user?.profileImage ? (
              <div className="">
                <Avtr
                  url={employee.user.profileImage}
                  name={employee.user.firstName as string}
                  className="w-20 h-full"
                />
              </div>
            ) : (
              <div className="w-[73px] h-[72px] rounded-xl overflow-hidden">
                <img
                  src={
                    "https://gravatar.com/avatar/eefe1679f1e1c3b32ba22719d2f8d0bf?s=400&d=mp&r=x"
                  }
                  alt={employee.firstName ?? "Employee"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col h-full">
            <Link to={`/admin/manageemployees/employee/${employee.id}`}>
              <h3 className="font-semibold text-base h-1/2">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-gray-400 text-sm">
                {employee.position ?? "No Position"}
              </p>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col text-left gap-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-2">
                <Phone className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-gray-400 text-xs font-semibold">Phone</p>
            </div>
            <div>
              <p className="text-xs font-semibold">
                {employee.phone ?? "None"}
              </p>
            </div>
          </div>

          <div className="flex flex-col text-left gap-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-2">
                <Mail className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-gray-400 text-xs font-semibold">Email</p>
            </div>
            <div className="w-full">
              <p className="text-xs font-semibold truncate whitespace-normal">
                {employee.user?.email ?? "None"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;
