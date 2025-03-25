import { useState } from "react";
import { EventModal } from "@/components/Hr/Events/EventModal";
import EventsCalendar from "@/components/Hr/Events/EventsCalendar";
import EnhancedCalendar from "@/components/Hr/Events/EnhancedCalendar";
import { Button } from "@/components/ui/button";
import { useAllEvents } from "@/api/query-hooks/event.hooks";
import EventList from "@/components/EventList";
import AnnouncementCard from "@/components/AnnouncementCard";
import { Link } from "react-router-dom";
import ErrorMessage from "@/components/common/ErrorMessage";
import EventsPageSkeleton from "@/components/Hr/Events/EventsPageSkeleton";

const Events = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const {
    data: eventsData,
    isLoading: isEventsLoading,
    isError: isEventsError,
    error: eventsError,
    refetch: refetchEvents,
  } = useAllEvents();

  if (isEventsLoading) {
    return <EventsPageSkeleton />;
  }

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
      <div className="flex flex-col gap-[15px]  px-4 ">
        <section className="h-[62px] flex justify-between w-full items-center py-1  ">
          <div className="text-left flex flex-col gap-2">
            <h1 className="text-2xl font-medium text-gray-600">Events</h1>
            <h1 className="text-sm font-medium text-gray-400">
              These are your events so far
            </h1>
          </div>

          <div className="md:flex md:flex-row items-center h-full">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-rgtviolet hover:bg-violet-900 cursor-pointer text-white font-medium text-sm py-6 transition-colors duration-300 ease-in"
            >
              <img src="/Add.svg" alt="add" />
              New Event
            </Button>
          </div>
        </section>

        <section className="flex sm:flex-col md:flex-row gap-4  pb-5">
          <div className="flex justify-center w-[30%] overflow-y-scroll  h-[680px]">
            <div className="pt-5 space-y-3 h-fit order-2 bg-white rounded-t-2xl w-full">
              <div className="px-4 flex items-center justify-between pb-4">
                <p className="text-[#706D8A] font-[700] text-2xl">
                  Upcoming Events
                </p>
              </div>
              <EnhancedCalendar
                events={processedEvents}
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
              <div className="p-4 bg-white rounded-lg space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-[#706D8A] font-[700] text-lg">
                    Special Events
                  </p>
                  <Link to="/events-calendar">
                    <img
                      src="/Down 2.svg"
                      className="hover:bg-slate-200 rounded-full transition-all duration-300 ease-in -rotate-90 cursor-pointer"
                      alt="View more"
                    />
                  </Link>
                </div>

                {/* Special Events List */}
                <div className="flex flex-col space-y-5">
                  {specialEvents.length > 0 ? (
                    specialEvents.map((event) => (
                      <EventList
                        key={event.id}
                        event={
                          event.type === "holiday" ? "holiday" : "birthday"
                        }
                        date={event.startTime.toLocaleDateString()}
                        title={event.title}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">
                      No special events
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg space-y-2">
                <div className="flex items-center justify-between pb-4">
                  <p className="text-[#706D8A] font-[700] text-lg">
                    Announcements
                  </p>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
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
          </div>

          {/* Events Calendar Section */}
          <div className="flex w-[70%] h-fit">
            <EventsCalendar events={processedEvents} />
          </div>
        </section>
      </div>

      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default Events;
