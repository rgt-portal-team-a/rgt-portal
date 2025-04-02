import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const WhyTheyWalked = () => {
  const whyTheyWalkedData = [
    { name: "Compensation", value: 35 },
    { name: "Management", value: 25 },
    { name: "Work-life Balance", value: 40 },
  ];

  const pieColors = ["#8571F4", "#C686F8", "#E8CFFC"];

  return (
    <Card className="rounded-[24px] shadow-lg ">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Reasons For Leaving High-Risk Positions
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
  );
};
