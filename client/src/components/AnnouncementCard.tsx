import { IAnnouncementCard } from "@/types/employee";
import { AlarmClock } from "lucide-react";

const AnnouncementCard: React.FC<IAnnouncementCard> = ({ date, title }) => {
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const day = date.getDate();
  const dayOfWeek = date.toDateString().split(" ")[0];
  console.log("day, time:", day, time, dayOfWeek);
  return (
    <section className="flex bg-[#F6F6F9] space-x-1 md:w-[160px] rounded-[6px] w-full h-[70px]">
      <div className=" bg-[#E328AF] text-white p-3 rounded-md flex flex-col items-center justify-center text-sm w-[40px]">
        <p>{dayOfWeek}</p>
        <p>{day}</p>
      </div>
      <div className="flex flex-col items-start justify-center md:space-y-1 text-[#706D8A]  md:max-w-[110px]">
        <p className="text-sm  w-full text-nowrap truncate ">{title}</p>
        <div className="flex items-center justify-center space-x-1">
          <AlarmClock size={15} />
          <p className="text-[12px]">{time.toLocaleLowerCase()}</p>
        </div>
      </div>
    </section>
  );
};

export default AnnouncementCard;
