import { useState } from "react";
import { Search, History } from "lucide-react";
import StepProgress from "@/components/common/StepProgress"; 


export const CandidateFallouts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const candidates = [
    {
      id: 1,
      name: "Peyton Riley Clarkson Aheampong Davis Coleman",
      applied: "Blockchain",
      recommended: "Social Media Marketing",
      match: 78,
    },
    {
      id: 2,
      name: "Taylor Emerson Langley Carrington",
      applied: "Healthcare",
      recommended: "Social Media Marketing",
      match: 92,
    },
    {
      id: 3,
      name: "Bailey Hudson Remington Lancaster",
      applied: "Blockchain",
      recommended: "Social Media Marketing",
      match: 35,
    },
    {
      id: 4,
      name: "Morgan Riley Sutton Blackwood",
      applied: "Finance",
      recommended: "Product Management",
      match: 65,
    },
    {
      id: 5,
      name: "Quinn Addison Montgomery Sinclair",
      applied: "Marketing",
      recommended: "Business Development",
      match: 88,
    },
    {
      id: 6,
      name: "Alex Jordan Prescott Hawthorne",
      applied: "Technology",
      recommended: "Data Science",
      match: 45,
    },
    {
      id: 7,
      name: "Sam Riley Kingston Rodriguez",
      applied: "Design",
      recommended: "UX Research",
      match: 82,
    },
    {
      id: 8,
      name: "Casey Morgan Archer Northwood",
      applied: "Sales",
      recommended: "Customer Success",
      match: 70,
    },
    {
      id: 9,
      name: "Jordan Taylor Evans Westbrook",
      applied: "Engineering",
      recommended: "Product Strategy",
      match: 55,
    },
  ];

  // Filter candidates based on search term
  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="bg-white rounded-[32px] shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Candidate Fallout</h2>
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
            className="rounded-lg bg-purple-600 text-white p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-xl">{candidate.name}</div>
              <div className="text-xs">Applied for: {candidate.applied}</div>
            </div>
            <div className="text-left flex items-center p-2 bg-[#E328AF] rounded-lg">
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

export default CandidateFallouts;
