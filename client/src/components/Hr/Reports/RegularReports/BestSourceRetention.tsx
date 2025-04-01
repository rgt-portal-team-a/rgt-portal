import {
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BestSourceRetention = () => {
  const retentionData = [
    { source: "Adept", value: 250 },
    { source: "Criatin", value: 500 },
    { source: "Digital Tech Jobs", value: 750 },
    { source: "Vacancies in Ghana", value: 1000 },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Best Source for Retention</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full" />
            <span>Number</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded-full" />
            <span>Analytics</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={retentionData}>
            <XAxis dataKey="source" />
            <Tooltip />
            <Bar dataKey="value" barSize={20} fill="#9c27b0" />
            <Line type="monotone" dataKey="value" stroke="#ff9800" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BestSourceRetention;
