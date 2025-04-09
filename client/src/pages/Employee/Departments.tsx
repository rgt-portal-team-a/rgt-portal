import { useState, useEffect, useMemo } from "react";
import DepartmentCard from "@/components/DepartmentCard";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import _ from "lodash";
import { Search } from "lucide-react";
import StepProgress from "@/components/common/StepProgress";
import ErrorMessage from "@/components/common/ErrorMessage";
import { Department } from "@/types/department";
import AllDepartmentsSkeleton from "@/components/Hr/Employees/AllDepartmentsSkeleton";

const Departments = () => {
  const {
    departments,
    departmentsError,
    refetchDepartments,
    isDepartmentsLoading,
  } = useDepartmentsData();
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(
    []
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of departments to show per page

  // Create a debounced function that will update the actual search term
  const debouncedSearch = useMemo(
    () => _.debounce((value) => setSearchTerm(value), 300),
    []
  );

  // Handle input change and trigger debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Cancel debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Filter departments whenever the search term changes
  useEffect(() => {
    if (!departments) {
      setFilteredDepartments([]);
      return;
    }

    if (searchTerm.trim() === "") {
      setFilteredDepartments(departments);
      return;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = departments?.filter((department) => {
      // Check department name
      if (department.name.toLowerCase().includes(lowercasedSearch)) {
        return true;
      }

      // Check manager name
      if (
        department.manager &&
        (department.manager.firstName + " " + department.manager.lastName)
          .toLowerCase()
          .includes(lowercasedSearch)
      ) {
        return true;
      }

      // Check employee names
      const hasMatchingEmployee = department.employees.some((employee) =>
        (employee.firstName + " " + employee.lastName)
          .toLowerCase()
          .includes(lowercasedSearch)
      );

      return hasMatchingEmployee;
    });

    setFilteredDepartments(filtered);
  }, [searchTerm, departments]);

  // Calculate total pages
  const totalPages = Math.max(
    1,
    Math.ceil(filteredDepartments.length / itemsPerPage)
  );

  // Get current page items
  const currentItems = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page if current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (!departments && isDepartmentsLoading) {
    return <AllDepartmentsSkeleton />;
  }

  if (departmentsError) {
    return (
      <ErrorMessage
        title="Error Loading Employee Data"
        error={departmentsError}
        refetchFn={refetchDepartments}
      />
    );
  }

  return (
    <main className="pb-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6">
        <header className="text-[#706D8A] font-semibold text-xl">
          All Departments
        </header>

        {/* Search Bar */}
        <div className="relative w-full px-2 md:max-w-md">
          <input
            type="text"
            placeholder="Search departments, managers or employees..."
            value={inputValue}
            onChange={handleSearchChange}
            className="w-full py-2 px-4 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rgtpurple focus:border-transparent"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <section
        className="flex flex-wrap gap-4  justify-center sm:justify-start  overflow-scroll  w-full"
        style={{ scrollbarWidth: "none" }}
      >
        {currentItems.length > 0 ? (
          currentItems.map((item, index) => (
            <DepartmentCard
              employees={item.employees}
              manager={item.manager}
              path={`${item.id}`}
              id={item.id}
              name={item.name}
              key={index}
            />
          ))
        ) : (
          <div className="w-full bg-slate-200 flex items-center justify-center h-96 text-rgtpurple font-semibold">
            <p>
              {departments?.length === 0
                ? "No departments available"
                : "No departments match your search"}
            </p>
          </div>
        )}
      </section>

      {/* Only show pagination if we have more than one page */}
      {totalPages > 1 && (
        <section className="mt-8 flex justify-center items-center">
          <StepProgress
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </section>
      )}
    </main>
  );
};

export default Departments;
