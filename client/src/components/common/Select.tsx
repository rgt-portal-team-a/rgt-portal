import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface CustomSelectProps {
  placeholder?: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  placeholder,
  options,
  value,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
      <Button className={`hover:bg-transparent ${className} flex justify-between items-center`}>
        <span>{selectedOption?.label || placeholder || "Select an option"}</span>
        <svg
        className="ml-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>
      </PopoverTrigger>
      <PopoverContent className="">
      <ul className="space-y-1">
        {options.map((option) => (
        <li
          key={option.value}
          className={`cursor-pointer px- py-1 hover:bg-gray-100 flex justify-between items-center ${
          option.value === value ? "font-semibold" : ""
          }`}
          onClick={() => {
          onChange(option.value);
          setIsOpen(false);
          }}
        >
          <span>{option.label}</span>
          {option.value === value && (
          <svg
            className="h-4 w-4 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          )}
        </li>
        ))}
      </ul>
      </PopoverContent>
    </Popover>
  );
};

export default CustomSelect;
