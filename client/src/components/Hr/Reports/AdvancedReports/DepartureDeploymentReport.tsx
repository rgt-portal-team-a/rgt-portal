import React from "react";
import { 
BarChart, 
Bar, 
XAxis, 
YAxis, 
CartesianGrid, 
Tooltip, 
ResponsiveContainer, 
LabelList 
} from 'recharts';
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { useProgramOfStudyHired } from "@/api/query-hooks/ai.hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define a type-safe interface for chart data
interface ChartDataItem {
  department: string;
  value: number;
}

export const DepartureDeploymentReport: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useProgramOfStudyHired();

  // Transform data into chart-friendly format with type safety
  const chartData: ChartDataItem[] = React.useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];

    return Object.entries(data)
      .map(([department, value]) => ({
        department,
        value: Number(value), // Ensure number type
      }))
      .filter((item) => !isNaN(item.value)); // Remove any invalid entries
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 p-4 shadow-lg rounded-md">
          <p className="font-bold text-purple-600">{label}</p>
          <p className="text-gray-700">
            Hired: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center items-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-purple-600" />
        <span>Loading hiring data...</span>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load hiring data"}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Program of Study Hiring Success</h2>
      </div>

      {chartData.length > 0 ? (
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e0e0e0"
              />
              <XAxis
                dataKey="department"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
                stroke="#666"
              />
              <YAxis
                label={{
                  value: "Number of Hires",
                  angle: -90,
                  position: "insideLeft",
                  offset: -10,
                  fill: "#666",
                }}
                stroke="#666"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#8884d8" barSize={50}>
                <LabelList dataKey="value" position="top" fill="#8884d8" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          No hiring data available
        </div>
      )}

    </div>
  );
};