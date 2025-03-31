import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Employee } from "@/types/employee"; // Import the Employee type
import { employeeService } from "@/api/services/employee.service";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const FindEmployee = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        if (!id) {
          throw new Error("Employee ID is missing");
        }

        const data = await employeeService.getEmployeeById(id);
        setEmployee(data);
      } catch (err) {
        console.error("Failed to fetch employee:", err);
        setError("Failed to fetch employee details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner label="Loading employee details..." size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Employee not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4 text-slate-500">Employee Details</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div className="flex gap-2">
            <span className="font-semibold text-sm">First Name:</span>{" "}
            <p className="font-medium text-slate-500 text-sm">
              {employee.firstName}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-sm">Last Name:</span>{" "}
            <p className="font-medium text-slate-500 text-sm">
              {employee.lastName}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-sm">Email:</span>
            <p className="font-medium text-slate-500 text-sm">
              {employee.user?.email}
            </p>
          </div>

          <div className="flex gap-2">
            <span className="font-semibold text-sm">Department:</span>{" "}
            <p className="font-medium text-slate-500 text-sm">
              {employee.department?.name || "N/A"}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-sm">Role:</span>{" "}
            <p className="font-medium text-slate-500 text-sm">
              {/* {employee.user.role.name} */}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-sm">Agency:</span>{" "}
            <p className="font-medium text-slate-500 text-sm">
              {employee.agency?.name || "N/A"}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-sm">Skills:</span>{" "}
            <p className="font-medium text-slate-500 text-sm">
              {employee.skills || "N/A"}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-sm">Region :</span>{" "}
            <p className="font-medium text-slate-500 text-sm">
              {employee.contactDetails?.region || "N/A"}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-sm">Work Type:</span>{" "}
            <p className="font-medium text-slate-500 text-sm">
              {employee.workType?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindEmployee;
