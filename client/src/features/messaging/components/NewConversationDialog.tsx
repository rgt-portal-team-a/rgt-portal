/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useCreateConversation } from '@/api/query-hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogFooter } from '@/components/ui/dialog';
import toastService from '@/api/services/toast.service';
import { useAuthContextProvider } from '@/hooks/useAuthContextProvider';
import { useAllEmployees } from '@/api/query-hooks/employee.hooks';
import { Employee } from '@/types/employee';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const NewConversationDialog: React.FC = () => {
  const { currentUser } = useAuthContextProvider();
  const [tab, setTab] = useState<'private' | 'group'>('private');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [groupName, setGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const createConversation = useCreateConversation();
  
  // Fetch all employees for the select field
  const { data: employees = [], isLoading: isLoadingEmployees } = useAllEmployees();
  console.log("employees", employees);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (tab === 'private') {
        await createConversation.mutateAsync({
          type: 'private',
          participantIds: [parseInt(selectedRecipient), parseInt(currentUser?.id as unknown as string)]
        });
      } else {
        // For group conversations, include the current user as a participant
        const allParticipants = [...selectedParticipants];
        if (currentUser?.id && !allParticipants.includes(currentUser.id.toString())) {
          allParticipants.push(currentUser.id.toString());
        }
        
        await createConversation.mutateAsync({
          type: 'group',
          name: groupName,
          participantIds: allParticipants.map(id => parseInt(id))
        });
      }

      toastService.success('Conversation created successfully');

      // Close dialog (you might need to implement this through props)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: any) {
      toastService.error('Failed to create conversation');
    }
  };

  const handleParticipantToggle = (employeeId: string) => {
    setSelectedParticipants(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={tab} onValueChange={(value) => setTab(value as 'private' | 'group')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="private">Private Chat</TabsTrigger>
          <TabsTrigger value="group">Group Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="private" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Select Recipient</Label>
            <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
              <SelectTrigger id="recipient">
                <SelectValue placeholder="Select a recipient" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingEmployees ? (
                  <SelectItem value="loading" disabled>Loading employees...</SelectItem>
                ) : (
                  employees
                    .filter(employee => employee.user?.id !== currentUser?.id && employee.user?.id) // Filter out current user and employees without user IDs
                    .map((employee: Employee) => (
                      <SelectItem 
                        key={employee.user!.id} 
                        value={employee.user!.id.toString()}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={employee.user?.profileImage} />
                            <AvatarFallback>
                              {employee.firstName?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{employee.firstName} {employee.lastName}</span>
                        </div>
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="group" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <div className="space-y-2">
            <Label>Select Participants</Label>
            <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
              {isLoadingEmployees ? (
                <div className="p-2 text-sm text-muted-foreground">Loading employees...</div>
              ) : (
                <div className="space-y-2">
                  {employees
                    .filter(employee => employee.user?.id !== currentUser?.id && employee.user?.id) // Filter out current user and employees without user IDs
                    .map((employee: Employee) => (
                      <div key={employee.user!.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`participant-${employee.user!.id}`} 
                          checked={selectedParticipants.includes(employee.user!.id.toString())}
                          onCheckedChange={() => handleParticipantToggle(employee.user!.id.toString())}
                        />
                        <label 
                          htmlFor={`participant-${employee.user!.id}`}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={employee.user?.profileImage} />
                            <AvatarFallback>
                              {employee.firstName?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{employee.firstName} {employee.lastName}</span>
                        </label>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6">
        <Button
          type="submit"
          disabled={
            tab === 'private'
              ? !selectedRecipient
              : !groupName || selectedParticipants.length === 0
          }
        >
          Create Conversation
        </Button>
      </DialogFooter>
    </form>
  );
}; 