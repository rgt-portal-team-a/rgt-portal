// QuickActions.tsx
import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { EventModal } from "../Events/EventModal";
import RewardIcon from "@/assets/icons/RewardIcon";

const quickActions = [
  {
    title: "Recognition",
    description: "Create the new list for the applause corner",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Special Events",
    description: "App upcoming events for the week for the employees",
    color: "bg-pink-100 text-pink-600",
  },
  {
    title: "Announcements",
    description: "Add new announcements for the employees",
    color: "bg-blue-100 text-blue-600",
  },
];

export default function QuickActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | undefined>(
    undefined
  );

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="rounded-2xl shadow-sm h-fit w-full p-4">
        <CardTitle className="text-lg font-semibold text-gray-700 pb-4">
          Quick Actions
        </CardTitle>
        <CardContent className="p-0 space-y-8 w-full">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="flex items-center w-full justify-between rounded-lg transition duration-300"
            >
              <div className="flex gap-3">
                <div
                  className={`w-15 h-14 flex items-center justify-center rounded-lg ${action.color}`}
                >
                  <RewardIcon color={action.color} size={24} />
                </div>
                <div className="text-left flex flex-col lg:w-44">
                  <h3 className="text-md font-semibold text-gray-700 text-nowrap">
                    {action.title}
                  </h3>
                  <p className="text-xs font-normal text-gray-500 ">{action.description}</p>
                </div>
              </div>
              <div
                // variant={"ghost"}
                className="bg-transparent border-none shadow-none transition duration-300 "
                onClick={() => handleActionClick(action.title)}
              >
                <Plus size={24} className="cursor-pointer hover:text-gray-600 transition duration-300" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {isModalOpen && (
        <EventModal
          title={"Create " + selectedAction}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedAction={selectedAction}
        />
      )}
    </>
  );
}
