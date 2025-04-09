/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IEventList } from "./components/EventList";
import { IAnnouncementCard, EmployeeCardType } from "./types/employee";
import { Project } from "./types/project";
import { Column } from "./types/tables";

export enum ParticipantStatus {
  INVITED = "invited",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  MAYBE = "maybe",
}
export enum EventType {
  BIRTHDAY = "birthday",
  HOLIDAY = "holiday",
  ANNOUNCEMENT = "announcement",
  TRAINING = "training",
  OTHER = "other",
}

// export const avtrDets: Partial<IDepartmentMembers>[] = [
//   {
//     name: "Annette Black",
//     role: "President Of Americas",
//     avtr: {
//       url: "https://randomuser.me/api/portraits/med/women/75.jpg",
//       fallBack: "AB",
//     },
//   },
//   {
//     name: "Annette Black",
//     role: "President Of Americas",
//     avtr: {
//       url: "https://randomuser.me/api/portraits/med/women/75.jpg",
//       fallBack: "AB",
//     },
//   },
//   {
//     name: "Annette Black",
//     role: "President Of Americas",
//     avtr: {
//       url: "https://randomuser.me/api/portraits/med/women/75.jpg",
//       fallBack: "AB",
//     },
//   },
//   {
//     name: "Annette Black",
//     role: "President Of Americas",
//     avtr: {
//       url: "https://randomuser.me/api/portraits/med/women/75.jpg",
//       fallBack: "AB",
//     },
//   },
//   {
//     name: "Annette Black",
//     role: "President Of Americas",
//     avtr: {
//       url: "https://randomuser.me/api/portraits/med/women/75.jpg",
//       fallBack: "AB",
//     },
//   },
// ];

export const postText1 =
  "Lorem ipsum dolor sit amet, #consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh. Etiam non elit dui. Nulla nec purus feugiat, molestie #ipsum et, consequat nibh. Etiam non #elit dui.";

export const postText2 =
  "Which drink do you think is the better summer drink, and why? #quickquestion #plsanswer";

export const imageUrl = {
  url: "https://images.unsplash.com/photo-1517825738774-7de9363ef735?q=80&w=1110&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  alt: "A beautiful image",
};
export const poll = [
  {
    pollOption: "Lemonade",
    percentage: 60,
    totalVotes: 6000,
  },
  {
    pollOption: "Ginger",
    percentage: 10,
    totalVotes: 5500,
  },
  {
    pollOption: "Baking Soda",
    percentage: 4,
    totalVotes: 4587,
  },
  {
    pollOption: "Corn Syrup",
    percentage: 1,
    totalVotes: 4587,
  },
  {
    pollOption: "Energy Drink",
    percentage: 25,
    totalVotes: 1418,
  },
];

// export const eventList: IEventList[] = [
//   {
    
//     event: "holiday",
//     date: "Mar 06, 2025",
//     title: "Independence Day",
//   },
//   {
//     event: "meeting",
//     date: "Apr 25, 2025",
//     title: "Group Meetup",
//   },
//   {
//     event: "birthday",
//     date: "Jun 25, 2025",
//     title: "Fatimah's Birthday",
//   },
// ];

export interface IEvent {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  type: "exam" | "meeting" | "evaluation" | "holiday" | "birthday";
  color?: string;
}

export interface IAnnouncementItem {
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  description?: string;
}

export const events: IEvent[] = [
  {
    id: "1",
    title: "Graphic Design Exam",
    date: new Date(2025, 0, 2), // January 2, 2025
    startTime: "08:00",
    endTime: "10:00",
    type: "exam",
  },
  {
    id: "2",
    title: "Meeting with Candidate",
    date: new Date(2025, 0, 11), // January 11, 2025
    startTime: "08:00",
    endTime: "10:00",
    type: "meeting",
  },
  {
    id: "3",
    title: "Evaluate",
    date: new Date(2025, 0, 15), // January 15, 2025
    startTime: "08:00",
    endTime: "10:00",
    type: "evaluation",
  },
  {
    id: "4",
    title: "Web Design Exam",
    date: new Date(2025, 0, 25), // January 25, 2025
    startTime: "08:00",
    endTime: "10:00",
    type: "exam",
  },
];

// Sample announcements
export const hrannouncements: IAnnouncementItem[] = [
  {
    title: "Independence Day",
    date: new Date(2025, 2, 6), // March 6, 2025
    description: "National holiday",
  },
  {
    title: "Group Meetup",
    date: new Date(2025, 3, 25), // April 25, 2025
    startTime: "14:00",
    endTime: "16:00",
  },
  {
    title: "Fatimah's Birthday",
    date: new Date(2025, 5, 25), // June 25, 2025
  },
];

// export const announcements: IAnnouncementCard[] = [
//   {
//     title: "RGT University",
//     date: new Date(),
//   },
//   {
//     title: "New Policy Update",
//     date: new Date(),
//   },
//   {
//     title: "RGT University",
//     date: new Date(),
//   },
//   {
//     title: "New Policy Update",
//     date: new Date(),
//   },
//   {
//     title: "RGT University",
//     date: new Date(),
//   },
//   {
//     title: "New Policy Update",
//     date: new Date(),
//   },
// ];

const imgSrc = "https://randomuser.me/api/portraits/med/women/75.jpg";

