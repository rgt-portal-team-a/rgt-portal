import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const SourceToHireSuccessRate = () => {
  const successData = [
    { source: "Source 1", hires: 10000 },
    { source: "Source 2", hires: 20000 },
    { source: "Source 3", hires: 15000 },
    { source: "Source 4", hires: 30000 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="py-[16px]">Source-to-Hire Success Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={successData}>
            <XAxis dataKey="source" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hires" fill="#ffc107" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SourceToHireSuccessRate;;