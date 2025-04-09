import React, { useMemo, useState } from "react";
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
import { FieldProps } from "formik";
import { Employee } from "@/types/employee";
import { Trash2Icon, UserIcon } from "lucide-react"; 

interface EmployeeSelectorProps {
  field: FieldProps["field"];
  form: FieldProps["form"];
  meta: FieldProps["meta"];
  users: Employee[];
  placeholder?: string;
  showRemoveButton?: boolean;
  onRemove?: () => void;
  filterFn?: (user: Employee) => boolean;
  showEmail?: boolean;
  className?: string;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  field,
  form,
  meta,
  users,
  placeholder = "Select an employee",
  showRemoveButton = false,
  onRemove,
  filterFn,
  showEmail = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return filterFn ? users.filter(filterFn) : users;
  }, [users, filterFn]);

  const selectedUser = useMemo(() => {
    return users?.find((user) => user.id.toString() === field.value);
  }, [users, field.value]);

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <div className={`flex-1 ${className}`}>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal py-6 px-4 bg-gray-100 ${
                  meta.touched && meta.error ? "border-red-500" : ""
                }`}
              >
                {selectedUser ? (
                  <span className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                ) : (
                  placeholder
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[370px] p-0 z-[2020]" align="start">
              <Command>
                <CommandInput placeholder="Search by name or email..." />
                <CommandList>
                  <CommandEmpty>No employees found.</CommandEmpty>
                  <CommandGroup>
                    {filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={`${user.firstName} ${user.lastName} ${
                            user.user?.email || ""
                          }`}
                          onSelect={() => {
                            form.setFieldValue(field.name, user.id.toString());
                            setIsOpen(false);
                          }}
                        >
                          <div className="flex justify-between w-full py-2">
                            <div className="flex gap-2 items-center">
                              <UserIcon className="h-4 w-4" />
                              <span>
                                {user.firstName} {user.lastName}
                              </span>
                            </div>
                            {showEmail && user.user?.email && (
                              <span className="text-muted-foreground text-sm">
                                {user.user?.email}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))
                    ) : (
                      <CommandItem value="no-employees" disabled>
                        No employees available
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {meta.touched && meta.error && (
            <div className="text-red-500 text-sm mt-1">{meta.error}</div>
          )}
        </div>
        {showRemoveButton && onRemove && (
          <Button
            type="button"
            className="py-6 border-red-400 bg-white text-red-400 hover:bg-red-300 hover:text-gray-800"
            variant="outline"
            onClick={onRemove}
            size="sm"
          >
            <Trash2Icon />
          </Button>
        )}
      </div>
    </div>
  );
};