export const employeeCards: EmployeeCardType[] = [
  {
    id: "1",
    name: "Samantha William",
    position: "Web Developer",
    phone: "+12 345 6789 0",
    email: "email@mail.com",
    imgSrc: imgSrc,
  },
  {
    id: "2",
    name: "Johanna",
    position: "UI Designer",
    phone: "+12 345 6789 0",
    email: "email@mail.com",
    imgSrc: imgSrc,
  },
  {
    id: "3",
    name: "Frans Ferdinand",
    position: "Translator",
    phone: "+12 345 6789 0",
    email: "email@mail.com",
    imgSrc: imgSrc,
  },
  {
    id: "4",
    name: "Michael Black",
    position: "English Teacher",
    phone: "+12 345 6789 0",
    email: "email@mail.com",
    imgSrc: imgSrc,
  },
  {
    id: "5",
    name: "Jordy Ahmad",
    position: "Web Developer",
    phone: "+12 345 6789 0",
    email: "email@mail.com",
    imgSrc: imgSrc,
  },
  {
    id: "6",
    name: "Kimmy Yam",
    position: "Web Developer",
    phone: "+12 345 6789 0",
    email: "email@mail.com",
    imgSrc: imgSrc,
  },
];

export const timeOffTableColumns: Column[] = [
  { key: "total", header: "Total" },
  { key: "reason", header: "Reason" },
  {
    key: "status",
    header: "Status",
    cellClassName: (row: Record<string, any>) => {
      const status = row.status.toLowerCase();
      return `py-3 text-center w-[150px] lg:w-full truncate ${
        status === "pending"
          ? "font-semibold text-[#F9B500] bg-[#FFF7D8] rounded-md"
          : status.includes("approved")
          ? "font-semibold text-[#7ABB9E] bg-[#E5F6EF] rounded-md "
          : status.includes("declined")
          ? "font-semibold text-[#D92D20] bg-[#FEE4E2] rounded-md "
          : ""
      }`;
    },
  },
  {
    key: "type",
    header: "Type",
    cellClassName: (row: Record<string, any>) => {
      const type = row.type.toLowerCase();
      return `py-3 text-center  w-[150px] lg:w-full ${
        type === "vacation"
          ? "font-semibold text-[#6418C3] bg-[#C9ADFF] rounded-md"
          : type === "sick"
          ? "font-semibold text-[#F9B500] bg-[#FFF7D8] rounded-md"
          : ""
      }`;
    },
  },
];

export interface timeOffData {
  id?: number;
  employeeName: string;
  email: string;
  from: string;
  to: string;
  total: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export const timeOffManagementData: timeOffData[] = [
  {
    id: 1,
    employeeName: "Erdil Beckman",
    email: "erdil.beckman@example.com",
    from: "01 Mar 2023",
    to: "03 Mar 2023",
    total: "3 Days",
    reason: "Engagement",
    status: "pending",
  },
  {
    id: 2,
    employeeName: "Ben Barker",
    email: "ben.barker@example.com",
    from: "01 Mar 2023",
    to: "02 Mar 2023",
    total: "1 Day",
    reason: "Unwell",
    status: "pending",
  },
  {
    id: 3,
    employeeName: "Eddy Goell",
    email: "eddy.goell@example.com",
    from: "01 Mar 2023",
    to: "04 Mar 2023",
    total: "4 Days",
    reason: "Emergency",
    status: "pending",
  },
  {
    id: 4,
    employeeName: "Carmelo Keen",
    email: "carmelo.keen@example.com",
    from: "01 Mar 2023",
    to: "04 Mar 2023",
    total: "1 Day",
    reason: "Emergency",
    status: "pending",
  },
  {
    id: 5,
    employeeName: "Anthony Daily",
    email: "anthony.daily@example.com",
    from: "01 Mar 2023",
    to: "04 Mar 2023",
    total: "4 Days",
    reason: "Emergency",
    status: "pending",
  },
];

export const dummyProjects: Project[] = [
  {
    id: 1,
    leadId: 1,
    name: "Project Alpha",
    description: "Development of new AI platform",
    startDate: new Date("2023-01-01"),
    endDate: new Date("2023-12-31"),
    status: "In Progress",
    lead: {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      // ... other employee fields
    },
    assignments: [],
  },
  {
    id: 2,
    leadId: 2,
    name: "Project Beta",
    description: "Mobile app development",
    startDate: new Date("2023-03-15"),
    endDate: new Date("2023-09-30"),
    status: "Planning",
    lead: {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      // ... other employee fields
    },
    assignments: [],
  },
  {
    id: 3,
    leadId: 3,
    name: "Project Gamma",
    description: "Cloud infrastructure upgrade",
    startDate: new Date("2023-05-01"),
    endDate: new Date("2023-11-30"),
    status: "Completed",
    lead: {
      id: 3,
      firstName: "Michael",
      lastName: "Johnson",
      // ... other employee fields
    },
    assignments: [],
  },
];


export const EMPLOYEE_TYPES = {
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  CONTRACTOR: "contractor",
  NSP: "nsp",
} as const;

export const WORK_TYPES = {
  HYBRID: "hybrid",
  REMOTE: "remote",
} as const;

export const LEAVE_TYPES = {
  QUIT: "quit",
  LAYOFF: "layoff",
  DISMISSED: "dismissed",
  OTHER: "other",
} as const;

export const ROLE_TYPES = {
  EMPLOYEE: "1",
  HR: "2",
  MANAGER: "3",
  ADMIN: "4",
  MARKETER: "5",
} as const;

export const LeaveType = {
  QUIT: "quit",
  LAYOFF: "layoff",
  DISMISSED: "dismissed",
  OTHER: "other",
} as const;

export const PTOSTATUS_TYPES = {
  PENDING: "pending",
  HR_APPROVED: "approved",
  HR_DECLINED: "declined",
  MANAGER_APPROVED: "manager_approved",
  MANAGER_DECLINED: "manager_declined",
} as const;

export const ALL_ROLE_NAMES = {
  HR: "hr",
  EMPLOYEE: "emp",
  MANAGER: "manager",
  ADMIN: "admin",
  MARKETER: "marketer",
} as const;