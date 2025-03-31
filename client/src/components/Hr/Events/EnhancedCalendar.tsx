import React, { useMemo, useState, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isAfter } from "date-fns";
import { Event } from "@/types/events";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancedCalendarProps {
  events: Event[];
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

const getEventColor = (type: string) => {
  switch (type) {
    case "holiday":
      return "event-holiday";
    case "birthday":
      return "event-birthday";
    case "announcement":
      return "event-announcement";
    default:
      return "event-default";
  }
};

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
  events,
  selected,
  onSelect,
}) => {
  const [_tooltipDate, setTooltipDate] = useState<Date | null>(null);
  const [_tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Create a map of dates with events
  const eventDatesMap = useMemo(() => {
    const dateMap = new Map<string, Event[]>();

    events.forEach((event) => {
      const dateKey = format(event.startTime, "yyyy-MM-dd");
      const existingEvents = dateMap.get(dateKey) || [];
      dateMap.set(dateKey, [...existingEvents, event]);
    });

    return dateMap;
  }, [events]);

  // Create modifiers for days with events
  const modifiers = useMemo(() => {
    const modifiers: Record<string, (date: Date) => boolean> = {};

    events.forEach((event) => {
      const dateKey = format(event.startTime, "yyyy-MM-dd");
      modifiers[dateKey] = (date: Date) =>
        format(date, "yyyy-MM-dd") === dateKey;
    });

    return modifiers;
  }, [events]);

  // Create modifiersClassNames for styling days with events
  const modifiersClassNames = useMemo(() => {
    const classNames: Record<string, string> = {};

    events.forEach((event) => {
      const dateKey = format(event.startTime, "yyyy-MM-dd");
      classNames[dateKey] = cn(
        getEventColor(event.type),
        isAfter(new Date(event.startTime), new Date()) ? "event-upcoming" : ""
      );
    });

    return classNames;
  }, [events]);

  // Get events for the tooltip date
  //   const tooltipEvents = tooltipDate ? eventDatesMap.get(format(tooltipDate, 'yyyy-MM-dd')) || [] : [];

  // Handle day mouse enter
  const handleDayMouseEnter = (
    date: Date,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    setTooltipDate(date);
    const dayElement = event.currentTarget;
    const rect = dayElement.getBoundingClientRect();
    setTooltipPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  // Handle day mouse leave
  const handleDayMouseLeave = () => {
    setTooltipDate(null);
    setTooltipPosition(null);
  };

  return (
    <>
      <style>{`
        .event-holiday::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background-color: #48BF84;
          border-radius: 50%;
        }
        .event-birthday::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background-color: #BF7B48;
          border-radius: 50%;
        }
        .event-announcement::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background-color: #A0A0A0;
          border-radius: 50%;
        }
        .event-default::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background-color: purple;
          border-radius: 50%;
        }
        .event-upcoming {
          border: 2px solid orange;
        }
      `}</style>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        initialFocus
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        classNames={{
          day_selected:
            "bg-green-400 text-white hover:bg-[#F8C74F] focus:bg-[#F8C74F] rounded-full relative",
          month: "flex flex-col space-y-3 flex-grow",
          day: "w-8 h-8 font-medium rounded-full",
          head_cell:
            "w-8 flex-grow text-[#B5BEC6] font-semibold uppercase text-[10px]",
          cell: "flex items-center justify-center flex-grow text-sm relative",
        }}
        className="shadow-lg shadow-gray-300 p-2 rounded-md flex flex-col w-full md:w-[348px] relative h-[310px]"
        components={{
          Day: ({ date }) => {
            const dateKey = format(date, "yyyy-MM-dd");
            const hasEvents = eventDatesMap.has(dateKey);

            return (
              <Tooltip key={dateKey}>
                <TooltipTrigger asChild>
                  <div
                    ref={(el) => {
                      dayRefs.current[dateKey] = el;
                    }}
                    onMouseEnter={(e) =>
                      hasEvents && handleDayMouseEnter(date, e)
                    }
                    onMouseLeave={handleDayMouseLeave}
                    className={cn(
                      "w-8 h-8 font-medium rounded-full flex items-center justify-center",
                      modifiersClassNames[dateKey] || "",
                      hasEvents ? "cursor-pointer" : ""
                    )}
                  >
                    {format(date, "d")}
                  </div>
                </TooltipTrigger>
                {hasEvents && (
                  <TooltipContent
                    style={{
                      zIndex: 1000,
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      {eventDatesMap.get(dateKey)?.map((event) => (
                        <div key={event.id}>
                          <strong>{event.title}</strong>
                          <p>{event.description}</p>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          },
        }}
      />
    </>
  );
};

export default EnhancedCalendar;
