"use client";

import * as React from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ClassNameValue } from "tailwind-merge";
import CalendarIcon2 from "@/assets/icons/CalendarIcon2";

interface IDatePicker {
  placeholder?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  className?: ClassNameValue;
  selected?: Date | null;
}

const DatePicker: React.FC<IDatePicker> = ({
  placeholder,
  value,
  onChange,
  className,
}) => {
  const [date, setDate] = React.useState<Date | undefined>(value);
  // Update Formik's state when the date changes
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild className=" p-0 ">
        <Button
          variant={"outline"}
          className={`${className || ""} ${cn(
            "justify-between text-left font-normal",
            !date && "text-muted-foreground "
          )}`}
        >
          {date ? (
            format(date, "PPP")
          ) : (
            <span className="text-[#7B7A80] font-semibold">
              {placeholder ? placeholder : "Pick a date"}
            </span>
          )}

          <CalendarIcon2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" style={{ zIndex: 170 }}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          initialFocus
          classNames={{
            day_selected:
              "bg-[#C0AFFF] text-white hover:bg-[#C0AFFF] focus:bg-[#C0AFFF]",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
