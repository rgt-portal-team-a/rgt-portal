import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps,
} from "recharts";

// Define the type for the dropout data
interface DropoutDataItem {
  stage: string;
  value: number;
  color: string;
}

// Define the custom label props type
interface CustomLabelProps extends PieLabelRenderProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
  name: string;
}

const DropoutAnalysis: React.FC = () => {
  const dropoutData: DropoutDataItem[] = [
    { stage: "CV Review", value: 16, color: "#9333EA" },
    { stage: "1st Interview", value: 16, color: "#03a9f4" },
    { stage: "Tech Interview", value: 12, color: "#ffc107" },
    { stage: "Online Exam", value: 25, color: "#e91e63" },
    { stage: "Other", value: 20, color: "#9e9e9e" },
  ];

  const total = dropoutData.reduce((sum, item) => sum + item.value, 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
  }: CustomLabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const percentage = ((value / total) * 100).toFixed(0);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: "12px",
          fontWeight: "bold",
        }}
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <Card className="border-none shadow-none relative">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Dropout Analysis</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dropoutData}
              cx="50%"
              cy="50%"
              innerRadius={100}
              outerRadius={150}
              paddingAngle={2}
              dataKey="value"
              label={renderCustomizedLabel}
            >
              {dropoutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centered circle */}
        <div
          className="absolute top-[150px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 rounded-full"
          style={{
            width: "80px",
            height: "80px",
            zIndex: 10,
          }}
        ></div>

        <div className="flex justify-center mt-4 space-x-4">
          {dropoutData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 mr-2 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs">
                {item.stage}: {((item.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DropoutAnalysis;
