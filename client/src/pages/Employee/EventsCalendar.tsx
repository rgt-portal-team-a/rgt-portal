import { AnimationWrapper } from "@/common/page-animation";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const EventsCalendar = () => {
  return (
    <AnimationWrapper
      initial={{ x: "100%" }}
      animate={{ x: "0%" }}
      // exit={{ x: "-100%" }}
      key="eventsCalendar"
      transition={{ duration: 0.5 }}
    >
      <main className="p-4 space-y-4">
        <header>
          <p className="text-[#706D8A] text-2xl font-semibold">
            Event Calendar
          </p>
          <p className="text-[#706D8A] text-xs">
            These are all your upcoming events for the week
          </p>
        </header>

        <section className="overflow-x-scroll bg-white rounded-md p-2 flex flex-col space-y-4">
          <div className="grid grid-cols-7 gap-4 min-w-[1000px]">
            {days.map((item, index) => (
              <p key={index} className="text-[#A5A5A5] text-sm text-center">
                {item}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4 min-w-[1000px]">
            {[...Array(31).keys()].map((item) => (
              <div
                className="border-[2px] p-3 border-[#F6EEFF] bg-[#F5F5F5] rounded-sm min-h-32"
                key={item}
              >
                <p className="font-bold text-2xl">{item + 1}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AnimationWrapper>
  );
};

export default EventsCalendar;
