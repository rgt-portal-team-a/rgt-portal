import { RecruitmentType } from "@/lib/enums";

interface Recruitment {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  date: string;
  type: string;
  currentStatus: string;
  statusDueDate?: string;
  failStage?: string;
  failReason?: string;
  source?: string;
  location?: string;
  position?: string;
  university?: string;
  firstPriority?: string;
  secondPriority?: string;
  cvPath?: string;
  photoUrl?: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  accept?: string;
  gridColumn?: "full" | "half";
}

interface RecruitmentFormValues {
  [key: string]: any;
}

interface CreateRecruitmentProps {
  isOpen: boolean;
  type: RecruitmentType;
  onOpenChange: (isOpen: boolean) => void;
  title?: string;
  fields?: FormField[];
  onSubmit?: (values: RecruitmentFormValues) => void;
}
