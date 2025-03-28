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
import { NotificationChannel, NotificationType } from "@/types/notifications";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { useNotificationPreferences } from "@/hooks/useNotificationPreference";
import { useUpdateUser } from "@/api/query-hooks/auth.hooks";

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
    } catch (error) {
      console.error("Failed to update user:", error);
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
    <div className="p-4 md:p-6 space-y-6 bg-white">
      {/* Profile Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">Profile Settings</h1>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs md:text-sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-1 md:gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs md:text-sm"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs md:text-sm"
                onClick={handleSave}
                // disabled={updateUserMutation.isLoading}
              >
                <Save className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                {/* {updateUserMutation.isLoading ? "Saving..." : "Save"} */}
              </Button>
            </div>
          )}
        </div>

        <div className="bg-card p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row items-start gap-4">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-2 w-full md:w-auto">
              {isEditing ? (
                <>
                  <label htmlFor="profileImage" className="cursor-pointer">
                    <Avatar className="w-16 h-16 md:w-20 md:h-20">
                      <AvatarImage src={editedUser.profileImage} />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs md:text-sm cursor-pointer"
                    onClick={() =>
                      document.getElementById("profileImage")?.click()
                    }
                  >
                    Change Photo
                  </Button>
                </>
              ) : (
                <Avatar className="w-16 h-16 md:w-20 md:h-20">
                  <AvatarImage src={user.profileImage} />
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            {/* Profile Fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
              {/* Uneditable Fields */}
              <div className="space-y-1">
                <Label className="text-xs md:text-sm">Role</Label>
                <div className="text-xs md:text-sm font-medium text-muted-foreground p-2 bg-muted rounded">
                  {user.role.name.toUpperCase()}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs md:text-sm">Employee ID</Label>
                <div className="text-xs md:text-sm font-medium text-muted-foreground p-2 bg-muted rounded">
                  {user.id}
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-1">
                <Label className="text-xs md:text-sm">Username</Label>
                {isEditing ? (
                  <Input
                    className="text-xs md:text-sm h-8 md:h-10 border"
                    value={editedUser.username}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, username: e.target.value })
                    }
                  />
                ) : (
                  <div className="text-xs md:text-sm font-medium text-muted-foreground p-2 bg-muted rounded">
                    {user.username}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs md:text-sm">Email</Label>
                {isEditing ? (
                  <Input
                    className="border text-xs md:text-sm h-8 md:h-10"
                    type="email"
                    value={editedUser.email}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, email: e.target.value })
                    }
                  />
                ) : (
                  <div className="text-xs md:text-sm font-medium text-muted-foreground p-2 bg-muted rounded">
                    {user.email}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs md:text-sm">First Name</Label>
                {isEditing ? (
                  <Input
                    className="border text-xs md:text-sm h-8 md:h-10"
                    value={editedUser.firstName || ""}
                    onChange={(e) =>
                      setEditedUser({
                        ...editedUser,
                        firstName: e.target.value,
                      })
                    }
                  />
                ) : (
                  <div className="text-xs md:text-sm font-medium text-muted-foreground p-2 bg-muted rounded">
                    {user.employee?.firstName || "Not set"}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs md:text-sm">Last Name</Label>
                {isEditing ? (
                  <Input
                    className="border text-xs md:text-sm h-8 md:h-10"
                    value={editedUser.lastName || ""}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, lastName: e.target.value })
                    }
                  />
                ) : (
                  <div className="text-xs md:text-sm font-medium text-muted-foreground p-2 bg-muted rounded">
                    {user.employee?.lastName || "Not set"}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs md:text-sm">Phone</Label>
                {isEditing ? (
                  <Input
                    className="border text-xs md:text-sm h-8 md:h-10"
                    type="tel"
                    value={editedUser.phone || ""}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, phone: e.target.value })
                    }
                  />
                ) : (
                  <div className="text-xs md:text-sm font-medium text-muted-foreground p-2 bg-muted rounded">
                    {user.employee?.phone || "Not set"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold">
          Notification Preferences
        </h2>
        <div className="bg-card p-4 md:p-6 rounded-lg shadow-sm space-y-4 md:space-y-6">
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4"
              >
                <div className="space-y-1 flex-1">
                  <Label className="text-xs md:text-sm font-medium capitalize">
                    {type.replace(/_/g, " ")}
                  </Label>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    How would you like to receive these notifications?
                  </p>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                  <Select
                    value={channel}
                    onValueChange={(value: NotificationChannel) =>
                      handleChannelChange(type, value, enabled)
                    }
                    disabled={!enabled || isCurrentUpdating}
                  >
                    <SelectTrigger className="w-[100px] md:w-[120px] text-xs md:text-sm">
                      <SelectValue placeholder="Channel" />
                    </SelectTrigger>
                    <SelectContent className="text-xs md:text-sm">
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
                    className="scale-75 md:scale-100"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
