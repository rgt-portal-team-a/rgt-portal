import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { specialEventTypes } from "@/hooks/useEventForm";

interface SpecialEventTypeSelectorProps {
  selectedType: "1" | "2";
  onSelect: (type: "1" | "2") => void;
}

export const SpecialEventTypeSelector = React.memo(
  ({ selectedType, onSelect }: SpecialEventTypeSelectorProps) => {
    const eventTypeButtons = useMemo(() => {
      return specialEventTypes.map((eventType) => (
        <Button
          key={eventType.id}
          type="button"
          onClick={() => {
            console.log(
              "Selecting An Event With Id",
              eventType.id,
              eventType.label
            );
            onSelect(eventType.id);
          }}
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
      ));
    }, [selectedType, onSelect]);

    return (
      <div className="mb-2">
        <div className="flex space-x-2">{eventTypeButtons}</div>
      </div>
    );
  }
);

SpecialEventTypeSelector.displayName = "SpecialEventTypeSelector";
