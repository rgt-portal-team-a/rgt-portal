import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define interface for candidate data
interface CandidateData {
  name: string;
  position: string;
  score: number;
  predicted_stage: string;
  stage_confidences: {
    stage: string;
    confidence: number;
  }[];
}

export const HirePower: React.FC = () => {
  // Dummy data array to simulate pagination
  const dummyCandidateData: CandidateData[] = [
    {
      name: "Jordan Davis Carter Acheampong",
      position: "DevOps",
      score: 62.308719635009766,
      predicted_stage: "1st interview",
      stage_confidences: [
        {
          stage: "1st interview",
          confidence: 0.5143076777458191,
        },
        {
          stage: "Technical interview",
          confidence: 0.10389640182256699,
        },
        {
          stage: "Final interview",
          confidence: 0.0004735132970381528,
        },
        {
          stage: "Offer",
          confidence: 0.0002894234494306147,
        },
        {
          stage: "Hired",
          confidence: 0.38103294372558594,
        },
      ],
    },
    {
      name: "Emily Rodriguez Smith",
      position: "Frontend Developer",
      score: 75.5,
      predicted_stage: "Technical interview",
      stage_confidences: [
        {
          stage: "1st interview",
          confidence: 0.3,
        },
        {
          stage: "Technical interview",
          confidence: 0.6,
        },
        {
          stage: "Final interview",
          confidence: 0.05,
        },
        {
          stage: "Offer",
          confidence: 0.02,
        },
        {
          stage: "Hired",
          confidence: 0.03,
        },
      ],
    },
    {
      name: "Emily Rodriguez Smith",
      position: "Frontend Developer",
      score: 75.5,
      predicted_stage: "Technical interview",
      stage_confidences: [
        {
          stage: "1st interview",
          confidence: 0.3,
        },
        {
          stage: "Technical interview",
          confidence: 0.6,
        },
        {
          stage: "Final interview",
          confidence: 0.05,
        },
        {
          stage: "Offer",
          confidence: 0.02,
        },
        {
          stage: "Hired",
          confidence: 0.03,
        },
      ],
    },
    {
      name: "Michael Chen Wong",
      position: "Data Scientist",
      score: 88.2,
      predicted_stage: "Final interview",
      stage_confidences: [
        {
          stage: "1st interview",
          confidence: 0.2,
        },
        {
          stage: "Technical interview",
          confidence: 0.3,
        },
        {
          stage: "Final interview",
          confidence: 0.4,
        },
        {
          stage: "Offer",
          confidence: 0.05,
        },
        {
          stage: "Hired",
          confidence: 0.05,
        },
      ],
    },
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  // Calculate total pages
  const totalPages = Math.ceil(dummyCandidateData.length / itemsPerPage);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = currentPage * itemsPerPage;
    return dummyCandidateData.slice(startIndex, startIndex + itemsPerPage);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      prevPage < totalPages - 1 ? prevPage + 1 : prevPage
    );
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => (prevPage > 0 ? prevPage - 1 : prevPage));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Hire Power: Predicting Workforce Success
        </h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 rounded-full"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 rounded-full bg-purple-100"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {getCurrentPageData().map((candidate, index) => (
          <Card key={index} className="bg-[#6418C3] text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{candidate.name}</CardTitle>
              <div className="text-xs">Applied for: {candidate.position}</div>
              <div className="text-xs">
                Predicted Stage: {candidate.predicted_stage}
              </div>
              <div className="text-xs">Score: {candidate.score.toFixed(2)}</div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {candidate.stage_confidences.map((stage, stageIndex) => (
                  <div
                    key={stageIndex}
                    className="flex items-center justify-between"
                  >
                    <div className="text-xs">{stage.stage}</div>
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs 
                        ${
                          stage.stage === candidate.predicted_stage
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                    >
                      {(stage.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HirePower;
