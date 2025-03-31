import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LineChart, Line } from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Employee, WorkType } from "@/types/employee";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { usePredictAttrition } from "@/api/query-hooks/ai.hooks";
import { AttritionRequestInterface, AttritionResponseDto } from "@/types/ai";
import { WORK_TYPES } from "@/constants";

export const StayOrStrayPredictor = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { employees } = useSelector((state: RootState) => state.sharedState);
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


  // Sample data for charts
  const musicalChairsData = [
    { name: "Jan", value: 80 },
    { name: "Feb", value: 40 },
    { name: "Mar", value: 60 },
    { name: "Apr", value: 90 },
    { name: "May", value: 30 },
  ];

  const turnoverData = [
    { name: "Engineering", value: 70 },
    { name: "Design", value: 50 },
    { name: "Product", value: 85 },
    { name: "Marketing", value: 60 },
    { name: "Sales", value: 40 },
  ];

  const whyTheyWalkedData = [
    { name: "Compensation", value: 35 },
    { name: "Management", value: 25 },
    { name: "Work-life Balance", value: 40 },
  ];

  const goodbyeGraphData = [
    { name: "Jan", value: 40 },
    { name: "Feb", value: 60 },
    { name: "Mar", value: 30 },
    { name: "Apr", value: 70 },
    { name: "May", value: 50 },
    { name: "Jun", value: 65 },
  ];

  const pieColors = ["#8571F4", "#C686F8", "#E8CFFC"];

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
                      className="p-2 w-full flex hover:bg-gray-100 cursor-pointer text-sm text-slate-500 font-semibold text-wrap block justify-between"
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
        <Card className="rounded-[24px] shadow-lg ">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Musical Chairs...The Corporate Edition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={musicalChairsData}>
                  <Bar dataKey="value" fill="#6418C3" />
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Turnover Roulette
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={turnoverData}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" hide />
                  <Bar dataKey="value" fill="#5ECFFF" />
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] shadow-lg ">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Why They Walked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={whyTheyWalkedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {whyTheyWalkedData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Goodbye Graphed...overtime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={goodbyeGraphData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#e91e63"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
