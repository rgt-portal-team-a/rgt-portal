import EmployeeTable from "@/components/Hr/Dashboard/EmployeesTable";
import {MetricCard, IMetricCard} from "../../components/Hr/Dashboard/MetricCard";
import QuickActions from "../../components/Hr/QuickActions";

export const HRDashboard = () => {

    const metrics:IMetricCard[] = [
        { title: "Total Employees", value: "2,048", growth: "15", color: "purple" },
        { title: "Regular Employees", value: "2,048", growth: "15", color: "pink" },
        { title: "NSS Employees", value: "2,048", growth: "15", color: "blue" },
        { title: "PTO Requests", value: "2,048", growth: "15", color: "yellow" }
    ];

    return (
    <div className="flex flex-col-reverse gap-6 md:flex-row h-full w-full">
        <div className="flex flex-col gap-[17px]  space-y-10 md:w-[70%] overflow-y-auto"       
            style={{
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* IE and Edge */,
        }}>
            <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-4">
                {metrics.map((metric, index) => (
                <MetricCard 
                key={index}
                title={metric.title}
                value={metric.value}
                growth={metric.growth}
                color={metric.color}
                />
                ))}
            </div>
            <div>
                <EmployeeTable/>
            </div>
        </div>

        <section className="flex justify-center  h-fit  md:right-0 md:top-0 md:w-[30%]  overflow-y-auto">
            <QuickActions />
        </section>
    </div>
    )
}
