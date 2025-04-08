/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useMemo } from "react";
import { RecruitmentType } from "@/lib/enums";
import RecruitmentTable from "@/components/Recruitment/RecruitmentTable";
import { CreateRecruitment } from "@/components/Recruitment/CreateRecruitment";
import { EditRecruitment } from "@/components/Recruitment/EditRecruiment";
import {
  useRecruitments,
  useDeleteRecruitment,
  RecruitmentFilters,
} from "@/hooks/useRecruitment";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecruitmentTableSkeleton from "@/components/Recruitment/RecruitmentTableSekeleton";
import ConfirmCancelModal from "@/components/common/ConfirmCancelModal";
import toastService from "@/api/services/toast.service";
import DeleteRippleIcon from "@/components/common/DeleteRippleIcon";

interface RecruitmentPageProps {
  type: RecruitmentType;
}

const RecruitmentPage: React.FC<RecruitmentPageProps> = ({ type }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCandidateId, setEditCandidateId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "6");

  const filters = useMemo<RecruitmentFilters>(() => {
    const filterParams: RecruitmentFilters = {};

    if (searchParams.has("name"))
      filterParams.name = searchParams.get("name") || undefined;
    if (searchParams.has("email"))
      filterParams.email = searchParams.get("email") || undefined;
    if (searchParams.has("status"))
      filterParams.status = searchParams.get("status") || undefined;
    if (searchParams.has("location"))
      filterParams.location = searchParams.get("location") || undefined;
    if (searchParams.has("position"))
      filterParams.position = searchParams.get("position") || undefined;

    filterParams.type = type.toLowerCase();

    return filterParams;
  }, [searchParams, type]);

  const { data, isLoading, isError, error, refetch, isFetching }: any =
    useRecruitments(page, limit, filters);

  const deleteMutation = useDeleteRecruitment();

  const handleView = useCallback(
    (id: string) => {
      navigate(`/hr/recruitment/candidate/${id}`);
    },
    [navigate]
  );

  const handleEdit = useCallback((id: string) => {
    setEditCandidateId(id);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setDeleteId(null);
          toastService.success("Employee deleted successfully");
        },
        onError: (error) => {
          toastService.error(`Error Deleting employee: ${error}`);
        },
      });
    }
  }, [deleteId, deleteMutation]);

  const handleAddNew = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      searchParams.set("page", newPage.toString());
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams]
  );

  const handleSearch = useCallback(
    (term: string) => {
      if (term) {
        searchParams.set("name", term);
      } else {
        searchParams.delete("name");
      }
      searchParams.set("page", "1");
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams]
  );

  if (isLoading) {
    return (
      <div className="">
        <RecruitmentTableSkeleton
          rowCount={limit}
          columnCount={type === RecruitmentType.EMPLOYEE ? 9 : 8}
          type={
            type === RecruitmentType.EMPLOYEE
              ? "EMPLOYEE CANDIDATES"
              : "NSS CANDIDATES"
          }
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading recruitment data</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load data. Please try again."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  console.log("data Failstage:", data?.recruitments)

  return (
    <div className="bg-white h-full rounded-md px-4 py-2">
      {isFetching && !isLoading && (
        <div className="fixed top-4 right-4 bg-white shadow-md rounded-md p-2 flex items-center z-50">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      <RecruitmentTable
        candidates={data?.recruitments || []}
        type={type}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
        totalItems={data?.total || 0}
        totalPages={data?.totalPages || 1}
        currentPage={page}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />

      {/* Create Recruitment Modal */}
      <CreateRecruitment
        type={type}
        title={
          type === RecruitmentType.NSS
            ? "New NSS Candidate"
            : "New Employee Candidate"
        }
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      {/* Edit Recruitment Modal */}
      <EditRecruitment
        type={type}
        title={
          type === RecruitmentType.NSS
            ? "Edit NSS Candidate"
            : "Edit Employee Candidate"
        }
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        candidateId={editCandidateId}
      />

      <ConfirmCancelModal
        isOpen={isDeleteDialogOpen}
        onSubmit={confirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onOpenChange={() => ""}
        submitText="Delete"
        isSubmitting={deleteMutation.isPending}
      >
        <div className="flex flex-col justify-center items-center space-y-2">
          <DeleteRippleIcon />
          <p className="text-lg font-semibold text-center">
            Are you sure you want to delete this candidate?
          </p>
          <p className="font-light text-[#535862] text-sm text-center text-wrap w-[300px]">
            This action cannot be undone. The candidate information will be
            permanently removed from the system.
          </p>
        </div>
      </ConfirmCancelModal>
    </div>
  );
};

export default RecruitmentPage;
