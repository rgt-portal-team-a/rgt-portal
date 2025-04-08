import { useState } from "react";
import { EventModal } from "@/components/Hr/Events/EventModal";
import EventsCalendar from "@/components/Hr/Events/EventsCalendar";
import { Button } from "@/components/ui/button";
import { useAllEvents } from "@/api/query-hooks/event.hooks";
import Upcoming_SpecialCard from "@/components/common/Upcoming_SpecialCard.tsx";
import ErrorMessage from "@/components/common/ErrorMessage";
import EventsPageSkeleton from "@/components/Hr/Events/EventsPageSkeleton";

const Events = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  if (isEventsError) {
    console.error("Events Data Error", eventsError);
    return (
      <ErrorMessage
        title="Error Loading Events Data"
        error={eventsError}
        refetchFn={refetchEvents}
      />
    );
  }

  const processedEvents = eventsData?.data.map((event) => ({
    ...event,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime),
  }));

  return (
    <>
      <div className="flex flex-col gap-[15px] h-full bg-white rounded-md">
        <section className="h-[62px] flex justify-between w-full items-center pt-5 px-4 ">
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

        <section className="flex sm:flex-col md:flex-row gap-4 h-full">
          {/* calendar */}
          <div className="hidden md:flex justify-center w-[35%] overflow-hidden h-[530px]">
            <Upcoming_SpecialCard />
          </div>

          {/* Events Calendar Section */}
          <div className="flex md:w-[70%] h-full">
            <EventsCalendar events={processedEvents || []} />
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
