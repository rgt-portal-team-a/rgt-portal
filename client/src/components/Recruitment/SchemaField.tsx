/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from "formik";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/types/recruitment";
import { useExtractCvDetails } from "@/hooks/useRecruitment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export interface ExtractedCvData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  currentTitle?: string;
  currentCompany?: string;
  [key: string]: any;
}

export const renderField = (
  field: FormField,
  { values, touched, errors, setFieldValue }: any,
  additionalProps: Record<string, any> = {},
  setExtractedData?: (data: ExtractedCvData) => void
) => {
  const extractCvMutation = useExtractCvDetails();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0];
      setFieldValue(fieldName, file);

      if (fieldName === "cv") {
        try {
          const extractedData = await extractCvMutation.mutateAsync(file) as ExtractedCvData;
          console.log("Extracted CV data:", extractedData);

          if (extractedData) {
            setExtractedData?.(extractedData);
            // Handle name splitting
            if (extractedData.name) {
              const nameParts = extractedData.name.split(" ");
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";
              console.log("Setting name fields:", { firstName, lastName });
              setFieldValue("firstName", firstName);
              setFieldValue("lastName", lastName);
            }

            // Map other fields
            const fieldMapping: Record<string, string> = {
              email: "email",
              phoneNumber: "phoneNumber",
              location: "location",
              currentTitle: "position",
              currentCompany: "university",
            };

            Object.entries(extractedData).forEach(([key, value]) => {
              const formField = fieldMapping[key];
              if (value && formField) {
                console.log(`Setting ${formField} to:`, value);
                setFieldValue(formField, value);
              }
            });

            // Trigger UI update
            setTimeout(() => {
              setFieldValue("__trigger_render", Math.random());
            }, 100);
          }
        } catch (error) {
          console.error("Failed to extract CV details:", error);
        }
      }
    }
  };

  switch (field.type) {
    case "multiSelect":
      return (
        <Field name={field.name} key={field.name}>
          {({ field: formikField }: any) => {
            const selectedValues = formikField.value || [];
            return (
              <Select
                value={selectedValues[selectedValues.length - 1] || ""}
                onValueChange={(value) => {
                  const newValues = selectedValues.includes(value)
                    ? selectedValues.filter((v: string) => v !== value)
                    : [...selectedValues, value];
                  setFieldValue(field.name, newValues);
                }}
              >
                <SelectTrigger className="w-full border-none bg-gray-100">
                  <SelectValue
                    placeholder={
                      selectedValues.length
                        ? `${selectedValues.length} selected`
                        : field.placeholder || `Select ${field.label}`
                    }
                  />
                </SelectTrigger>
                <SelectContent className="z-[2000]">
                  <SelectGroup>
                    {(additionalProps.options || field.options)?.map(
                      (option: any, index: number) => {
                        const value = typeof option === "object" ? option.value.toString() : option.toString();
                        const isSelected = selectedValues.includes(value);
                        return (
                          <SelectItem
                            key={index}
                            value={value}
                            className={`
                              ${isSelected ? "bg-gray-100" : ""} 
                              flex items-center space-x-2 w-full
                            `}
                          >
<div className="flex items-center justify-between w-full space-x-4">
                    {/* Avatar Section */}
                    {typeof option === "object" && option.profile && (
                      <Avatar className="shrink-0">
                        <AvatarImage
                          src={option.profile}
                          alt={option.label ?? ""}
                        />
                        <AvatarFallback>
                          {option.label}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {/* Label and Email Section */}
                    <div className="flex-grow flex flex-col">
                      <div className="flex items-center space-x-2">
                        <p className="flex-grow">
                          {typeof option === "object"
                            ? option.label
                            : option}
                        </p>
                        {isSelected && (
                          <span className="text-green-500 ml-2">✓</span>
                        )}
                      </div>
                      {typeof option === "object" && option.email && (
                        <p className="text-sm text-gray-500">
                          {option.email}
                        </p>
                      )}
                    </div>
                  </div>
                          </SelectItem>
                        );
                      }
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            );
          }}
        </Field>
      );
    case "select":
      return (
        <Field name={field.name} key={field.name}>
          {({ field: formikField }: any) => (
            <Select
              value={formikField.value}
              onValueChange={(value) => setFieldValue(field.name, value)}
            >
              <SelectTrigger className="w-full border-none bg-gray-100">
                <SelectValue
                  placeholder={field.placeholder || `Select ${field.label}`}
                />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                <SelectGroup>
                  {(additionalProps.options || field.options)?.map(
                    (option: any, index: number) => (
                      <SelectItem
                        key={index}
                        value={
                          typeof option === "object" ? option.value : option
                        }
                      >
                        {typeof option === "object" ? option.label : option}
                      </SelectItem>
                    )
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </Field>
      );

    case "file":
      return (
        <div className="relative">
          <input
            id={field.name}
            name={field.name}
            type="file"
            onChange={(e) => handleFileChange(e, field.name, setFieldValue)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept={field.accept}
          />
          <div className="bg-gray-100 rounded-md p-2 text-center text-gray-500">
            {values[field.name]
              ? typeof values[field.name] === "string"
                ? values[field.name].substring(values[field.name].lastIndexOf("/") + 1)
                : (values[field.name] as File)?.name
              : field.placeholder || `Upload ${field.label}`}
          </div>
          {field.name === "cv" && (
            <div className="mt-1">
              {extractCvMutation.isPending && (
                <div className="text-sm text-blue-500 flex items-center">
                  <span className="animate-pulse">
                    Extracting CV details...
                  </span>
                </div>
              )}
              {extractCvMutation.isSuccess && (
                <div className="text-sm text-green-500">
                  CV details extracted!
                </div>
              )}
              {extractCvMutation.isError && (
                <div className="text-sm text-red-500">
                  Failed to extract details
                </div>
              )}
            </div>
          )}
        </div>
      );

    default:
      return (
        <Field name={field.name}>
          {({ field: formikField }: any) => (
            <Input
              {...formikField}
              id={field.name}
              type={field.type}
              placeholder={
                field.placeholder || `Enter ${field.label.toLowerCase()}`
              }
              aria-invalid={touched[field.name] && Boolean(errors[field.name])}
              className="bg-gray-100"
            />
          )}
        </Field>
      );
  }
};
