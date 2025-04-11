import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useGetHiringLadder } from "@/api/query-hooks/reports.hooks";

const NspCount: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetHiringLadder();

  // Render Loading State
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
          <CardTitle>Hired NSP Count</CardTitle>
          <Button variant="outline" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Fetching NSP count data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Error State
  if (isError) {
    return (
      <Card className="w-full max-w-4xl mx-auto border-destructive/50">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
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
                : "Unable to fetch NSP count data"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Empty State
  if (!data || !data.nspCountData || data.nspCountData.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
          <CardTitle>Hired NSP Count</CardTitle>
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
            <p className="text-center">No NSP count data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total NSP count
  const totalNspCount = data.nspCountData.reduce(
    (sum, item) => sum + Number(item.value),
    0
  );

  // Render Normal State
  return (
    <Card className="w-full ">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
        <CardTitle>Hired NSP Count</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="text-lg font-bold flex flex-col sm:flex-row gap-4 mb-4">
          <span>Total Count: {totalNspCount}</span>
        </div>
        <div className="w-full h-[165px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.nspCountData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <Tooltip />
              <Bar dataKey="value" fill="#E328AF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default NspCount;
