import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from "recharts";

const EmployeeCountDepartment = () => {
  const departmentData = [
    { department: "Marketing", count: 66635 },
    { department: "Mobile Dev", count: 66635 },
    { department: "Cloud Services", count: 66636 },
    { department: "DevOps", count: 56635 },
    { department: "PM", count: 56635 },
    { department: "QA", count: 56635 },
    { department: "HR", count: 56636 },
    { department: "Blockchain", count: 76779 },
    { department: "All LM", count: 16027 },
    { department: "Full Stack", count: 46357 },
    { department: "UX/UI", count: 6142 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Count per Department</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-4">207,388 Total Employees</div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            layout="vertical"
            data={departmentData}
            margin={{ left: 100 }}
          >
            <XAxis type="number" />
            <YAxis dataKey="department" type="category" />
            <Tooltip />
            <Bar dataKey="count" fill="#9c27b0" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


export default EmployeeCountDepartment;;