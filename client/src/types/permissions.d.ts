import { Employee } from "@/types/employee";

export type PermissionResource = {
  ptoRequests: "create" | "view" | "approve";
  employeeRecords: "view" | "edit" | "delete";
  events: "create" | "edit" | "rsvp";
};

type Event = {
  id: string;
  // other fields...
};

export type Permissions = {
  ptoRequests: {
    dataType: PTORequest;
    action: "create" | "view" | "approve";
  };
  employeeRecords: {
    dataType: Employee;
    action: "view" | "edit" | "delete";
  };
  events: {
    dataType: Event;
    action: "create" | "edit" | "rsvp";
  };
};

export type PermissionCheck<T> = (user: User, data?: T) => boolean;

export type RolesWithPermissions = {
  [R in ROLE]: {
    [K in keyof Permissions]?: {
      [A in Permissions[K]["action"]]?:
        | boolean
        | PermissionCheck<Permissions[K]["dataType"]>;
    };
  } & {
    $all?: boolean;
  };
};
