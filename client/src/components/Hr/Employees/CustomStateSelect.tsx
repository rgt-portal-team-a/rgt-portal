import React from "react";
import { StateSelect } from "react-country-state-city";
import { State } from "react-country-state-city/dist/esm/types";

interface ExtendedStateSelectProps {
  onChange?: (state: State | null) => void;
  defaultValue?: State | number | null | undefined;
  value?: State | number | null;
  placeHolder?: string;
  containerClassName?: string;
  inputClassName?: string;
  countryid?: number | null;
  disabled?: boolean;
}

const CustomStateSelect = React.forwardRef<
  HTMLInputElement,
  ExtendedStateSelectProps
>(
  (
    {
      onChange,
      defaultValue,
      countryid,
      placeHolder,
      containerClassName,
      inputClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const resolvedDefaultValue = defaultValue && typeof defaultValue === "number"
      ? defaultValue
      : undefined;

    return (
      <StateSelect
        {...(props as any)}
        ref={ref}
        onChange={(state: State) => {
          onChange?.(state || null);
        }}
        onTextChange={undefined}
        placeHolder={placeHolder || "Select State/Region"}
        containerClassName={containerClassName || "w-full"}
        inputClassName={inputClassName || "w-full"}
        defaultValue={resolvedDefaultValue}
        countryid={countryid || 0}
        disabled={disabled}
      />
    );
  }
);

CustomStateSelect.displayName = "CustomStateSelect";

export default CustomStateSelect;
