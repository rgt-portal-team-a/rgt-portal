import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Legend,
  Line
} from "recharts";

const CandidatesHiredPeriod = () => {
  const candidatesData = [
    { tool: "Figma", lastWeek: 40, currentWeek: 60 },
    { tool: "Sketch", lastWeek: 30, currentWeek: 50 },
    { tool: "XD", lastWeek: 50, currentWeek: 70 },
    { tool: "Photoshop", lastWeek: 60, currentWeek: 80 },
    { tool: "Illustrator", lastWeek: 45, currentWeek: 65 },
    { tool: "AfterEffect", lastWeek: 35, currentWeek: 55 },
    { tool: "InDesign", lastWeek: 55, currentWeek: 75 },
    { tool: "Maya", lastWeek: 65, currentWeek: 85 },
    { tool: "Premiere", lastWeek: 70, currentWeek: 90 },
    { tool: "Final Cut", lastWeek: 75, currentWeek: 95 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Number of Candidates Hired per Period</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={candidatesData}>
            <XAxis dataKey="tool" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="lastWeek"
              stroke="#9c27b0"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="currentWeek"
              stroke="#03a9f4"
              strokeWidth={2}
            />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


export default CandidatesHiredPeriod;