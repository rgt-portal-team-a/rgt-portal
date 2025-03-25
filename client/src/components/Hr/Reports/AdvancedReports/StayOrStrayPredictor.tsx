import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LineChart, Line } from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import {
  RefreshCw,
} from "lucide-react";

export const StayOrStrayPredictor = () => {
  const [employeeName, setEmployeeName] = useState("");

  // Sample data for charts
  const musicalChairsData = [
    { name: "Jan", value: 80 },
    { name: "Feb", value: 40 },
    { name: "Mar", value: 60 },
    { name: "Apr", value: 90 },
    { name: "May", value: 30 },
  ];

  const turnoverData = [
    { name: "Engineering", value: 70 },
    { name: "Design", value: 50 },
    { name: "Product", value: 85 },
    { name: "Marketing", value: 60 },
    { name: "Sales", value: 40 },
  ];

  const whyTheyWalkedData = [
    { name: "Compensation", value: 35 },
    { name: "Management", value: 25 },
    { name: "Work-life Balance", value: 40 },
  ];

  const goodbyeGraphData = [
    { name: "Jan", value: 40 },
    { name: "Feb", value: 60 },
    { name: "Mar", value: 30 },
    { name: "Apr", value: 70 },
    { name: "May", value: 50 },
    { name: "Jun", value: 65 },
  ];

  const pieColors = ["#8571F4", "#C686F8", "#E8CFFC" ];

  return (
    <div className="bg-white rounded-[32px] shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Stay or Stray Predictor</h2>
        <div className="flex gap-2">
          <Button
            variant="default"
            className="bg-purple-600 hover:bg-purple-700 py-[25px] rounded-[8px]"
          >
            Query
          </Button>
          <Button
            variant="outline"
            className="border-purple-600 text-purple-600 py-[25px] rounded-[8px]"
          >
            <RefreshCw className="mr-1 h-4 w-4" /> Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 border-1 rounded-[12px] p-4 items-center">
        <div className="col-span-2">
          <div className="text-sm text-gray-500 mb-1">Employee name</div>
          <Input
            placeholder="Enter employee name"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            className="mb-6 py-6 px-4 border-1"
          />
        </div>

        <div>
          <Button
            variant="default"
            className="bg-purple-600 hover:bg-purple-700 py-6 rounded-[8px] w-full"
          >
            Predict
          </Button>
        </div>

        <div className="flex flex-row gap-2 h-full">
          <div className="w-1/2 h-full gap-2 flex flex-col">
            <div className="flex items-center  text-sm text-gray-500 h-1/2 bg-gray-100 p-[6px] px-3  rounded-[4px]">
              <p>Risk Level</p>
            </div>
            <div className="flex items-center  text-sm text-gray-500 h-1/2 bg-gray-100 p-[6px] px-3  rounded-[4px]">
              <p>Medium</p>
            </div>
          </div>

          <div className="w-1/2 h-full bg-gray-100 p-[6px] px-3  rounded-[4px]">
            <div className="text-sm text-gray-500 mb-1">Text</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-[24px] shadow-lg ">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Musical Chairs...The Corporate Edition
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

        <Card className="rounded-[24px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Turnover Roulette
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

        <Card className="rounded-[24px] shadow-lg ">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Why They Walked
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

        <Card className="rounded-[24px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Goodbye Graphed...overtime
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
      </div>
    </div>
  );
};
