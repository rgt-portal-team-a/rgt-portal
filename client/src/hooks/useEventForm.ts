import { useState } from "react";
import { FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast } from "@/hooks/use-toast";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { useAllEmployees } from "@/api/query-hooks/employee.hooks";
import { useCreateEvent } from "@/api/query-hooks/event.hooks";
import { useCreateMultipleRecognitions, useCreateSingleRecognition } from "@/api/query-hooks/recognition.hooks";
import { Employee } from "@/types/employee";
import { Event, CreateEventDto } from "@/types/events";
import { User } from "@/types/authUser";
import { CreateRecognitionDto, EmployeeRecognition } from "@/types/recognition";
import { getApiErrorMessage } from "@/api/errorHandler";
import { EventType } from "@/constants";
import { useAllProjects } from "@/api/query-hooks/project.hooks";


interface CreateEventResult { success: boolean; response: Event | null; error: Error | null  }
interface CreateRecognitionResult {
  success: boolean;
  response: EmployeeRecognition | EmployeeRecognition[] | null;
  error: Error | null;
}

interface ISpecialEventTypes {
  id: "1" | "2";
  label: string;
}

export const formTypes = [
  { id: '1', label: 'Special Event' },
  { id: '2', label: 'Anouncement' },
  { id: '3', label: 'Recognition' }
];

export const specialEventTypes: ISpecialEventTypes[] = [
  { id: '1', label: 'Holiday' },
  { id: '2', label: 'Birthday' },
];


export type FormValues = 
  | SpecialEventFormValues 
  | AnnouncementFormValues 
  | RecognitionFormValues;

// Specific interfaces for each form type
interface SpecialEventFormValues {
  formType: '1';
  eventType: string;
  holidayName?: string;
  employeeId?: string;
  date: Date;
}

interface AnnouncementFormValues {
  formType: '2';
  title: string;
  description: string;
  date: Date;
}

interface RecognitionFormValues {
  formType: '3';
  title: string;
  recognitionList: {
    employeeId: string;
    projectName: string;
  }[];
}

