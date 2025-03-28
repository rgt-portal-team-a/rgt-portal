import React, { useMemo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import UserIcon from "@/assets/icons/UserIcon";
import { get } from "lodash";
import { EmployeePopoverProps } from "../types";

export const EmployeePopover = React.memo(
  ({
    field,
    form,
    users,
    index = 0,
    filterDuplicates = false,
    isOpen,
    onOpenChange,
  }: EmployeePopoverProps) => {
    const filteredUsers = useMemo(
      () =>
        filterDuplicates
          ? users.filter(
              (employee) =>
                !form.values.recognitionList?.some(
                  (item: any) => item.employeeId === employee.id
                )
            )
          : users,
      [users, filterDuplicates, form.values.recognitionList]
    );

    const currentEmployee = useMemo(() => {
      const currentEmployeeId = get(form.values, field.name);
      return users.find((u) => u.id === currentEmployeeId) || null;
    }, [form.values, field.name, users]);

    return (
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left text-gray-500 font-normal py-6 px-4 shadow-none bg-gray-100 ${
              form.touched[field.name] && form.errors[field.name]
                ? "border-red-500"
                : ""
            }`}
          >
            {currentEmployee
              ? `${currentEmployee.firstName} ${currentEmployee.lastName}`
              : "Select Employee"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[370px] p-0 z-[2020]" align="start">
          <Command>
            <CommandInput placeholder="Search employees..." />
            <CommandList>
              <CommandEmpty>No employees found.</CommandEmpty>
              <CommandGroup>
                {filteredUsers.map((employee) => (
                  <CommandItem
                    key={employee.id}
                    value={`${employee.firstName} ${employee.lastName}`}
                    onSelect={() => {
                      form.setFieldValue(field.name, employee.id.toString());
                    //   toggleEmployeePopover(index, false);
                      onOpenChange(false);
                    }}
                  >
                    <div className="flex justify-between w-full py-[13px]">
                      <div className="flex gap-2 items-center">
                        <UserIcon />
                        <span>
                          {employee.firstName} {employee.lastName}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {employee.department?.name || "No Department"}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
EmployeePopover.displayName = "EmployeePopover";
