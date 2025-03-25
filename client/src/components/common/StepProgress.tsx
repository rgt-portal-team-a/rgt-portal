import { ChevronLeft, ChevronRight } from "lucide-react";


export interface StepProgressProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}


const StepProgress: React.FC<StepProgressProps> = ({ 
  currentPage, 
  setCurrentPage, 
  totalPages 
}) => {
  const handleNext = (): void => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = (): void => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Function to generate step numbers with ellipses
  const getDisplayedSteps = (): (number | string)[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  return (
    <div className="flex items-center justify-center  p-4">
      {/* Left Arrow */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="rounded-md text-purple-500 font-bold cursor-pointer"
      >
        <ChevronLeft className={currentPage === 1 ? "text-gray-300" : ""} />
      </button>

      {/* Step Indicators */}
      <div className="flex items-center">
        {getDisplayedSteps().map((step, index) => (
          <div key={index} className="flex items-center">
            {step === "..." ? (
              <span className="text-gray-500 ">...</span>
            ) : (
              <button
                onClick={() => setCurrentPage(step as number)}
                className={`w-6 h-6 flex text-sm items-center justify-center rounded-md transition-all ${
                  currentPage === step
                    ? "bg-purple-500 text-white font-bold"
                    : "text-gray-700"
                }`}
              >
                {step}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="text-purple-500 font-bold cursor-pointer"
      >
        <ChevronRight className={currentPage === totalPages ? "text-gray-300" : ""} />
      </button>
    </div>
  );
};

export default StepProgress;
