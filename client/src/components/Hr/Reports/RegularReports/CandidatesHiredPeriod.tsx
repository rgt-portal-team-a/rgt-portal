import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Legend,
  Line,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Filter,
} from "lucide-react";
import { useGetHiringTrends } from "@/api/query-hooks/reports.hooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, addDays, subDays } from "date-fns";

const getMonthNumber = (monthName: string): string => {
  const months: { [key: string]: string } = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  return months[monthName] || "01";
};

const CandidatesHiredPeriod: React.FC = () => {
  // State for date range with explicit typing and default values
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 365), // Default to last year
    to: new Date(),
  });

  // State to track if filter is being applied
  const [isFilterApplying, setIsFilterApplying] = useState(false);

  // Handle date range selection with type-safe approach
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      setDateRange({
        from: range.from,
        to: range.to || new Date(), // Default to current date if no end date
      });
    }
  };

  // Convert date range to API-compatible format
  const apiDateRange = {
    startDate: format(dateRange.from, "yyyy-MM-dd"),
    endDate: format(dateRange.to, "yyyy-MM-dd"),
  };

  // Fetch hiring trends with the current date range
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetHiringTrends(apiDateRange);

  // Predefined date range presets
  const dateRangePresets = [
    {
      label: "Last 3 Months",
      value: "3months",
      range: {
        from: subDays(new Date(), 90),
        to: new Date(),
      },
    },
    {
      label: "Last 6 Months",
      value: "6months",
      range: {
        from: subDays(new Date(), 180),
        to: new Date(),
      },
    },
    {
      label: "Last Year",
      value: "1year",
      range: {
        from: subDays(new Date(), 365),
        to: new Date(),
      },
    },
    {
      label: "Last 2 Years",
      value: "2years",
      range: {
        from: subDays(new Date(), 730),
        to: new Date(),
      },
    },
  ];

  // Handle filter application
  const handleApplyFilter = async () => {
    setIsFilterApplying(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error applying filter:", error);
    } finally {
      setIsFilterApplying(false);
    }
  };

  // Process data for visualization
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .map((item) => {
        // Split the month string and trim
        const [year, month] = item.month.trim().split(" ");

        // Create a valid date object
        const formattedMonth = `${year}-${getMonthNumber(month)}-01`;

        return {
          ...item,
          count: Number(item.count),
          month: formattedMonth,
          originalMonth: item.month.trim(),
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  }, [data]);

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Hiring Trends</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Fetching hiring trends...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-destructive">Data Fetch Error</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center text-destructive">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-center mb-2">
              {error instanceof Error
                ? error.message
                : "Unable to fetch hiring trends"}
            </p>
            <Button onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render chart
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hiring Trends</CardTitle>
        <div className="flex items-center space-x-2">
          {/* Date Range Preset Selector */}
          <Select
            onValueChange={(value) => {
              const preset = dateRangePresets.find((p) => p.value === value);
              if (preset) {
                setDateRange(preset.range);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangePresets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyFilter}
            disabled={isFilterApplying || isFetching}
          >
            {isFilterApplying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Filter className="mr-2 h-4 w-4" />
            )}
            Apply Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-4 text-gray-800">
          {processedData.reduce((sum, item) => sum + item.count, 0)} Total Hires
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="originalMonth"
              label={{
                value: "Months",
                position: "insideBottom",
                offset: -10,
              }}
            />
            <YAxis />
            <Tooltip
              labelClassName="font-bold"
              contentStyle={{
                backgroundColor: "white",
                borderColor: "#9c27b0",
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              name="Hires"
              stroke="#9c27b0"
              strokeWidth={3}
              activeDot={{
                r: 8,
                fill: "#9c27b0",
                stroke: "white",
              }}
            />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CandidatesHiredPeriod;
