import { ClassNameValue } from "tailwind-merge";

export interface IEventList {
  event: "holiday" | "birthday" | "meeting";
  date: string;
  title: string;
  className?: ClassNameValue;
}

const EventList: React.FC<IEventList> = ({ event, date, title, className }) => {
  return (
    <div
      className={`flex items-center justify-between border-b pb-4 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <img
          src={
            event === "birthday"
              ? "/Gift.svg"
              : event === "holiday"
              ? "/Moon.svg"
              : "/UsersFour.svg"
          }
          alt="calendar"
          className="bg-[#EEF2FF] p-3 rounded-[8px]"
        />
        <div className="space-y-1">
          <p className="text-rgtgray text-sm font-semibold">{title}</p>
          <p className="text-rgtgray text-xs font-[400]">{date}</p>
        </div>
      </div>
    </div>
  );
};

export default EventList;
