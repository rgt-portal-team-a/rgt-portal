import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useSourceToHireSuccessRate } from "@/api/query-hooks/reports.hooks";
import { SuccessData } from "@/types/ai";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as SuccessData;
    return (
      <div className="bg-white shadow-lg p-4 rounded-lg border">
        <p className="font-bold">{data.source}</p>
        <p>Hires: {data.hires}</p>
      </div>
    );
  }
  return null;
};

const SourceToHireSuccessRate = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useSourceToHireSuccessRate();

  const totalHires =
    data?.successData?.reduce((sum, source) => sum + Number(source.hires), 0) ||
    0;

  // Render Loading State
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Source-to-Hire Success Rate</CardTitle>
          <Button variant="outline" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Fetching source-to-hire data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Error State
  if (isError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-destructive">Data Fetch Error</CardTitle>
          <Button
            variant="destructive"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Retry
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-destructive">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-center mb-2">
              {error instanceof Error
                ? error.message
                : "Unable to fetch source-to-hire data"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Empty State
  if (!data || !data.successData || data.successData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Source-to-Hire Success Rate</CardTitle>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-center">No source-to-hire data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Normal State
  return (
    <Card>
      <CardHeader className="flex flex-row items-center ">
        <CardTitle>Source-to-Hire Success Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-2xl font-bold">Total Hires: {totalHires}</p>
        </div>
        <div className="h-64 sm:h-80 md:h-76 ">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.successData}
              className="text-sm"
              margin={{ top: 20, right: 10, left: 0, bottom: 70 }}
            >
              <XAxis
                dataKey="source"
                axisLine={false}
                tickLine={false}
                interval={0} // Show all labels
                angle={-45} 
                textAnchor="end" // Proper alignment for rotated text
                tick={{ fontSize: 12 }} // Smaller font size
                padding={{ left: 20, right: 20 }}
                tickMargin={10}
              />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />
              <Bar dataKey="hires" fill="#ffc107" barSize={40} minPointSize={2}>
                {data.successData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={"#ffc107"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SourceToHireSuccessRate;
