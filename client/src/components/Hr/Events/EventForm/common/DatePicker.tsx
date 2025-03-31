import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {  FieldInputProps, Field } from "formik";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  name: string;
  label?: string;
}

export const DatePicker = React.memo(({ name, label }: DatePickerProps) => (
  <Field name={name}>
    {({ field, form }: { field: FieldInputProps<string>; form: any }) => (
      <div className="flex flex-col space-y-2">
        {label && (
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            {label}
          </label>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left  font-normal py-6 px-4 bg-gray-100 focus-visible:ring-1 focus-visible:ring-rgtpurpleaccent3",
                !form.values.date && "text-muted-foreground"
              )}
            >
              {form.values.date ? (
                format(form.values.date, "PPP")
              ) : (
                <span className="text-gray-500 font-semibold mx-1">
                  Select date
                </span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 text-gray-400" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0 z-[2000]" align="start">
            <Calendar
              mode="single"
              selected={form.values.date}
              onSelect={(date) => {
                form.setFieldValue(field.name, date);
              }}
              disabled={(date: Date) =>
                date < new Date() &&
                date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    )}
  </Field>
));
DatePicker.displayName = "DatePicker";
