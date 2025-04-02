import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HiringLadder = () => {
  const agencyData = [
    { name: "Agency 1", value: 85741, percent: 50, color: "#6418C3" },
    { name: "Agency 2", value: 23733, percent: 25, color: "#5ECFFF" },
    { name: "Agency 3", value: 15468, percent: 5, color: "#E328AF" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>The Hiring Ladder: Top Performing Agencies</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-[#6418C3] hover:text-white hover:bg-purple-700 py-[25px] rounded-[8px] text-white"
          >
            Generate Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 mb-4">
          <p className="text-3xl font-extrabold">32,741 </p>
          <p className="text-green-500 ">
            +15% <span className="text-sm text-gray-500">than last Month</span>
          </p>
        </div>
        <div className="w-full h-10 bg-gray-100 rounded-[6.25px] overflow-hidden flex">
          {agencyData.map((agency, index) => (
            <div
              key={index}
              className="h-full"
              style={{
                width: `${agency.percent}%`,
                backgroundColor: agency.color,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {agencyData.map((agency, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: agency.color }}
                />
                <span className="flex text-sm">{agency.name}</span>
              </div>
              <span className="font-bold text-xl items-center flex gap-2">
                {agency.value}
                <span className="text-sm" style={{ color: agency.color }}>
                  ({agency.percent}%)
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
