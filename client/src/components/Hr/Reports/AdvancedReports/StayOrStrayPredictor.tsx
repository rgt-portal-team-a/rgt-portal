import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Employee, WorkType } from "@/types/employee";
import { useAllEmployees } from "@/api/query-hooks/employee.hooks";
import { usePredictAttrition } from "@/api/query-hooks/ai.hooks";
import { AttritionRequestInterface, AttritionResponseDto } from "@/types/ai";
import { WORK_TYPES } from "@/constants";
import { WhyTheyWalked } from "./WhyTheyWalked";
import { TurnoverByTenure } from "./TurnoverByTenure";
import { TurnoverRate } from "./TurnoverRate";
import { TurnoverTrend } from "./TurnoverTrend";

export const StayOrStrayPredictor = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const {
    data: employees,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
    error: employeeError,
    refetch: refetchEmployees,
  } = useAllEmployees({}, {});

  const [predictionResult, setPredictionResult] = useState<AttritionResponseDto | null>(null);

  const { mutate: predictAttrition, isPending } = usePredictAttrition();

  // Search and Filter Employees
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setIsDropdownVisible(!!query);
    setValidationErrors([]); 

    if (employees) {
      const filteredResults = employees.filter(
        (emp) =>
          emp.firstName?.toLowerCase().includes(query) ||
          emp.lastName?.toLowerCase().includes(query) ||
          emp.user?.email?.toLowerCase().includes(query)
      );
      setSearchResults(filteredResults);
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSearchQuery(`${employee.firstName} ${employee.lastName}`);
    setIsDropdownVisible(false);
    setValidationErrors([]); 
  };

  const validateEmployeeData = (employee: Employee): string[] => {
    const errors: string[] = [];

    // Check required fields for AttritionRequestInterface
    if (!employee.birthDate) {
      errors.push("Missing birth date");
    }

    if (!employee.agency?.name) {
      errors.push("Missing agency/region");
    }

    if (!employee.workType) {
      errors.push("Missing work type");
    }

    if (!employee.department?.name) {
      errors.push("Missing department");
    }

    if (!employee.hireDate) {
      errors.push("Missing hire date");
    }

    if (!employee.skills || employee.skills.length === 0) {
      errors.push("Missing skills");
    }

    return errors;
  };

  const calculateServiceDuration = (employee: Employee): number => {
    if (!employee.hireDate) return 0;

    const hireDate = new Date(employee.hireDate);

    if (employee.endDate) {
      const endDate = new Date(employee.endDate);
      return endDate.getFullYear() - hireDate.getFullYear();
    }

    return new Date().getFullYear() - hireDate.getFullYear();
  };

  // Predict Attrition
  const handlePredict = () => {
    if (!selectedEmployee) return;

    // Validate employee data
    const errors = validateEmployeeData(selectedEmployee);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const attritionData: AttritionRequestInterface = {
      age:
        new Date().getFullYear() -
        new Date(selectedEmployee.birthDate!).getFullYear(),
      region: selectedEmployee.agency!.name,
      work_mode: selectedEmployee.workType as WorkType,
      department: selectedEmployee.department!.name,
      duration: calculateServiceDuration(selectedEmployee),
      skills: selectedEmployee.skills || [],
    };

    predictAttrition(
      { data: attritionData },
      {
        onSuccess: (result) => {
          setPredictionResult({
            risk_level: result.risk_level,
            attrition_probability: result.attrition_probability,
            assessment: result.assessment,
          });
          setSelectedEmployee(null);
          setSearchQuery("");
          setValidationErrors([]);
        },
      }
    );
  };



  return (
    <div className="bg-white rounded-[32px] shadow-sm p-6">
      {/* Header and Buttons (keep existing) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 border-1 rounded-[12px] p-4 items-center">
        <div className="col-span-2">
          <div className="text-sm text-gray-500 mb-1">Employee name</div>
          <div className="relative">
            <Input
              placeholder="Enter employee name"
              value={searchQuery}
              onChange={handleOnChange}
              className="mb-6 py-6 px-4 border-1"
            />
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-600 mb-2">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <span className="font-semibold">Missing Information</span>
                </div>
                <ul className="list-disc list-inside text-xs text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {isDropdownVisible && (
              <div
                className="absolute top-16 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                style={{ zIndex: 100 }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((employee) => (
                    <div
                      key={employee.id}
                      className="p-2 w-full flex hover:bg-gray-100 cursor-pointer text-sm text-slate-500 font-semibold text-wrap justify-between"
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <span>
                        {employee.firstName} {employee.lastName}
                      </span>
                      <span>{employee.user?.email}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No employees found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <Button
            variant="default"
            className="bg-purple-600 hover:bg-purple-700 py-6 rounded-[8px] w-full"
            onClick={handlePredict}
            disabled={!selectedEmployee || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Predicting
              </>
            ) : (
              "Predict"
            )}
          </Button>
        </div>

        <div className="flex flex-row gap-2 h-full">
          <div className="w-1/2 h-full gap-2 flex flex-col">
            <div className="flex items-center text-xs text-gray-500 h-1/2 bg-gray-100 p-[6px] px-3 rounded-[4px]">
              <p>{predictionResult?.risk_level || "Risk Level N/A"}</p>
            </div>
            <div className="flex items-center text-xs text-gray-500 h-1/2 bg-gray-100 p-[6px] px-3 rounded-[4px]">
              <p>
                {predictionResult?.attrition_probability ||
                  "Attrition Probability N/A"}
              </p>
            </div>
          </div>

          <div className="w-1/2 h-full bg-gray-100 p-[6px] px-3 rounded-[4px]">
            <div className="text-xs text-gray-500 mb-1">
              {predictionResult?.assessment ||
                "No prediction Assesment available"}
            </div>
          </div>
        </div>
      </div>

      {/* Existing Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TurnoverByTenure />

        <TurnoverRate />

        <WhyTheyWalked />

        <TurnoverTrend />
      </div>
    </div>
  );
};
