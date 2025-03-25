import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const HomeOfficeHeadCount = () => {
  const headcountData = [
    { type: "Hybrid", count: 74, color: "#03a9f4" },
    { type: "Remote", count: 14, color: "#9c27b0" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home-Office HeadCount</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={headcountData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {headcountData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


export default HomeOfficeHeadCount;