import React, { useState, useMemo } from "react";
import { Search, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepProgress from "@/components/common/StepProgress";
import { useAllJobMatchResults } from "@/api/query-hooks/ai.hooks";
import { format } from "date-fns";

export const JobGeniusMatcher: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAllJobMatchResults();

  console.log("Job Match Results", data)

  // Prepare candidates data
  const candidates = useMemo(() => {
    if (!data?.jobMatchResults || !data?.candidateDetails) return [];

    // Map job match results with candidate details
    return data.jobMatchResults.map((match) => {
      const candidate = data.candidateDetails.find(
        (c) => c.id === match.candidateId
      );

      return {
        id: match.id,
        name: candidate?.name || "Unknown Candidate",
        applied: candidate?.position || "Unknown Position",
        recommended: match.jobTitle,
        match: Math.round(match.matchPercentage),
        candidateDetails: candidate,
      };
    });
  }, [data]);

  // Filter candidates based on search term
  const filteredCandidates = useMemo(
    () =>
      candidates.filter((candidate) =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [candidates, searchTerm]
  );

  // Paginate filtered candidates
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCandidates = filteredCandidates.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  // Render Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-[32px] shadow-sm p-6 min-h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">JobGenius Matcher</h2>
          <Button variant="outline" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <p>Fetching job match results...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render Error State
  if (isError) {
    return (
      <div className="bg-white rounded-[32px] shadow-sm p-6 min-h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-destructive">
            JobGenius Matcher
          </h2>
          <Button
            variant="destructive"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Retry
          </Button>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center text-destructive">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-center mb-2">
              {error instanceof Error
                ? error.message
                : "Unable to fetch job match results"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Empty State
  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white rounded-[32px] shadow-sm p-6 min-h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">JobGenius Matcher</h2>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center text-gray-500">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-center">No job match results available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">JobGenius Matcher</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center relative">
            <Search className="h-6 w-6 text-gray-400 absolute left-2" />
            <input
              type="text"
              placeholder="Search candidates"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="pl-10 pr-3 py-2 border rounded-lg w-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {currentCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="rounded-[32px] bg-purple-600 text-white p-4 px-5 flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-xl">{candidate.name}</div>
              <div className="text-xs">Applied for: {candidate.applied}</div>
            </div>
            <div className="text-left flex items-center p-3 bg-[#E328AF] rounded-[16px]">
              <div>
                <div className="text-sm">Recommended Position:</div>
                <div className="font-bold">{candidate.recommended}</div>
              </div>
              <div className="flex items-center justify-end mt-1 ml-4">
                <div
                  className="relative w-12 h-12 flex items-center justify-center"
                  style={{
                    background: `conic-gradient(
                    #4CAF50 ${candidate.match}%, 
                    #e0e0e0 ${candidate.match}%
                  )`,
                    borderRadius: "50%",
                  }}
                >
                  <div className="absolute bg-[#E328AF] w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {candidate.match}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, filteredCandidates.length)} from{" "}
          {filteredCandidates.length} results
        </div>

        <StepProgress
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default JobGeniusMatcher;
