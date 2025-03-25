import { Employee } from "@/types/employee";

export const getAvatarFallback = (employee: Employee | string) => {
  if (typeof employee === "string") {
    return employee?.slice(0, 2).toUpperCase();
  }
  return `${employee?.firstName?.slice(0, 1).toUpperCase()}${employee?.lastName
    ?.slice(0, 1)
    .toUpperCase()}`;
};

export function formatDateToDaysAgo(dateString: string): string {
  // Parse the input date string into a Date object
  const date: Date = new Date(dateString);

  // Check if the date is invalid
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  // Get the current date and time
  const now: Date = new Date();

  // Calculate the difference in milliseconds
  const differenceInMs: number = now.getTime() - date.getTime();

  // Check if the date is in the future
  if (differenceInMs < 0) {
    return "Invalid date (future date)";
  }

  // Convert milliseconds to seconds, minutes, hours, and days
  const differenceInSeconds: number = Math.floor(differenceInMs / 1000);
  const differenceInMinutes: number = Math.floor(differenceInSeconds / 60);
  const differenceInHours: number = Math.floor(differenceInMinutes / 60);
  const differenceInDays: number = Math.floor(differenceInHours / 24);

  // Format the output based on the difference
  if (differenceInDays > 0) {
    return `${differenceInDays} day${differenceInDays > 1 ? "s" : ""} ago`;
  } else if (differenceInHours > 0) {
    return `${differenceInHours} hour${differenceInHours > 1 ? "s" : ""} ago`;
  } else if (differenceInMinutes > 0) {
    return `${differenceInMinutes} minute${
      differenceInMinutes > 1 ? "s" : ""
    } ago`;
  } else if (differenceInSeconds > 0) {
    return `${differenceInSeconds} second${
      differenceInSeconds > 1 ? "s" : ""
    } ago`;
  } else {
    return "just now";
  }
}
