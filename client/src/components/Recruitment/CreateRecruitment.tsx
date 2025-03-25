import React, { useState } from "react";
import { Formik, Form, ErrorMessage, FormikHelpers } from "formik";
import { Loader } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SideModal } from "@/components/ui/side-dialog";
import { recruitmentSchema } from "@/lib/recruitmentSchema";
import { buildInitialValues, buildValidationSchema } from "@/lib/utils";
import { renderField } from "./SchemaField";
import { FileUploadService } from "@/api/services/file.service";
import { toast } from "@/hooks/use-toast";
import RecruitmentService, {
  CreateRecruitmentDto,
} from "@/api/services/recruitment.service";

interface UploadStatus {
  cv: "idle" | "loading" | "success" | "error";
  photo: "idle" | "loading" | "success" | "error";
  cvUrl?: string;
  photoUrl?: string;
}

interface UploadResult {
  fieldName: string;
  fileUrl?: string;
  response: any;
}

export const CreateRecruitment: React.FC<CreateRecruitmentProps> = ({
  isOpen,
  onOpenChange,
  title = "New NSS Candidate",
  type,
  fields = recruitmentSchema,
  onSubmit = (values) => console.log("Form submitted with values:", values),
}) => {
  const queryClient = useQueryClient();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    cv: "idle",
    photo: "idle",
  });
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const validationSchema = React.useMemo(
    () => buildValidationSchema(fields),
    [fields]
  );

  const initialValues = React.useMemo(
    () => buildInitialValues(fields),
    [fields]
  );

  const uploadFileMutation = useMutation({
    mutationFn: async ({
      file,
      fieldName,
    }: {
      file: File;
      fieldName: string;
    }) => {
      setUploadStatus((prev) => ({ ...prev, [fieldName]: "loading" }));
      const response = await FileUploadService.uploadFile(file);
      if (!response.success) {
        throw new Error(response.error || `Failed to upload ${fieldName}`);
      }
      return { fieldName, fileUrl: response.file?.url, response };
    },
    onSuccess: (data) => {
      console.log(data);

      const { fieldName, fileUrl } = data;
      setUploadStatus((prev) => ({
        ...prev,
        [fieldName]: "success",
        ...(fieldName === "cv" ? { cvUrl: fileUrl } : { photoUrl: fileUrl }),
      }));
      toast({
        title: "File Uploaded",
        description: `${
          fieldName === "cv" ? "CV" : "Photo"
        } uploaded successfully`,
      });
    },
    onError: (error: Error, variables) => {
      const { fieldName } = variables;
      setUploadStatus((prev) => ({ ...prev, [fieldName]: "error" }));
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createRecruitmentMutation = useMutation({
    mutationFn: (recruitmentData: CreateRecruitmentDto) => {
      setSubmissionStatus("loading");
      return RecruitmentService.createRecruitment(recruitmentData);
    },
    onSuccess: (_data) => {
      setSubmissionStatus("success");
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      toast({
        title: "Success",
        description: "Candidate created successfully",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      setSubmissionStatus("error");
      toast({
        title: "Error",
        description: "Failed to create candidate: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (
    values: RecruitmentFormValues,
    { resetForm }: FormikHelpers<RecruitmentFormValues>
  ) => {
    try {
      const uploadPromises = [];
      const uploadResults: UploadResult[] = [];

      if (values.cv && values.cv instanceof File) {
        uploadPromises.push(
          uploadFileMutation
            .mutateAsync({ file: values.cv, fieldName: "cv" })
            .then((result) => {
              uploadResults.push(result);
              return result;
            })
        );
      }

      if (values.photo && values.photo instanceof File) {
        uploadPromises.push(
          uploadFileMutation
            .mutateAsync({
              file: values.photo,
              fieldName: "photo",
            })
            .then((result) => {
              uploadResults.push(result);
              return result;
            })
        );
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      console.log("Upload results:", uploadResults);

      let cvUrl = "";
      let photoUrl = "";

      uploadResults.forEach((result) => {
        if (result.fieldName === "cv" && result.fileUrl) {
          cvUrl = result.fileUrl;
        } else if (result.fieldName === "photo" && result.fileUrl) {
          photoUrl = result.fileUrl;
        }
      });

      const recruitmentData: CreateRecruitmentDto = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        type: type,
        firstPriority: values.firstPriority,
        secondPriority: values.secondPriority,
        location: values.location,
        phoneNumber: values.phoneNumber,
        university: values.university,
        cvPath: cvUrl,
        photoUrl: photoUrl,
      };

      console.log("Recruitment data:", recruitmentData);

      await createRecruitmentMutation.mutateAsync(recruitmentData);

      onSubmit(values);

      resetForm();
      setUploadStatus({ cv: "idle", photo: "idle" });
      setSubmissionStatus("idle");
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  const getFieldGroups = () => {
    const fullWidthFields = fields.filter(
      (field: any) => field.gridColumn === "full" || !field.gridColumn
    );
    const halfWidthFields = fields.filter(
      (field: any) => field.gridColumn === "half"
    );

    const pairedHalfWidthFields: FormField[][] = [];
    for (let i = 0; i < halfWidthFields.length; i += 2) {
      if (i + 1 < halfWidthFields.length) {
        pairedHalfWidthFields.push([
          halfWidthFields[i],
          halfWidthFields[i + 1],
        ]);
      } else {
        pairedHalfWidthFields.push([halfWidthFields[i]]);
      }
    }

    return { fullWidthFields, pairedHalfWidthFields };
  };

  const { fullWidthFields, pairedHalfWidthFields } = getFieldGroups();

  const renderUploadStatus = (fieldName: "cv" | "photo") => {
    const status = uploadStatus[fieldName];
    if (status === "loading") {
      return (
        <div className="text-blue-500 text-xs mt-1 flex items-center">
          <Loader className="animate-spin h-3 w-3 mr-1" /> Uploading...
        </div>
      );
    } else if (status === "success") {
      return (
        <div className="text-green-500 text-xs mt-1">Upload successful</div>
      );
    } else if (status === "error") {
      return <div className="text-red-500 text-xs mt-1">Upload failed</div>;
    }
    return null;
  };

  const isSubmitting =
    uploadFileMutation.isPending ||
    createRecruitmentMutation.isPending ||
    submissionStatus === "loading";

  return (
    <div>
      <SideModal
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) {
            onOpenChange(open);
            if (!open) {
              setUploadStatus({ cv: "idle", photo: "idle" });
              setSubmissionStatus("idle");
            }
          }
        }}
        title={title}
        position="right"
        size="md"
        contentClassName="flex flex-col text-[#706D8A]  p-0"
        headerClassName="text-[#706D8A]"
        showCloseButton={false}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {(formikProps) => (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4">
                <Form className="space-y-6">
                  {pairedHalfWidthFields.map((fieldPair, index) => (
                    <div
                      key={`pair-${index}`}
                      className="grid grid-cols-2 gap-6"
                    >
                      {fieldPair.map((field) => (
                        <div key={field.name}>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium mb-2"
                          >
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          {renderField(field, formikProps)}
                          {(field.name === "cv" || field.name === "photo") &&
                            renderUploadStatus(field.name as "cv" | "photo")}
                          <ErrorMessage name={field.name}>
                            {(msg) => (
                              <div className="text-red-500 text-xs mt-1">
                                {msg}
                              </div>
                            )}
                          </ErrorMessage>
                        </div>
                      ))}
                    </div>
                  ))}

                  {fullWidthFields.map((field: any) => (
                    <div key={field.name}>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {renderField(field, formikProps)}
                      <ErrorMessage name={field.name}>
                        {(msg) => (
                          <div className="text-red-500 text-xs mt-1">{msg}</div>
                        )}
                      </ErrorMessage>
                    </div>
                  ))}
                </Form>

                {submissionStatus === "loading" && (
                  <div className="mt-4 p-2 bg-blue-50 text-blue-700 rounded flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Creating candidate profile...
                  </div>
                )}
              </div>

              <div className="p-4 bg-white">
                <div className="w-full flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => !isSubmitting && onOpenChange(false)}
                    disabled={isSubmitting}
                    className={`px-6 py-2 border border-[#E328AF] text-[#E328AF] rounded-md transition-colors cursor-pointer ${
                      isSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-pink-100 duration-300 ease-in"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={formikProps.submitForm}
                    disabled={isSubmitting || !formikProps.isValid}
                    className={`px-6 py-2 bg-[#E328AF] text-white rounded-md transition-colors cursor-pointer ${
                      isSubmitting || !formikProps.isValid
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-pink-400 duration-300 ease-in"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Processing...
                      </span>
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Formik>
      </SideModal>
    </div>
  );
};
