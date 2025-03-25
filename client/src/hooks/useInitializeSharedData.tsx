import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useDepartments } from '@/api/query-hooks/department.hooks';
import { useAllEmployees } from '@/api/query-hooks/employee.hooks';
import { setDepartments, setEmployees } from '@/state/sharedDataState/sharedDataSlice';
import { toast } from './use-toast';


export const useInitializeSharedData = () => {
  const dispatch = useDispatch();

  // Departments fetch
  const { 
    data: departments, 
    isLoading: isDepartmentsLoading, 
    isError: isDepartmentsError,
    error: departmentsError,
    refetch: refetchDepartments
  } = useDepartments({includeEmployees: true});

  // Employees fetch
  const { 
    data: employees, 
    isLoading: isEmployeesLoading, 
    isError: isEmployeesError,
    error: employeesError,
    refetch: refetchEmployees
  } = useAllEmployees({},{});

  useEffect(() => {

    // Handle Departments Or Employees Error
    if (isDepartmentsError && departmentsError) {
        console.log("Unable to load departments..", departmentsError)
        toast({
            title: "Error",
            description: "Unable to load Departments",
            variant: "destructive",
        });
    }
    if (isEmployeesError && employeesError) {
        console.log("Unable to load employees..", employeesError)
        toast({
            title: "Error",
            description: "Unable to load Employees",
            variant: "destructive",
        });
    }

    // Initialize shared data
    if (departments) {
      console.log("Loaded departments..", departments)
      dispatch(setDepartments(departments.data));
    }
    if (employees) {
      console.log("Loaded employees..", employees)
      dispatch(setEmployees(employees));
    }

  }, [departments, employees, dispatch]);

  return {
    isDepartmentsLoading,
    isDepartmentsError,
    refetchDepartments,
    departmentsError,
    isEmployeesLoading,
    isEmployeesError,
    refetchEmployees,
    employeesError,
    
  };
};
