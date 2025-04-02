import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const TurnoverByTenure = () => {
    const musicalChairsData = [
        { name: "Jan", value: 80 },
        { name: "Feb", value: 40 },
        { name: "Mar", value: 60 },
        { name: "Apr", value: 90 },
        { name: "May", value: 30 },
    ];

    return (
      <Card className="rounded-[24px] shadow-lg ">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Employee Turnover By Tenure
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
    );
}