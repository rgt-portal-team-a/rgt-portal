/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { Formik, Form, ErrorMessage, FormikHelpers, Field } from "formik";
import { Loader } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { recruitmentSchema } from "@/lib/recruitmentSchema";
import { buildInitialValues, buildValidationSchema } from "@/lib/utils";
import { RecruitmentStatus, FailStage, RecruitmentType } from "@/lib/enums";
import { toast } from "@/hooks/use-toast";
import {
  useUpdateRecruitment,
  useRecruitment,
  Recruitment,
  useUpdateRecruitmentStatus,
  usePredictMatch,
} from "@/hooks/useRecruitment";
import { SideModal } from "@/components/ui/side-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tab";
import { FileUploadService } from "@/api/services/file.service";
import { renderField } from "./SchemaField";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { employeeService } from "@/api/services/employee.service";

interface EditRecruitmentProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string | null;
  title?: string;
  type: RecruitmentType;
  fields?: any[];
  onSubmit?: (values: any) => void;
}

interface UploadStatus {
  cv: "idle" | "loading" | "success" | "error";
  photo: "idle" | "loading" | "success" | "error";
  cvUrl?: string;
  photoUrl?: string;
}

export const EditRecruitment: React.FC<EditRecruitmentProps> = ({
  isOpen,
  onOpenChange,
  candidateId,
  title = "Edit Candidate",
  type,
  fields = recruitmentSchema,
  onSubmit = (values) => console.log("Form submitted with values:", values),
}) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    cv: "idle",
    photo: "idle",
  });
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [failStageVisible, setFailStageVisible] = useState<boolean>(false);

  const { data: candidate, isLoading: isLoadingCandidate } = useRecruitment(
    candidateId,
    isOpen
  );

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeService.getAllEmployees(),
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  const filteredFields = useMemo(() => {
    return fields.filter((field: any) => {
      if (!field.conditionalRender) return true;
      return field.conditionalRender(type);
    });
  }, [fields, type]);

  const updateMutation = useUpdateRecruitment();
  const statusUpdateMutation = useUpdateRecruitmentStatus();
  const predictMatchMutation = usePredictMatch();

  const validationSchema = React.useMemo(
    () => buildValidationSchema(fields),
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

  const transformCandidateToFormValues = (candidate: Recruitment) => {
    const nameParts = candidate.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      firstName,
      lastName,
      email: candidate.email || "",
      phoneNumber: candidate.phoneNumber || "",
      university: candidate.university || "",
      firstPriority: candidate.firstPriority || "",
      secondPriority: candidate.secondPriority || "",
      location: candidate.location || "",
      cv: null,
      photo: null,
      currentStatus: candidate.currentStatus || RecruitmentStatus.CV_REVIEW,
      failStage: candidate.failStage || "",
      failReason: candidate.failReason || "",
    };
  };

  const initialValues = React.useMemo(() => {
    if (candidate) {
      return transformCandidateToFormValues(candidate);
    }
    return buildInitialValues(filteredFields);
  }, [candidate, filteredFields]);

  const assigneeOptions = employees?.map((emp: any) => ({
    value: emp.id,
    label: `${emp.firstName} ${emp.lastName}`,
  })) || [];

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("edit");
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === "status" && candidate) {
      setFailStageVisible(
        candidate.currentStatus === RecruitmentStatus.NOT_HIRED
      );
    }
  }, [activeTab, candidate]);

  const handleSubmit = async (
    values: any,
    { setSubmitting }: FormikHelpers<any>
  ) => {
    if (!candidateId) return;

    try {
      setSubmissionStatus("loading");
      let cvUrl = candidate?.cvPath;
      let photoUrl = candidate?.photoUrl;

      if (values.cv && values.cv instanceof File) {
        const cvResult = await uploadFileMutation.mutateAsync({
          file: values.cv,
          fieldName: "cv",
        });
        if (cvResult.fileUrl) cvUrl = cvResult.fileUrl;
      }

      if (values.photo && values.photo instanceof File) {
        const photoResult = await uploadFileMutation.mutateAsync({
          file: values.photo,
          fieldName: "photo",
        });
        if (photoResult.fileUrl) photoUrl = photoResult.fileUrl;
      }

      const updateData = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phoneNumber: values.phoneNumber,
        university: values.university,
        firstPriority: values.firstPriority,
        secondPriority: values.secondPriority,
        location: values.location,
        cvPath: cvUrl,
        photoUrl: photoUrl,
      };

      await updateMutation.mutateAsync({
        id: candidateId,
        data: updateData,
      });

      onSubmit(values);
      setSubmissionStatus("success");
      toast({
        title: "Success",
        description: "Candidate updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmissionStatus("error");
      toast({
        title: "Error",
        description: "Failed to update candidate information",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (
    values: any,
    { setSubmitting }: FormikHelpers<any>
  ) => {
    if (!candidateId) return;

    try {
      setSubmissionStatus("loading");

      const statusData = {
        status: values.currentStatus,
        failStage: values.failStage,
        failReason: values.failReason,
      };
      console.log("statusData", statusData);
      

      await statusUpdateMutation.mutateAsync({
        id: candidateId,
        data: statusData,
      });

      setSubmissionStatus("success");
      toast({
        title: "Success",
        description: "Candidate status updated successfully",
      });

      // IF SUCCESSFUL AND THE CANDIDATE IS NOT HIRED, THEN UPDATE THE CANDIDATE STATUS TO NOT HIRED MAKE A REQUEST TO THE AI API TO PREDICT THE CANDIDATE'S MATCH 
      if (values.currentStatus === RecruitmentStatus.NOT_HIRED) {
        await predictMatchMutation.mutateAsync(candidateId);
      }


      onOpenChange(false);
    } catch (error) {
      console.error("Status update failed:", error);
      setSubmissionStatus("error");
      toast({
        title: "Error",
        description: "Failed to update candidate status",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
    updateMutation.isPending ||
    statusUpdateMutation.isPending ||
    submissionStatus === "loading";

  if (isLoadingCandidate && candidateId) {
    return (
      <SideModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        // title="Loading Candidate Data..."
        showCloseButton={false}
        position="right"
        size="md"
        className="w-1/3 flex justify-center items-center"
      >
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-8 w-8 text-pink-500" />
        </div>
      </SideModal>
    );
  }

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
              setActiveTab("edit");
            }
          }
        }}
        title={title}
        position="right"
        size="md"
        className="w-2/5 p-6"
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mb-6"
        >
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger
              value="edit"
              className="data-[state=active]:text-pink-600 data-[state=active]:bg-white"
            >
              Edit Information
            </TabsTrigger>
            <TabsTrigger
              value="status"
              className="data-[state=active]:text-pink-600 data-[state=active]:bg-white"
            >
              Update Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {(formikProps) => (
                <>
                  <Form className="space-y-6">
                    {pairedHalfWidthFields.map((fieldPair, index) => (
                      <div
                        key={`pair-${index}`}
                        className="grid grid-cols-2 gap-6"
                      >
                        {fieldPair.map((field: any) => (
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
                            {field.type === "file" && (
                              <div className="text-xs text-gray-500 mb-1">
                                {field.name === "cv" && candidate?.cvPath && (
                                  <a
                                    href={candidate.cvPath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    Current CV
                                  </a>
                                )}
                                {field.name === "photo" &&
                                  candidate?.photoUrl && (
                                    <a
                                      href={candidate.photoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                    >
                                      Current Photo
                                    </a>
                                  )}
                              </div>
                            )}
                            {renderField(field, formikProps, {
                              ...(field.name === "assignee" && {
                                options: assigneeOptions,
                              }),
                            })}
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
                          ...(field.name === "assignee" && {
                            options: assigneeOptions,
                          }),
                        })}
                        <ErrorMessage name={field.name}>
                          {(msg) => (
                            <div className="text-red-500 text-xs mt-1">
                              {msg}
                            </div>
                          )}
                        </ErrorMessage>
                      </div>
                    ))}
                  </Form>

                  <div className="flex justify-end gap-3 mt-6">
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
                        "Update Information"
                      )}
                    </button>
                  </div>
                </>
              )}
            </Formik>
          </TabsContent>

          <TabsContent value="status">
            <Formik
              initialValues={initialValues}
              onSubmit={handleStatusUpdate}
              enableReinitialize
            >
              {(formikProps) => (
                <>
                  <Form className="space-y-6">
                    <div>
                      <label
                        htmlFor="currentStatus"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Current Status
                        <span className="text-red-500 ml-1">*</span>
                      </label>

                      <Field name={"currentStatus"} key={"currentStatus"}>
                        {({ field, form }: any) => (
                          <Select
                            value={field.value}
                            onValueChange={(selectedValue) => {
                              form.setFieldValue(
                                "currentStatus",
                                selectedValue
                              );

                              setFailStageVisible(
                                selectedValue === RecruitmentStatus.NOT_HIRED
                              );
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={`Select Current Status`}
                              />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                              <SelectGroup>
                                {Object.values(RecruitmentStatus).map(
                                  (status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  )
                                )}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      </Field>

                      <ErrorMessage name="currentStatus">
                        {(msg) => (
                          <div className="text-red-500 text-xs mt-1">{msg}</div>
                        )}
                      </ErrorMessage>
                    </div>

                    {failStageVisible && (
                      <>
                        <label
                          htmlFor="failStage"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Fail Stage
                        </label>

                        <Field name={"failStage"} key={"failStage"}>
                          {({ field, form }: any) => (
                            <Select
                              value={field.value}
                              onValueChange={(selectedValue) => {
                                form.setFieldValue("failStage", selectedValue);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={`Select fail stage`}
                                />
                              </SelectTrigger>
                              <SelectContent className="z-[9999]">
                                <SelectGroup>
                                  {Object.values(FailStage).map((stage) => (
                                    <SelectItem key={stage} value={stage}>
                                      {stage}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        </Field>

                        <div>
                          <label
                            htmlFor="failReason"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Reason for Failure
                          </label>
                          <textarea
                            id="failReason"
                            name="failReason"
                            value={formikProps.values.failReason}
                            onChange={formikProps.handleChange}
                            rows={4}
                            className="w-full border-gray-300 p-2 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                            placeholder="Provide details on why the candidate was not hired"
                          />
                        </div>
                      </>
                    )}

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status Notes
                      </label>
                      <textarea
                        name="notes"
                        rows={4}
                        className="w-full border-gray-300 p-2 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        placeholder="Add any additional notes about this status change"
                      />
                    </div>
                  </Form>

                  <div className="flex justify-end gap-3 mt-6">
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
                      disabled={isSubmitting}
                      className={`px-6 py-2 bg-[#E328AF] text-white rounded-md transition-colors cursor-pointer ${
                        isSubmitting
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
                        "Update Status"
                      )}
                    </button>
                  </div>
                </>
              )}
            </Formik>
          </TabsContent>
        </Tabs>

        {submissionStatus === "loading" && (
          <div className="mt-4 p-2 bg-blue-50 text-blue-700 rounded flex items-center">
            <Loader className="animate-spin h-4 w-4 mr-2" />
            Updating candidate information...
          </div>
        )}
      </SideModal>
    </div>
  );
};
