// import StepProgress from "@/components/StepProgress";
import DepartmentCard from "@/components/DepartmentCard";
import { RootState } from "@/state/store";
import { useSelector } from "react-redux";

const Departments = () => {
  const { departments } = useSelector((state: RootState) => state.sharedState);
  return (
    <main>
      <header className="text-[#706D8A] font-semibold text-xl">
        All Departments
      </header>

      <section className="pt-6 flex flex-wrap gap-4 justify-center sm:justify-start ">
        {departments.length > 0 ? (
          departments.map((item, index) => (
            <DepartmentCard {...item} key={index} />
          ))
        ) : (
          <div className="w-full bg-slate-200 flex items-center justify-center h-96 text-rgtpurple font-semibold">
            <p>No departments available</p>
          </div>
        )}
      </section>

      {/* <section className=" mt-5 flex justify-center items-center"> */}
      {/* <StepProgress /> */}
      {/* </section> */}
    </main>
  );
};

export default Departments;
