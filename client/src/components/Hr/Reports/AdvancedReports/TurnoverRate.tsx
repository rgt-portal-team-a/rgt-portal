import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const TurnoverRate = () => {
    const turnoverData = [
        { name: "Engineering", value: 70 },
        { name: "Design", value: 50 },
        { name: "Product", value: 85 },
        { name: "Marketing", value: 60 },
        { name: "Sales", value: 40 },
    ];

    return (
      <Card className="rounded-[24px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Top Ten Positions By Turnover Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={turnoverData}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" hide />
                <Bar dataKey="value" fill="#5ECFFF" />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
}