export const useEventForm = (initialFormType = "1") => {
  const { currentUser } = useAuthContextProvider();
  const [selectedFormType, setSelectedFormType] = useState(initialFormType);
  const [selectedSpecialEventType, setSelectedSpecialEventType] = useState<"1" | "2">('1');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const { data: users = [] } = useAllEmployees({}, { enabled: true });
  const {
        data,
    } = useAllProjects(
        {},
        {}
    );
  const projects = data?.data || [];

  const createEventMutation = useCreateEvent();
  const multiRecognitionMutation = useCreateMultipleRecognitions();
  const singleRecognitionMutation = useCreateSingleRecognition();


    const getEventInitialValues = () => {
        switch (selectedSpecialEventType) {
        case "1":
            return {
            eventType: specialEventTypes[0].label, 
            holidayName: "",
            date: new Date()
            };
        case "2":
            return {
            eventType: specialEventTypes[1].label, 
            employeeId: "",
            date: new Date()
            };
        default:
            return {
            eventType: specialEventTypes[0].label,
            employeeId: "",
            date: new Date()
            };
        }
    };

    const getInitialValues = (formType: string): FormValues => {
        switch (formType) {
        case '1':
            return {
            formType: '1',
            ...getEventInitialValues(),
            };
        case '2':
            return {
            formType: '2',
            title: "",
            description: "",
            date: new Date(),
            };
        case '3':
            return {
            formType: '3',
            title: '',
            recognitionList: [
                {
                employeeId: "",
                projectName: ""
                }
            ]
            };
        default:
            return {
            formType: '1',
            ...getEventInitialValues(),
            };
        }
    };

    const getEventValidationSchema = () => {
        switch (selectedSpecialEventType) {
            case "1":
            return Yup.object({
                eventType: Yup.string().required('Event type is required'),
                holidayName: Yup.string()
                .min(3, "A minimum of three characters is required")
                .max(100, "A max of 100 characters is required")
                .required('Holiday name is required'),
                date: Yup.date().required('Date of holiday is required'),
            });
            case "2":
            return Yup.object({
                eventType: Yup.string().required('Event type is required'),
                employeeId: Yup.string().required('Employee name is required'),
                date: Yup.date().required('Date of event is required'),
            });
            default:
            return Yup.object({
                eventType: Yup.string().required('Event type is required'),
                employeeId: Yup.string().required('Employee name is required'),
                date: Yup.date().required('Date of event is required'),
            });
        }
    };

    const getValidationSchema = (formType: string) => {
        switch (formType) {
        case '1':
            return Yup.object({
            formType: Yup.string().required("Form Type is required"),
            ...getEventValidationSchema().fields
            });
        case '2':
            return Yup.object({
            formType: Yup.string().required(),
            title: Yup.string().required('Announcement name is required'),
            description: Yup.string()
                .min(3, "A minimum of three characters is required")
                .required('Description is required'),
            date: Yup.date().required('Date of event is required'),
            });
        case '3':
            return Yup.object({
            formType: Yup.string().required(),
            title: Yup.string().required('Recognition title is required'),
            recognitionList: Yup.array()
                .of(
                Yup.object().shape({
                    employeeId: Yup.string()
                    .trim()
                    .required('Employee name is required'),
                    projectName: Yup.string()
                    .trim()
                    .required('Project name is required')
                })
                )
                .min(1, 'At least one recognition list is required')
                .required('Recognition list is required') 
            });
        default:
            return Yup.object({});
        }
    };

    // Transform form values to CreateEventDto
    const transformFormValuesToEventDto = (
    values: FormValues, 
    currentUser: User | null, 
    users: Employee[])
    : CreateEventDto|CreateRecognitionDto|CreateRecognitionDto[] => {

        const getCurrentUserId = (): number => {
        if (!currentUser) {
            throw new Error('No authenticated user found');
        }
        
        const user = users.find(u => u.user?.id === currentUser.id);
        if (!user) {
            throw new Error('Current user not found in user list');
        }
        
        return user.id;
        };

        // Validate project and employee IDs
        const validateNumericId = (id: string | number | undefined, fieldName: string): number => {
        if (id === undefined || id === null) {
            throw new Error(`${fieldName} is required`);
        }
        
        const numericId = Number(id);
        if (isNaN(numericId) || numericId <= 0) {
            throw new Error(`Invalid ${fieldName}`);
        }
        
        return numericId;
        };


    switch (values.formType) {
        case '1': {
        // Special Event (Holiday or Birthday)
        const specialEvent = values as SpecialEventFormValues;
        const startOfDay = new Date(specialEvent.date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(specialEvent.date);
        endOfDay.setHours(23, 59, 59, 999);

        return {
            title: specialEvent.eventType === 'Holiday' 
            ? specialEvent.holidayName || 'Holiday Event' 
            : `${specialEvent.employeeId || 'Employee'} Birthday`,
            description: specialEvent.eventType,
            startTime: startOfDay,
            endTime: endOfDay,
            type: specialEvent.eventType === 'Holiday' 
            ? EventType.HOLIDAY 
            : EventType.BIRTHDAY,
                
        };
        }
        case '2': {
        // Announcement
        const announcement = values as AnnouncementFormValues;
        const startOfDay = new Date(announcement.date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(announcement.date);
        endOfDay.setHours(23, 59, 59, 999);
        return {
            title: announcement.title,
            description: announcement.description,
            startTime: startOfDay,
            endTime: endOfDay,
            type: EventType.ANNOUNCEMENT,
        };
        }
        case '3': {
        // Recognition
        const recognition = values as RecognitionFormValues;
        
        
        if (!recognition.title || recognition.title.trim() === '') {
            throw new Error('Recognition message is required');
        }
        
        if (!recognition.recognitionList || recognition.recognitionList.length === 0) {
            throw new Error('No recognition details provided');
        }
        
        console.log("Recognition Title", recognition.title, "Recognition", recognition)
        
        const currentUserId = getCurrentUserId();
        console.log("CurrentUserId", currentUserId)
        
        const recognitionDtos: CreateRecognitionDto[] = recognition.recognitionList.map(item => {
            const employeeId = validateNumericId(item.employeeId, 'Employee ID');
            
            return {
            message: recognition.title,
            project: item.projectName,
            recognizedById: currentUserId,
            recognizedEmployeeId: employeeId,
            };
        });
        
        console.log("Recognition", recognitionDtos);
        return recognitionDtos.length === 1 ? recognitionDtos[0] : recognitionDtos;
        }
        default:
        throw new Error('Invalid form type');
    }
    };

    const createEvent = async (data: CreateEventDto): Promise<CreateEventResult> => {
        try {
        console.log("Calling Create event Submit", data)
        
        const response = await createEventMutation.mutateAsync({ data: data });
        console.log("Logging Create event response", response)

            if (!response.success) {
            return { 
                success: false,
                response: null, 
                error: new Error(response.message || 'An unknown error occurred') 
            };
            }

            return { 
            success: true,
            response: response.data!, 
            error: null 
            };
        } catch (error) {
            return { 
            success: false,
            response: null, 
            error: getApiErrorMessage(error) 
            };
        }
    }

    const createRecognition = async (
        data: CreateRecognitionDto | CreateRecognitionDto[]
    ): Promise<CreateRecognitionResult> => {
        try {
          console.log("Creating Recognition(s):", data);
    
          let response: EmployeeRecognition | EmployeeRecognition[];
          
          if (Array.isArray(data)) {
            if (data.length === 0) {
              throw new Error('No recognition details provided for creating recognition');
            }
    
            response = await multiRecognitionMutation.mutateAsync({ data });
          } else {
    
            response = await singleRecognitionMutation.mutateAsync({ data });
          }
    
    
          return {
            success: true,
            response: response!,
            error: null
          };
    
        } catch (error) {
          console.error('Recognition Creation Error:', error);
    
          return {
            success: false,
            response: null,
            error: getApiErrorMessage(error)
          };
        }
    };

    const handleSubmit = async (
        values: FormValues, 
        { 
        setSubmitting, 
        setErrors, 
        resetForm 
        }: FormikHelpers<FormValues>,
    ) => {
        try {
        setSubmitting(true);
        console.log("Before Submiting", values);
        
        
        const transformedData = transformFormValuesToEventDto(      
            values, 
            currentUser, 
            users
        );
        
        console.log("After Transforming", transformedData);

        let result;


        if (values.formType === '3') {
            console.log("About to create recognition");
            result = await createRecognition(transformedData as CreateRecognitionDto|CreateRecognitionDto[]);
        } else {
            result = await createEvent(transformedData as CreateEventDto);
        }

        if (!result.success) {
            throw result.error;
        }

        toast({
            title: "Success",
            description: `${values.formType === '3'? "Recognition":"Event"} created successfully`,
            variant: "default"
        });

        resetForm();
        // onClose();
        // setIsModalOpen(false);

        } catch (error) {
        if (error instanceof Yup.ValidationError) {
            const validationErrors: { [key: string]: string } = {};
            
            error.inner.forEach((err) => {
            if (err.path) {
                validationErrors[err.path] = err.message;
            }
            });
            
            setErrors(validationErrors);
        } 
        else {
            const errorMessage = getApiErrorMessage(error);
            
            toast({
            title: "Error",
            description: errorMessage.message,
            variant: "destructive"
            });
        }
        } finally {
        setSubmitting(false);
        setSelectedEmployee(null);
        }
    };

//   const formik = useFormik({
//     initialValues: getInitialValues(selectedFormType),
//     onSubmit: handleSubmit,
//   });
  const formik = {
    initialValues: getInitialValues(selectedFormType),
    onSubmit: handleSubmit,
  };

  return {
    formik,
    validationSchema: getValidationSchema(selectedFormType),
    isSubmitting: multiRecognitionMutation.isPending || singleRecognitionMutation.isPending || createEventMutation.isPending,
    getInitialValues,
    selectedFormType,
    setSelectedFormType,
    selectedSpecialEventType,
    setSelectedSpecialEventType,
    selectedEmployee,
    setSelectedEmployee,
    users,
    projects
  };
};