import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const TurnoverTrend = () => {
  const goodbyeGraphData = [
    { name: "Jan", value: 40 },
    { name: "Feb", value: 60 },
    { name: "Mar", value: 30 },
    { name: "Apr", value: 70 },
    { name: "May", value: 50 },
    { name: "Jun", value: 65 },
  ];

  return (
    <Card className="rounded-[24px] shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          TurnOver Trend Over Time
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
  );
};
