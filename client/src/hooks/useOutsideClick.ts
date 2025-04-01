import { RefObject, useEffect } from "react";

type EventType = MouseEvent | TouchEvent;

export const useOutsideClick = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  callback: () => void,
  excludeRefs?: RefObject<HTMLElement>[]
) => {
  useEffect(() => {
    const handleClickOutside = (event: EventType) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        const shouldTriggerCallback = excludeRefs
          ? !excludeRefs.some((excludeRef) =>
              excludeRef.current?.contains(event.target as Node)
            )
          : true;

        if (shouldTriggerCallback) {
          callback();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [ref, callback, excludeRefs]);
};
