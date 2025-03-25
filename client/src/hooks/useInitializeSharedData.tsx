import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useDepartments } from '@/api/query-hooks/department.hooks';
import { setDepartments } from '@/state/sharedDataState/sharedDataSlice';
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

  useEffect(() => {

    // Handle Departments Error
    if (isDepartmentsError && departmentsError) {
        console.log("Unable to load departments..", departmentsError)
        toast({
            title: "Error",
            description: "Unable to load Departments",
            variant: "destructive",
        });
    }

    // Initialize shared data
    if (departments) {
      console.log("Loaded departments..", departments)
      dispatch(setDepartments(departments.data));
    }

  }, [departments, dispatch]);

  return {
    isDepartmentsLoading,
    isDepartmentsError,
    refetchDepartments,
    departmentsError
  };
};
