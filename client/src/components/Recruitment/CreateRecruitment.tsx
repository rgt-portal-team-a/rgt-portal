/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { Formik, Form, ErrorMessage, FormikHelpers } from "formik";
import { Loader } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { SideModal } from "@/components/ui/side-dialog";
import { recruitmentSchema } from "@/lib/recruitmentSchema";
import { RecruitmentType } from "@/lib/enums";
import { buildInitialValues, buildValidationSchema } from "@/lib/utils";
import { ExtractedCvData, renderField } from "./SchemaField";
import { FileUploadService } from "@/api/services/file.service";
import { employeeService } from "@/api/services/employee.service";
import { toast } from "@/hooks/use-toast";
import RecruitmentService, {
  CreateRecruitmentDto,
} from "@/api/services/recruitment.service";
import { ALL_ROLE_NAMES } from "@/constants";

interface UploadStatus {
  cv: "idle" | "loading" | "success" | "error";
  photo: "idle" | "loading" | "success" | "error";
  cvUrl?: string;
  photoUrl?: string;
}

interface CreateRecruitmentProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  type: RecruitmentType;
  fields?: any[];
  onSubmit?: (values: any) => void;
}

interface UploadResult {
  fieldName: string;
  fileUrl?: string;
  response: any;
}

export const CreateRecruitment: React.FC<CreateRecruitmentProps> = ({
  isOpen,
  onOpenChange,
  title,
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

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeService.getAllEmployees(),
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });


  const [extractedData, setExtractedData] = useState<ExtractedCvData | null>(null);

  const handleExtractedData = (data: ExtractedCvData) => {
    setExtractedData(data);
  };

  const filteredFields = useMemo(() => {
    return fields.filter((field: any) => {
      if (!field.conditionalRender) return true;
      return field.conditionalRender(type);
    });
  }, [fields, type]);

  const validationSchema = useMemo(
    () => buildValidationSchema(filteredFields),
    [filteredFields]
  );

  const initialValues = useMemo(
    () => buildInitialValues(filteredFields),
    [filteredFields]
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
    onSuccess: () => {
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
    values: any,
    { resetForm }: FormikHelpers<any>
  ) => {
    console.log(values);
    try {
      const uploadPromises = [];
      const uploadResults: UploadResult[] = [];

      // Upload CV
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

      // Upload Photo
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

      let cvUrl = "";
      let photoUrl = "";

      uploadResults.forEach((result) => {
        if (result.fieldName === "cv" && result.fileUrl) {
          cvUrl = result.fileUrl;
        } else if (result.fieldName === "photo" && result.fileUrl) {
          photoUrl = result.fileUrl;
        }
      });

      console.log(extractedData);

      // Construct recruitment data and add any other data that is not in the form but is in the extracted CV information
      const recruitmentData: CreateRecruitmentDto = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        type: type,
        source: values.source,
        location: values.location,
        phoneNumber: values.phoneNumber,
        assignees: values?.assignees?.length > 0 ? values.assignees.map(Number) : undefined,
        cvPath: cvUrl,
        photoUrl: photoUrl,
        ...(type === RecruitmentType.NSS
          ? {
              firstPriority: values.firstPriority,
              secondPriority: values.secondPriority,
              university: values.university,
            }
          : {
              position: values.position,
            }),
        //  extracted CV data if available
        ...(extractedData && {
          programOfStudy: values.programOfStudy || extractedData?.programOfStudy,
          currentTitle: extractedData?.currentTitle,
          highestDegree: extractedData?.highestDegree,
          graduationYear: extractedData?.graduationYear,
          technicalSkills: extractedData?.technicalSkills,
          programmingLanguages: extractedData?.programmingLanguages,
          toolsAndTechnologies: extractedData?.toolsAndTechnologies,
          softSkills: extractedData?.softSkills,
          industries: extractedData?.industries,
          certifications: extractedData?.certifications,
          keyProjects: extractedData?.keyProjects,
          recentAchievements: extractedData?.recentAchievements,
        }),
      };

      await createRecruitmentMutation.mutateAsync(recruitmentData);
      onSubmit(values);
      resetForm();
      setUploadStatus({ cv: "idle", photo: "idle" });
      setSubmissionStatus("idle");
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  const assigneeOptions =
    employees
      ?.filter(
        (emp) =>
          emp.user?.role?.name === ALL_ROLE_NAMES.HR ||
          emp.user?.role?.name === ALL_ROLE_NAMES.ADMIN
      )
      .map((emp) => ({
        value: emp.id,
        label: `${emp.firstName} ${emp.lastName}`,
        email: emp.user?.email,
        profile: emp.user?.profileImage,
      })) || [];

  const getFieldGroups = () => {
    const fullWidthFields = filteredFields.filter(
      (field: any) => field.gridColumn === "full" || !field.gridColumn
    );
    const halfWidthFields = filteredFields.filter(
      (field: any) => field.gridColumn === "half"
    );

    const pairedHalfWidthFields: any[][] = [];
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
        title={title || `New ${type.toUpperCase()} Candidate`}
        position="right"
        size="md"
        contentClassName="flex flex-col text-[#706D8A] p-0"
        headerClassName="text-[#706D8A]"
        showCloseButton={true}
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
                          {renderField(field, formikProps, {
                            ...(field.name === "assignees" && {
                              options: assigneeOptions,
                            }),
                          }, handleExtractedData)}

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
                      {renderField(field, formikProps, {
                        ...(field.name === "assignees" && {
                          options: assigneeOptions,
                        }),
                      })}
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
                    disabled={isSubmitting }
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
