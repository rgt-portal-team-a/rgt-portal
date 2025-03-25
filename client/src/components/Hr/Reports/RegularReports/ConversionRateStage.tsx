import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {Button} from "@/components/ui/button"

const ConversionRateStage = () => {
  const stageData = [
    { stage: "CV Review", value: 533111, color: "#9c27b0" },
    { stage: "1st Interview", value: 422048, color: "#e91e63" },
    { stage: "Tech Interview", value: 322048, color: "#03a9f4" },
    { stage: "Online Exam", value: 222048, color: "#ffc107" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Conversion Rate by Stage</CardTitle>
        <Button
          variant="outline"
          className="bg-[#6418C3] hover:text-white hover:bg-purple-700 py-[25px] rounded-[8px] text-white"
        >
          Generate Report
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex gap-4 items-center ">
          $22,048 <p className="text-green-500 text-base font-bold">+12%</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stageData}>
            <XAxis dataKey="stage" />
            <Tooltip />
            <Bar dataKey="value" fill="#E328AF" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


export default ConversionRateStage;