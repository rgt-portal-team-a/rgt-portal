import React from "react";
import { Button } from "@/components/ui/button";
import { specialEventTypes } from "@/hooks/useEventForm";

interface SpecialEventTypeSelectorProps {
  selectedType: "1" | "2";
  onSelect: (type: "1" | "2") => void;
}

export const SpecialEventTypeSelector = React.memo(
  ({ selectedType, onSelect }: SpecialEventTypeSelectorProps) => (
    <div className="mb-2">
      <div className="flex space-x-2">
        {specialEventTypes.map((eventType) => (
          <Button
            key={eventType.id}
            type="button"
            onClick={() => onSelect(eventType.id)}
            className={`
            ${
              selectedType === eventType.id
                ? "bg-[#E328AF] text-white hover:bg-[#E328AF]"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }
            px-4 py-[10px] rounded-[8px] transition-colors
          `}
          >
            {eventType.label}
          </Button>
        ))}
      </div>
    </div>
  )
);
SpecialEventTypeSelector.displayName = "SpecialEventTypeSelector";
