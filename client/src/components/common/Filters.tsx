/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FilterConfig {
  type: "select" | "date";
  placeholder?: string;
  options?: string[];
  value: any;
  onChange: (value: any) => void;
  className?: string;
}

import { X } from "lucide-react";
import DatePicker from "./DatePicker";
import CustomSelect from "./Select";

interface FiltersProps {
  filters: FilterConfig[];
  onReset: () => void;
}

const Filters: React.FC<FiltersProps> = ({ filters, onReset }) => {
  return (
    <div className="flex-col w-full flex sm:flex-row gap-3 h-[50px] my-8">
      {filters.map((filter, index) => {
        if (filter.type === "select") {
          return (
            <CustomSelect
              key={index}
              placeholder={filter.placeholder}
              options={filter.options || []}
              value={filter.value}
              onChange={filter.onChange}
              className={`bg-[#F6F6F9] border-0 sm:w-[320px] text-xs sm:text-sm font-semibold text-nowrap rounded-[12px] px-3 text-slate-500 ${filter.className}`}
            />
          );
        } else if (filter.type === "date") {
          return (
            <DatePicker
              key={index}
              className={`h-full border-0 bg-[#F6F6F9] sm:w-[320px] text-xs sm:text-sm font-semibold rounded-[12px] ${filter.className}`}
              selected={filter.value}
              onChange={(date) => filter.onChange(date ?? null)}
            />
          );
        }
        return null;
      })}
      <div
        className="text-[#8A8A8C] font-semibold text-sm flex items-center p-1 flex-1 justify-center hover:bg-slate-200 rounded-[12px] transition-all duration-300 ease-in cursor-pointer bg-slate-100"
        onClick={onReset}
      >
        <X className="w-4 md:hidden sm:w-8" />
        <p className="hidden md:block">Reset</p>
      </div>
    </div>
  );
};

export default Filters;
