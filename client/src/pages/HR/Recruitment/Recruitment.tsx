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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecruitmentTableSkeleton from "@/components/Recruitment/RecruitmentTableSekeleton";

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
  const limit = parseInt(searchParams.get("limit") || "5");

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
      <div className="p-6">
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
      <div className="p-6">
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

  return (
    <div className="p-6">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this candidate?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The candidate information will be
              permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecruitmentPage;
