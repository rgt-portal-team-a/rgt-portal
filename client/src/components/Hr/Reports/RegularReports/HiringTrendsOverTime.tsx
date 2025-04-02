import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  Area
} from "recharts";

const HiringTrendsOverTime = () => {
  const trendsData = [
    { tool: "Figma", hires: 40 },
    { tool: "Sketch", hires: 60 },
    { tool: "XD", hires: 20 },
    { tool: "Photoshop", hires: 80 },
    { tool: "Illustrator", hires: 50 },
    { tool: "AfterEffect", hires: 30 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hiring Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={trendsData}>
            <XAxis dataKey="tool" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="hires"
              stroke="#9c27b0"
              fill="#9c27b0"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


export default HiringTrendsOverTime;