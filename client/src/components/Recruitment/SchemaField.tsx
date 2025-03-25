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

export const renderField = (
  field: FormField,
  { values, touched, errors, setFieldValue }: any
) => {
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      setFieldValue(fieldName, event.currentTarget.files[0]);
    }
  };

  switch (field.type) {
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
                  {field.options?.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
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
                ? values[field.name]
                : values[field.name].name
              : field.placeholder || `Upload ${field.label}`}
          </div>
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
