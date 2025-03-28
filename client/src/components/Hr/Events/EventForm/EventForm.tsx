import { useState, useCallback, useMemo } from "react";
import { SpecialEventForm } from "./FormFields/SpecialEventForm";
import { AnnouncementForm } from "./FormFields/AnnouncementForm";
import { RecognitionForm } from "./FormFields/RecognitionForm";
import { IEventForm } from "./types";

export const EventForm = (props: IEventForm) => {
  const [employeePopoverStates, setEmployeePopoverStates] = useState<
    Record<number, boolean>
  >({});

  const toggleEmployeePopover = useCallback(
    (index: number, isOpen?: boolean) => {
      setEmployeePopoverStates((prev) => ({
        ...prev,
        [index]: isOpen ?? !prev[index],
      }));
    },
    []
  );

  const formComponents = useMemo(
    () => ({
      "1": (
        <SpecialEventForm
          {...props}
          employeePopoverStates={employeePopoverStates}
          toggleEmployeePopover={toggleEmployeePopover}
        />
      ),
      "2": <AnnouncementForm {...props} />,
      "3": (
        <RecognitionForm
          {...props}
          employeePopoverStates={employeePopoverStates}
          toggleEmployeePopover={toggleEmployeePopover}
        />
      ),
    }),
    [props, employeePopoverStates, toggleEmployeePopover]
  );

  return (
    <div className="flex flex-col mb-8 gap-6">
      {formComponents[props.selectedFormType as keyof typeof formComponents]}
    </div>
  );
};
