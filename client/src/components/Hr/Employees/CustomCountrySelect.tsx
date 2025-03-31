import React from "react";
import { CountrySelect } from "react-country-state-city";
import { Country } from "react-country-state-city/dist/esm/types";

interface ExtendedCountrySelectProps {
  onChange?: (country: Country | null) => void;
  defaultValue?: Country | null;
  value?: Country | null;
  placeHolder?: string;
  containerClassName?: string;
  inputClassName?: string;
  selectedCountry?: number | null;
}

const CustomCountrySelect = React.forwardRef<
  HTMLInputElement,
  ExtendedCountrySelectProps
>(({ onChange, defaultValue, selectedCountry, placeHolder,containerClassName,inputClassName, ...props }, ref) => {
  const resolvedDefaultValue = selectedCountry
    ? selectedCountry
    : defaultValue;

  return (
    <CountrySelect
      {...(props as any)}
      ref={ref}
      onChange={(country: Country) => {
        onChange?.(country || null);
      }}
      onTextChange={undefined}
      placeHolder={placeHolder || "Select Country"}
      containerClassName={containerClassName || "w-full"}
      inputClassName={inputClassName || "w-full"}
      defaultValue={resolvedDefaultValue || undefined}
    />
  );
});

CustomCountrySelect.displayName = "CustomCountrySelect";

export default CustomCountrySelect;
