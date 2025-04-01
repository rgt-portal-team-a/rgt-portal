import { useAllEvents } from "@/api/query-hooks/event.hooks";
import ErrorMessage from "./ErrorMessage";
import EnhancedCalendar from "../Hr/Events/EnhancedCalendar";
import ArrowIcon from "@/assets/icons/ArrowIcon";
import EventList from "../EventList";
import AnnouncementCard from "../AnnouncementCard";
import { useState } from "react";

const Upcoming_SpecialCard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const {
    data: eventsData,
    isError: isEventsError,
    error: eventsError,
    refetch: refetchEvents,
  } = useAllEvents();

  if (!eventsData || !eventsData.success || isEventsError) {
    console.error("Events Data Error", eventsError);
    return (
      <ErrorMessage
        title="Error Loading Events Data"
        error={eventsError}
        refetchFn={refetchEvents}
      />
    );
  }

  const processedEvents = eventsData.data.map((event) => ({
    ...event,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime),
  }));

  // Separate events by type
  const specialEvents = processedEvents.filter(
    (event) => event.type === "holiday" || event.type === "birthday"
  );

  const announcements = processedEvents.filter(
    (event) => event.type === "announcement"
  );

  return (
    <>
      <section
        className="custom1:flex space-y-10 w-full md:w-[380px] overflow-y-auto "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="pt-5 space-y-3 h-fit  bg-white rounded-t-2xl w-full flex flex-col items-center">
          <p className="font-bold text-lg text-[#706D8A] px-4 w-full">
            Upcoming Events
          </p>

          <EnhancedCalendar
            events={processedEvents}
            selected={selectedDate}
            onSelect={setSelectedDate}
          />

          <div className="px-4 py-[24px] bg-white rounded-lg space-y-5 w-full">
            <div className="flex items-center justify-between">
              <p className="text-[#706D8A] font-[700] text-lg">
                Special Events
              </p>

              <ArrowIcon className="hover:bg-slate-200 rounded-full transition-all duration-300 ease-in rotate-360 cursor-pointer" />
            </div>

            <div className="flex flex-col space-y-5">
              {specialEvents.length > 0 ? (
                specialEvents.map((event, index) => (
                  <EventList
                    key={index}
                    event={event.type === "holiday" ? "holiday" : "birthday"}
                    date={event.startTime.toLocaleDateString()}
                    title={event.title}
                    className={`${
                      specialEvents.length - 1 === index ? "border-b-0" : ""
                    }`}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center">No special events</p>
              )}
            </div>
          </div>

          <div className="px-4 bg-white rounded-lg space-y-2 w-full">
            <div className="flex items-center justify-between pb-4">
              <p className="font-semibold text-[#706D8A] text-lg">
                Announcements
              </p>
              <ArrowIcon className="hover:bg-slate-200 rounded-full transition-all duration-300 ease-in rotate-360 cursor-pointer" />
            </div>
            <div className="flex flex-col md:grid grid-cols-2 gap-3 ">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    date={new Date(announcement.startTime)}
                    title={announcement.title}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center col-span-full">
                  No announcements
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Upcoming_SpecialCard;
