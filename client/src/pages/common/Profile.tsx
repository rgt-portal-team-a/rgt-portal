import { useState } from "react";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/common/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationChannel, NotificationType } from "@/types/notifications";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { useNotificationPreferences } from "@/hooks/useNotificationPreference";
import { useUpdateUser } from "@/api/query-hooks/auth.hooks";
import toastService from "@/api/services/toast.service";
import { Badge } from "@/components/ui/badge";

export function ProfilePage() {
  const { currentUser: user } = useAuthContextProvider();
  const updateUserMutation = useUpdateUser();
  const { preferences, isLoading, updatePreference, isUpdating } =
    useNotificationPreferences();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    id: user?.employee.id || "",
    username: user?.username || 0,
    email: user?.email || "",
    profileImage: user?.profileImage || "",
    firstName: user?.employee?.firstName || "",
    lastName: user?.employee?.lastName || "",
    phone: user?.employee?.phone || "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditedUser((prev) => ({
          ...prev,
          profileImage: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await updateUserMutation.mutateAsync({
        id: Number(editedUser.id),
        username: String(editedUser.username),
        email: editedUser.email,
        profileImage: editedUser.profileImage,
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        phone: editedUser.phone,
      });
      setIsEditing(false);
      toastService.success("Updated your profile successfully!");
    } catch (error) {
      console.error("Failed to update user:", error);
      toastService.success("Failed to update profile");
    }
  };

  const handleChannelChange = (
    type: NotificationType,
    value: NotificationChannel,
    enabled: boolean
  ) => {
    if (!enabled) return;
    updatePreference({
      notificationType: type,
      channel: value,
      enabled,
      type,
    });
  };

  const handleToggle = (
    type: NotificationType,
    checked: boolean,
    currentChannel: NotificationChannel
  ) => {
    updatePreference({
      notificationType: type,
      channel: currentChannel,
      enabled: checked,
      type,
    });
  };

  if (isLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#706D8A] font-semibold text-xl">
          Profile Settings
        </h1>
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          {user.role.name.toUpperCase()}
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile" className="cursor-pointer">
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="cursor-pointer">
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="sm:max-h-[490px] mb-3 sm:mb-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Profile Information</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateUserMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateUserMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="bg-indigo-70 sm:h-[420px]">
              <div className=" flex flex-col gap-6 h-full overflow-auto">
                <div className="lg:col-span-1 flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={editedUser.profileImage} />
                    <AvatarFallback>
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <>
                      <label
                        htmlFor="profileImage"
                        className="cursor-pointer underline hover:text-rgtpurple transition-all duration-0 ease-in"
                      >
                        {/* <Button variant="outline" className="w-full"> */}
                        Change Photo
                        {/* </Button> */}
                        <input
                          id="profileImage"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap md:flex-nowrap gap-6 w-full">
                  <div className="space-y-4 w-full">
                    {/* <div className="space-y-1">
                      <Label>Employee ID</Label>
                      <div className="p-2 bg-muted rounded">{user.id}</div>
                    </div> */}
                    <div className="space-y-1">
                      <Label>Email</Label>
                      <div className="p-2 bg-muted rounded">{user.email}</div>
                    </div>
                    <div className="space-y-1">
                      <Label>Username</Label>
                      {isEditing ? (
                        <Input
                          value={editedUser.username}
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              username: e.target.value,
                            })
                          }
                          className="border"
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded">
                          {user.username}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 w-full ">
                    <div className="space-y-1">
                      <Label>First Name</Label>
                      {isEditing ? (
                        <Input
                          value={editedUser.firstName}
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              firstName: e.target.value,
                            })
                          }
                          className="border"
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded">
                          {user.employee?.firstName || "Not set"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Last Name</Label>
                      {isEditing ? (
                        <Input
                          value={editedUser.lastName}
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              lastName: e.target.value,
                            })
                          }
                          className="border"
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded">
                          {user.employee?.lastName || "Not set"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Phone</Label>
                      {isEditing ? (
                        <Input
                          value={editedUser.phone}
                          onChange={(e) =>
                            setEditedUser({
                              ...editedUser,
                              phone: e.target.value,
                            })
                          }
                          className="border"
                        />
                      ) : (
                        <div className="p-2 bg-muted rounded">
                          {user.employee?.phone || "Not set"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="sm:max-h-[490px]">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 h-[420px] overflow-auto">
              {Object.values(NotificationType).map((type) => {
                const preference = preferences?.find(
                  (p) => p.notificationType === type
                );
                const channel = preference?.channel ?? NotificationChannel.BOTH;
                const enabled = preference?.enabled ?? true;
                const isCurrentUpdating = isUpdating(type);

                return (
                  <div
                    key={type}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted rounded-lg"
                  >
                    <div className="space-y-1 flex-1">
                      <Label className="font-medium capitalize">
                        {type.replace(/_/g, " ")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        How would you like to receive these notifications?
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Select
                        value={channel}
                        onValueChange={(value: NotificationChannel) =>
                          handleChannelChange(type, value, enabled)
                        }
                        disabled={!enabled || isCurrentUpdating}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Channel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NotificationChannel.IN_APP}>
                            In App
                          </SelectItem>
                          <SelectItem value={NotificationChannel.EMAIL}>
                            Email
                          </SelectItem>
                          <SelectItem value={NotificationChannel.BOTH}>
                            Both
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked: boolean) =>
                          handleToggle(type, checked, channel)
                        }
                        disabled={isCurrentUpdating}
                        aria-label={`Toggle ${type} notifications`}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
