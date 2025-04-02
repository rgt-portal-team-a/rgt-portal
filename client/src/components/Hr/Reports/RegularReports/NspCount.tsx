import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";


const NspCount = () => {
  const portfolioData = [
    { day: "Mon", value: 400 },
    { day: "Tue", value: 300 },
    { day: "Wed", value: 500 },
    { day: "Thu", value: 450 },
    { day: "Fri", value: 600 },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hired NSP Count</CardTitle>
        <Button
          variant="outline"
          className="bg-[#6418C3] hover:text-white hover:bg-purple-700 py-[25px] rounded-[8px] text-white"
        >
          Generate Report
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-bold flex gap-4 ">
          $32,111 <p className="text-green-500">+12%</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={portfolioData}>
            <XAxis dataKey="day" />
            <Tooltip />
            <Bar dataKey="value" fill="#E328AF" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


export default NspCount;