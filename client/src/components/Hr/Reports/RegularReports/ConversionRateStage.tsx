import { useGetConversionRate } from "@/api/query-hooks/reports.hooks";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";





export const ConversionRateStage = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetConversionRate();

  // Calculate total candidates and conversion rate
  const totalCandidates =
    data?.stageData?.reduce((sum, stage) => sum + Number(stage.value), 0) || 0;

  const averageConversionRate =
    totalCandidates > 0 && data?.stageData
    ? (
        (Number(data.stageData[data.stageData.length - 1].value) /
          Number(data.stageData[0].value)) *
        100
      ).toFixed(2)
    : "0";
    

  // Render Loading State
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Conversion Rate by Stage</CardTitle>
          <Button variant="outline" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Fetching conversion rates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Error State
  if (isError) {
    return (
      <Card className="w-full border-destructive/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-destructive">
            Conversion Rate Error
          </CardTitle>
          <Button
            variant="destructive"
            onClick={() => refetch}
            disabled={isFetching}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-destructive">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-center">
              {error instanceof Error
                ? error.message
                : "Unable to fetch conversion rates"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Empty State
  if (!data?.stageData || data.stageData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Conversion Rate by Stage</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-center">No conversion rate data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Normal State
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Conversion Rate by Stage</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-green-500" />
            <span className="text-2xl font-bold">{averageConversionRate}%</span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.stageData}
              margin={{ top: 20, right: 10, left: 60, bottom: 90 }}
              className="text-sm"
            >
              <XAxis
                dataKey="stage"
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-45} // Rotate labels
                textAnchor="end" // Align rotated text
                tick={{
                  fontSize: 12, // Smaller font size
                  fill: "#6b7280", 
                }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white shadow-lg p-4 rounded-lg">
                        <p className="font-bold">{data.stage}</p>
                        <p>Candidates: {data.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#8884d8" barSize={40}>
                {data.stageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};



export default ConversionRateStage;
