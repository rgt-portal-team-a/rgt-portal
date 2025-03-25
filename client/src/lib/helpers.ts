import { Employee } from "@/types/employee";

export const getAvatarFallback = (employee: Employee | string) => {
  if (typeof employee === "string") {
    return employee?.slice(0, 2).toUpperCase();
  }
  return `${employee?.firstName?.slice(0, 1).toUpperCase()}${employee?.lastName
    ?.slice(0, 1)
    .toUpperCase()}`;
};
