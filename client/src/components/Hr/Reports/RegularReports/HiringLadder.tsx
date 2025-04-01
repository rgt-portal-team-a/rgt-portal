import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useGetHiringLadder } from "@/api/query-hooks/reports.hooks";

const HiringLadder: React.FC = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetHiringLadder();

  const total =
    data?.agencyData?.reduce((sum, item) => sum + Number(item.value), 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between">
          <CardTitle className="text-center md:text-left">
            The Hiring Ladder: Top Performing Agencies
          </CardTitle>
          <Button variant="outline" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Fetching hiring ladder data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
      return (
        <Card className="border-destructive/50">
          <CardHeader className="flex flex-col md:flex-row items-center justify-between">
            <CardTitle className="text-destructive text-center md:text-left">
              Data Fetch Error
            </CardTitle>
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
                  : "Unable to fetch hiring ladder data"}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

  if (!data || !data.agencyData || data.agencyData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between">
          <CardTitle className="text-center md:text-left">
            The Hiring Ladder: Top Performing Agencies
          </CardTitle>
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
            <p className="text-center">No hiring ladder data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-center justify-between">
        <CardTitle className="text-center md:text-left">
          The Hiring Ladder: Top Performing Agencies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 mb-4">
          <p className="text-3xl font-extrabold text-center md:text-left">
            {total}
          </p>
          <p className="text-green-500 text-center md:text-left">
            +15% <span className="text-sm text-gray-500">than last Month</span>
          </p>
        </div>

        <div className="w-full h-10 bg-gray-100 rounded-[6.25px] overflow-hidden flex">
          {data.agencyData.map((agency, index) => (
            <div
              key={index}
              className="h-full"
              style={{
                width: `${Number(agency.percent).toFixed(2)}%`,
                backgroundColor: agency.color,
              }}
            />
          ))}
        </div>

        <div className="flex overflow-auto lg:flex-wrap lg:justify-between mt-2 gap-4">
          {data.agencyData.map((agency, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 w-full md:w-auto text-center md:text-left"
            >
              <div className="flex gap-2 items-center justify-center md:justify-start">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: agency.color }}
                />
                <span className="flex text-sm text-nowrap">{agency.name}</span>
              </div>
              <span className="font-bold text-xl items-center flex gap-2 justify-center md:justify-start">
                {agency.value}
                <span className="text-sm" style={{ color: agency.color }}>
                  ({Number(agency.percent).toFixed(2)}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HiringLadder;
