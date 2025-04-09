import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab";
import {
  ArrowLeft,
  Calendar,
  Download,
  Mail,
  MapPin,
  Phone,
  User,
  Building,
  Briefcase,
  GraduationCap,
  List,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import { RecruitmentStatus, RecruitmentType } from "@/lib/enums";
import { useRecruitment } from "@/hooks/useRecruitment";
import CandidateDetailSkeleton from "@/components/Recruitment/CandidateDetailSkeleton";

const CandidateDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const candidateId = id ? id : null;

  const {
    data: candidate,
    isLoading,
    isError,
    error,
  } = useRecruitment(candidateId);
  const [candidateType, setCandidateType] = useState<RecruitmentType | null>(
    null
  );

  useEffect(() => {
    if (candidate) {
      setCandidateType(
        candidate.type?.toLowerCase() === "nss"
          ? RecruitmentType.NSS
          : RecruitmentType.EMPLOYEE
      );
    }
  }, [candidate]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")} ${date.toLocaleString(
      "default",
      { month: "short" }
    )} ${date.getFullYear()}`;
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <CandidateDetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-8">
        <Button variant="outline" onClick={handleBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading candidate details</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load data. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-8">
        <Button variant="outline" onClick={handleBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert>
          <AlertTitle>Candidate not found</AlertTitle>
          <AlertDescription>
            The candidate you're looking for doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Badge
          className={
            candidateType === RecruitmentType.NSS
              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
              : "bg-purple-100 text-purple-800 hover:bg-purple-100"
          }
        >
          {candidateType === RecruitmentType.NSS
            ? "NSS Candidate"
            : "Employee Candidate"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="h-24 w-24 bg-gray-200 rounded-full mb-4 overflow-hidden">
                {candidate.photoUrl ? (
                  <img
                    src={candidate.photoUrl}
                    alt={candidate.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-600 text-3xl">
                    {candidate.name.charAt(0)}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-center">
                {candidate.name}
              </h2>
              <p className="text-gray-500 text-sm">
                {candidate.position ||
                  (candidateType === RecruitmentType.NSS
                    ? "NSS Applicant"
                    : "Candidate")}
              </p>
              <Badge
                className="mt-2"
                variant={
                  candidate.currentStatus === RecruitmentStatus.CV_REVIEW
                    ? "default"
                    : candidate.currentStatus ===
                        RecruitmentStatus.FIRST_INTERVIEW ||
                      RecruitmentStatus.ONLINE_EXAMS ||
                      RecruitmentStatus.TECHNICAL_INTERVIEW ||
                      RecruitmentStatus.CONTRACT_TERMS ||
                      RecruitmentStatus.CUSTOMER_INTERVIEW ||
                      RecruitmentStatus.FACE_TO_FACE_INTERVIEW
                    ? "secondary"
                    : candidate.currentStatus === RecruitmentStatus.NOT_HIRED
                    ? "destructive"
                    : candidate.currentStatus === RecruitmentStatus.ON_HOLD
                    ? "outline"
                    : "default"
                }
              >
                {candidate.currentStatus || "No Status"}
              </Badge>
            </div>

            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-clip overflow-hidden text-ellipsis max-w-[150px]">
                    {candidate.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">
                    {candidate.phoneNumber || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">
                    {candidate.location || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <GraduationCap className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Graduation Year</p>
                  <p className="font-medium">
                    {candidate.graduationYear || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Application Date</p>
                  <p className="font-medium">
                    {formatDate(candidate.createdAt)}
                  </p>
                </div>
              </div>

              {candidate.cvPath && (
                <div className="mt-6">
                  <a
                    href={candidate.cvPath}
                    target="_blank"
                    rel="noreferrer"
                    className="flex border border-gray-300 rounded-md p-1 text-sm justify-center items-center text-gray-500 hover:text-blue-500 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span className="ml-2">Download CV</span>
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 md:col-span-2 col-span-1">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="status">Application Status</TabsTrigger>
              <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Details</CardTitle>
                  <CardDescription>
                    Complete information about the candidate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-md font-semibold flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Personal Information
                      </h3>

                      <div className="ml-6 space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium">{candidate.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{candidate.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">
                            {candidate.phoneNumber || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">
                            {candidate.location || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {candidateType === RecruitmentType.NSS && (
                      <div className="space-y-4">
                        <h3 className="text-md font-semibold flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Education
                        </h3>

                        <div className="ml-6 space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">University</p>
                            <p className="font-medium">
                              {candidate.university || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              First Priority
                            </p>
                            <p className="font-medium">
                              {candidate.firstPriority || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Second Priority
                            </p>
                            <p className="font-medium">
                              {candidate.secondPriority || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {candidateType === RecruitmentType.EMPLOYEE && (
                      <div className="space-y-4">
                        <h3 className="text-md font-semibold flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          Professional
                        </h3>

                        <div className="ml-6 space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Position</p>
                            <p className="font-medium">
                              {candidate.position || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Source</p>
                            <p className="font-medium">
                              {candidate.source || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-md font-semibold flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Application Status
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
                      <div>
                        <p className="text-sm text-gray-500">Current Status</p>
                        <Badge
                          className="mt-2"
                          variant={
                            candidate.currentStatus ===
                            RecruitmentStatus.CV_REVIEW
                              ? "default"
                              : candidate.currentStatus ===
                                  RecruitmentStatus.FIRST_INTERVIEW ||
                                RecruitmentStatus.ONLINE_EXAMS ||
                                RecruitmentStatus.TECHNICAL_INTERVIEW ||
                                RecruitmentStatus.CONTRACT_TERMS ||
                                RecruitmentStatus.CUSTOMER_INTERVIEW ||
                                RecruitmentStatus.FACE_TO_FACE_INTERVIEW
                              ? "secondary"
                              : candidate.currentStatus ===
                                RecruitmentStatus.NOT_HIRED
                              ? "destructive"
                              : candidate.currentStatus ===
                                RecruitmentStatus.ON_HOLD
                              ? "outline"
                              : "default"
                          }
                        >
                          {candidate.currentStatus || "No Status"}
                        </Badge>
                      </div>

                      {candidate.statusDueDate && (
                        <div>
                          <p className="text-sm text-gray-500">
                            Status Due Date
                          </p>
                          <p className="font-medium">
                            {formatDate(candidate.statusDueDate)}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-500">Fail Reason</p>
                        <p className="font-medium">
                          {candidate.failReason || "None"}
                        </p>
                      </div>

                      {candidateType === RecruitmentType.EMPLOYEE && (
                        <div>
                          <p className="text-sm text-gray-500">Fail Stage</p>
                          <p className="font-medium">
                            {candidate.failStage || "None"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {candidate.createdBy && (
                    <div className="space-y-4">
                      <h3 className="text-md font-semibold flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Record Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
                        <div>
                          <p className="text-sm text-gray-500">Created By</p>
                          <div className="flex items-center mt-1">
                            <div className="h-6 w-6 bg-gray-200 rounded-full overflow-hidden mr-2">
                              {candidate.createdBy.profileImage ? (
                                <img
                                  src={candidate.createdBy.profileImage}
                                  alt={candidate.createdBy.username}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                                  {candidate.createdBy.username.charAt(0)}
                                </div>
                              )}
                            </div>
                            <p className="font-medium">
                              {candidate.createdBy.username}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Created Date</p>
                          <p className="font-medium">
                            {formatDate(candidate.createdAt)}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p className="font-medium">
                            {formatDate(candidate.updatedAt)}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Assignees</p>
                          {candidate.assignees &&
                          candidate.assignees.length > 0 ? (
                            <div className="flex items-center mt-1">
                              {candidate.assignees.map((assignee) => (
                                <div
                                  key={assignee.id}
                                  className="h-6 w-6 bg-gray-200 rounded-full overflow-hidden mr-2 cursor-pointer hover:opacity-80"
                                  title={assignee.user.username}
                                  onClick={() =>
                                    navigate(`/emp/${assignee.id}`)
                                  }
                                >
                                  {assignee.user.profileImage ? (
                                    <img
                                      src={assignee.user.profileImage}
                                      alt={assignee.user.username}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                                      {assignee.user.username
                                        .toUpperCase()
                                        .charAt(0)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="font-medium">Not assigned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>
                    Track the progress of this application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Current Status</h3>
                        <p className="text-sm text-gray-500">
                          Last updated: {formatDate(candidate.updatedAt)}
                        </p>
                      </div>
                      <Badge
                        className="mt-2"
                        variant={
                          candidate.currentStatus ===
                          RecruitmentStatus.CV_REVIEW
                            ? "default"
                            : candidate.currentStatus ===
                                RecruitmentStatus.FIRST_INTERVIEW ||
                              RecruitmentStatus.ONLINE_EXAMS ||
                              RecruitmentStatus.TECHNICAL_INTERVIEW ||
                              RecruitmentStatus.CONTRACT_TERMS ||
                              RecruitmentStatus.CUSTOMER_INTERVIEW ||
                              RecruitmentStatus.FACE_TO_FACE_INTERVIEW
                            ? "secondary"
                            : candidate.currentStatus ===
                              RecruitmentStatus.NOT_HIRED
                            ? "destructive"
                            : candidate.currentStatus ===
                              RecruitmentStatus.ON_HOLD
                            ? "outline"
                            : "default"
                        }
                      >
                        {candidate.currentStatus || "No Status"}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-px before:h-full before:bg-gray-200">
                      <div className="relative pl-10">
                        <div className="absolute left-0 top-1 w-7 h-7 bg-purple-100 border-2 border-purple-700 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-purple-700" />
                        </div>
                        <h4 className="font-medium">Application Received</h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(candidate.createdAt)}
                        </p>
                        <p className="text-sm mt-1">
                          Candidate application was received and registered in
                          the system.
                        </p>
                      </div>

                      {candidate.currentStatus &&
                        candidate.currentStatus.toLowerCase() !==
                          RecruitmentStatus.NOT_HIRED && (
                          <div className="relative pl-10">
                            <div className="absolute left-0 top-1 w-7 h-7 bg-blue-100 border-2 border-blue-600 rounded-full flex items-center justify-center">
                              <List className="h-3 w-3 text-blue-600" />
                            </div>
                            <h4 className="font-medium">Under Review</h4>
                            <p className="text-sm text-gray-500">
                              {formatDate(candidate.updatedAt)}
                            </p>
                            <p className="text-sm mt-1">
                              Application is being reviewed by the recruitment
                              team.
                            </p>
                          </div>
                        )}

                      {candidate.failReason && (
                        <div className="relative pl-10">
                          <div className="absolute left-0 top-1 w-7 h-7 bg-red-100 border-2 border-red-600 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                          </div>
                          <h4 className="font-medium">Application Rejected</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(candidate.updatedAt)}
                          </p>
                          <p className="text-sm mt-1">
                            Reason: {candidate.failReason}
                            {candidate.failStage &&
                              ` at ${candidate.failStage} stage`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions">
              <Card>
                <CardHeader>
                  <CardTitle>AI Predictions</CardTitle>
                  <CardDescription>
                    AI-powered insights about the candidate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {candidate.predictedScore && (
                      <div className="space-y-2">
                        <h3 className="text-md font-semibold">
                          Predicted Score
                        </h3>
                        <p className="text-sm text-gray-500">
                          The AI's prediction of how well this candidate matches
                          the position
                        </p>
                        <div className="flex items-center mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${candidate.predictedScore}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium">
                            {candidate.predictedScore}%
                          </span>
                        </div>
                      </div>
                    )}

                    {candidate.predictedDropOff && (
                      <div className="space-y-2">
                        <h3 className="text-md font-semibold">Drop-off Risk</h3>
                        <p className="text-sm text-gray-500">
                          The AI's prediction of the likelihood this candidate
                          will drop out of the recruitment process
                        </p>
                        <div className="flex items-center mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                candidate.predictedDropOff > 70
                                  ? "bg-red-600"
                                  : candidate.predictedDropOff > 40
                                  ? "bg-yellow-600"
                                  : "bg-green-600"
                              }`}
                              style={{
                                width: `${candidate.predictedDropOff}%`,
                              }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium">
                            {candidate.predictedDropOff}%
                          </span>
                        </div>
                      </div>
                    )}

                    {!candidate.predictedScore &&
                      !candidate.predictedDropOff && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No AI predictions available for this candidate.</p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>
                    Additional comments and notes about the candidate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {candidate.notes ? (
                    <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                      {candidate.notes}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No notes available for this candidate.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailView;
