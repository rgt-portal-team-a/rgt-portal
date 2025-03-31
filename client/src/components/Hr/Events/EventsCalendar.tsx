import { useState } from 'react';
import { EventType } from "@/constants";
import BtnNext from "@/assets/icons/BtnNext"
import {Event} from "@/types/events"

interface ICalendarProps {
events: Event[];
}

const EventsCalendar = ({ events = [] }: ICalendarProps) => {
const [currentDate, setCurrentDate] = useState(new Date());
const [view, setView] = useState<'date' | 'week' | 'month' | 'year'>('month');

// Color mapping for event types
const getEventColor = (type: EventType) => {
  const colors = {
    [EventType.OTHER]: '#48AABF',
    [EventType.TRAINING]: '#BF48A8',
    [EventType.HOLIDAY]: '#48BF84',
    [EventType.BIRTHDAY]: '#BF7B48',
    [EventType.ANNOUNCEMENT]: '#A0A0A0'
  };
  return colors[type] || '#7848BF';
};



// Helper method to check if an event is on a specific date
const isEventOnDate = (event: Event, date: Date) => {
  return event.startTime.getDate() === date.getDate() &&
         event.startTime.getMonth() === date.getMonth() &&
         event.startTime.getFullYear() === date.getFullYear();
};

// Format date for header
const formatHeader = (date: Date) => {
  if (view === 'date') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } else if (view === 'week') {
    const weekStart = new Date(date);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (${weekStart.getDate()}-${weekEnd.getDate()})`;
    } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
      return `${weekStart.toLocaleDateString('en-US', { month: 'short' })} ${weekStart.getDate()} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  } else if (view === 'month') {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else if (view === 'year') {
    return date.getFullYear().toString();
  }
  return '';
};

// Navigation functions
const navigatePrevious = () => {
  const newDate = new Date(currentDate);
  switch (view) {
    case 'date':
      newDate.setDate(newDate.getDate() - 1);
      break;
    case 'week':
      newDate.setDate(newDate.getDate() - 7);
      break;
    case 'month':
      newDate.setMonth(newDate.getMonth() - 1);
      break;
    case 'year':
      newDate.setFullYear(newDate.getFullYear() - 1);
      break;
  }
  setCurrentDate(newDate);
};

const navigateNext = () => {
  const newDate = new Date(currentDate);
  switch (view) {
    case 'date':
      newDate.setDate(newDate.getDate() + 1);
      break;
    case 'week':
      newDate.setDate(newDate.getDate() + 7);
      break;
    case 'month':
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    case 'year':
      newDate.setFullYear(newDate.getFullYear() + 1);
      break;
  }
  setCurrentDate(newDate);
};

// Format time
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Render event card
const renderEventCard = (event: Event, compact = false) => {
  const color = getEventColor(event.type);
  
  if (compact) {
    return (
      <div 
        key={event.id}
        className="px-1 py-0.5 text-xs flex-wrap"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <span className="font-medium">{event.title}</span>
        <span className="ml-1 text-gray-500 text-xs">
          {formatTime(event.startTime)}
        </span>
      </div>
    );
  }
  
  return (
    <div 
      key={event.id}
      className="p-2 flex flex-col text-xs bg-white rounded shadow-sm border-l-4 mb-1"
      style={{ borderLeftColor: color }}
    >
      <div className="font-medium">{event.title}</div>
      <div className="text-gray-500">
        {formatTime(event.startTime)} - {formatTime(event.endTime)}
      </div>
      {event.description && (
        <div className="text-gray-600 mt-1 text-xs">{event.description}</div>
      )}
      {event.location && (
        <div className="text-gray-500 text-xs mt-1">
          📍 {event.location}
        </div>
      )}
      {event.participants && event.participants.length > 0 && (
        <div className="text-gray-500 text-xs mt-1">
          Participants: {event.participants.length}
        </div>
      )}
    </div>
  );
};



// Day View Rendering
const renderDayView = () => {
  const hours = Array.from({length: 24}, (_, i) => i);
  
  // Filter events for the current date
  const dayEvents = events.filter(event => 
    event.startTime.getDate() === currentDate.getDate() &&
    event.startTime.getMonth() === currentDate.getMonth() &&
    event.startTime.getFullYear() === currentDate.getFullYear()
  );

  return (
    <div className="overflow-x-scroll">
      {hours.map(hour => {
        // Find events that overlap with this hour
        const hourEvents = dayEvents.filter(event => 
          event.startTime.getHours() <= hour && 
          event.endTime.getHours() > hour
        );
        
        return (
          <div key={hour} className="flex border-b">
            <div className="w-16 p-2 text-xs text-right text-gray-500 border-r">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            <div className="flex-1 min-h-12 p-1 flex space-x-1">
              {hourEvents.map((event, index) => (
                <div 
                  key={`${event.id}-${index}`} 
                  className="flex-grow-0 flex-shrink-0 w-auto"
                  style={{
                    width: `calc(100% / ${hourEvents.length})`, // Divide width equally
                  }}
                >
                  <div 
                    className="bg-blue-100 border border-blue-300 rounded p-1 w-24 text-xs overflow-hidden"
                    style={{
                      backgroundColor: getEventColor(event.type),
                      color: 'white'
                    }}
                  >
                    <div className="font-semibold truncate">{event.title}</div>
                    <div className="text-[0.7rem] truncate">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </div>
                  </div>
                  {/* {renderEventCard(event, true)} */}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};





// Week View Rendering
const renderWeekView = () => {
  const weekDays = getDaysInWeek();
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  
  return (
    <div className="">
      <div className="grid grid-cols-8 bg-purple-50">
        <div className="p-2 border-r"></div>
        {weekDays.map((day, index) => (
          <div 
            key={index} 
            className={`p-2 text-center text-sm border-r ${isToday(day) ? 'bg-purple-100 font-bold' : ''}`}
          >
            <div>{getShortDay(index)}</div>
            <div className={`text-lg ${isToday(day) ? 'text-purple-700' : ''}`}>{day.getDate()}</div>
          </div>
        ))}
      </div>
      
      {hours.map(hour => (
        <div key={hour} className="grid grid-cols-8 border-b">
          <div className="p-2 text-xs text-right text-gray-500 border-r">
            {formatHourLabel(hour)}
          </div>
          
          {weekDays.map((day, index) => {
            // More comprehensive event filtering for the week view
            const items = events.filter(event => {
              const eventStart = event.startTime;
              const eventEnd = event.endTime;

              // Create date objects for day start and end
              const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
              const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);

              // Check if event overlaps with the current hour and day
              const isEventDuringHour = 
                eventStart.getHours() === hour ||
                (eventStart.getHours() < hour && eventEnd.getHours() > hour);

              return (
                eventStart >= dayStart && 
                eventStart <= dayEnd && 
                isEventDuringHour
              );
            });

            return (
              <div 
                key={index} 
                className={`p-1 border-r ${isToday(day) ? 'bg-purple-50' : ''}`}
              >
                {items.map(item => renderEventCard(item, true))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};


// Month View Rendering
const renderMonthView = () => {
  const days = getDaysInMonth();
  
  return (
    <>
      <div className=" grid grid-cols-7 py-4 bg-purple-50 rounded-t-md">
        {getShortDays().map((day) => (
          <div
            key={day}
            className="p-3 text-left font-semibold text-purple-700"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((day, index) => {
          const isDateInCurrentMonth = isCurrentMonth(day);
          const isDateToday = isToday(day);
          const dayEvents = events.filter((event) => isEventOnDate(event, day));

          return (
            <div
              key={index}
              className={`min-h-24 font-bold ${!isDateInCurrentMonth ? "bg-gray-50" : "bg-white"}`}
            >
              <div
                className={`text-left px-3 py-1 ${!isDateInCurrentMonth ? "text-gray-400" : ""} ${isDateToday ? "bg-purple-100 text-purple-700 font-bold" : ""}`}
              >
                {day.getDate()}
              </div>

              <div className="space-y-1 px-1">
                {dayEvents
                  .slice(0, 2)
                  .map((event, _idx) => renderEventCard(event, true))}

                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// Year View Rendering
const renderYearView = () => {
  const yearMonths = getMonthsInYear();
  
  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
      {yearMonths.map((month, _) => {
        const monthEvents = events.filter(event => 
          event.startTime.getMonth() === month.getMonth() && 
          event.startTime.getFullYear() === month.getFullYear()
        );
        
        return renderMonthPreview(month, monthEvents);
      })}
    </div>
  );
};


const getShortDays = () => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getShortDay = (index: number) => {
  const shortDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return shortDays[index];
};

const formatHourLabel = (hour: number) => {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
};

const isCurrentMonth = (day: Date) => {
  return day.getMonth() === currentDate.getMonth() &&
         day.getFullYear() === currentDate.getFullYear();
};

const isToday = (day: Date) => {
  const today = new Date();
  return day.getDate() === today.getDate() &&
         day.getMonth() === today.getMonth() &&
         day.getFullYear() === today.getFullYear();
};

const renderMonthPreview = (month: Date, monthEvents: Event[]) => {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const monthName = month.toLocaleString('default', { month: 'long' });
  
  return (
    <div key={month.getMonth()} className="border rounded shadow-sm">
      <div className="bg-purple-50 p-2 text-center font-medium border-b">
        {monthName}
      </div>
      <div className="grid grid-cols-7 gap-px bg-white p-1 text-xs">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-gray-500">
            {d}
          </div>
        ))}
        
        {Array(firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1).fill(null).map((_, i) => (
          <div key={`empty-start-${i}`} className="text-center py-1"></div>
        ))}
        
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const isDateToday = isToday(date);
          const hasEvents = monthEvents.some(event => 
            event.startTime.getDate() === day
          );
          
          return (
            <div 
              key={`day-${day}`} 
              className={`text-center py-1 ${isDateToday ? 'bg-purple-100 rounded-full text-purple-700 font-bold' : ''}`}
            >
              {day}
              {hasEvents && <div className="mx-auto w-1 h-1 bg-purple-500 rounded-full mt-1"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper methods for getting calendar days
const getDaysInMonth = () => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay() || 7;
  
  const prevMonthDays = [];
  for (let i = 0; i < startingDayOfWeek - 1; i++) {
    const day = new Date(year, month, 0 - i);
    prevMonthDays.unshift(day);
  }
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push(new Date(year, month, i));
  }
  
  const totalDaysShown = Math.ceil((prevMonthDays.length + daysInMonth) / 7) * 7;
  const nextMonthDays = [];
  let remainingDays = totalDaysShown - (prevMonthDays.length + daysInMonth);
  
  for (let i = 1; i <= remainingDays; i++) {
    nextMonthDays.push(new Date(year, month + 1, i));
  }
  
  return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
};

const getDaysInWeek = () => {
  const week = [];
  const day = currentDate.getDay();
  const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentDate);
    date.setDate(diff + i);
    week.push(date);
  }
  
  return week;
};

const getMonthsInYear = () => {
  return Array.from({length: 12}, (_, i) => 
    new Date(currentDate.getFullYear(), i, 1)
  );
};

// View change handler
const handleViewChange = (newView: 'date' | 'week' | 'month' | 'year') => {
  setView(newView);
};

return (
  <div className="w-full h-[680px] overflow-y-scroll border rounded-lg bg-white shadow p-4" 
    style={{
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    }}>
    {/* Calendar header with navigation and view options */}
    <div className="flex items-center mb-4">
      <div className="flex items-center w-[40%] justify-between">
        <h2 className="text-2xl font-bold">{formatHeader(currentDate)}</h2>
        <div className="ml-2 text-gray-400 flex gap-4">
          <button
            onClick={navigatePrevious}
            className="p-1 rotate-180 hover:bg-gray-200"
          >
            <BtnNext />
          </button>
          <button onClick={navigateNext} className="p-1 hover:bg-gray-200">
            <BtnNext />
          </button>
        </div>
      </div>

      {/* View selection tabs */}
      <div className="flex text-gray-400 border-b border-gray-300 mx-auto items-center justify-center overflow-hidden">
        {(["date", "week", "month", "year"] as const).map((viewOption) => (
          <button
            key={viewOption}
            className={`px-4 py-1 ${view === viewOption ? "bg-gray-100 border-b-4 border-gray-400" : ""}`}
            onClick={() => handleViewChange(viewOption)}
          >
            {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
          </button>
        ))}
      </div>
    </div>

    {/* Render appropriate view */}
      {view === "date" && renderDayView()}
      {view === "week" && renderWeekView()}
      {view === "month" && renderMonthView()}
      {view === "year" && renderYearView()}
  </div>
);
};

export default EventsCalendar;