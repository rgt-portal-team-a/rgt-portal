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
    bg: "bg-[#FFEBCC]",
    color: "#F9B500",
  },
  {
    title: "Special Events",
    description: "App upcoming events for the week for the employees",
    bg: "bg-[#FFD0E5]",
    color: "#E328AF",
  },
  {
    title: "Announcements",
    description: "Add new announcements for the employees",
    bg: "bg-[#EEF2FF]",
    color: "#6418C3",
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
      <Card className="rounded-[20px] shadow-none border-0  h-fit w-full px-8 py-10">
        <CardTitle className="text-lg font-semibold text-[#706D8A] pb-4">
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
                  className={`px-3 h-12 flex items-center justify-center rounded-lg ${action.bg}`}
                >
                  <RewardIcon color={action.color} size={24} />
                </div>
                <div className="text-left flex flex-col">
                  <h3 className="text-[18px] font-semibold text-[#706D8A] text-nowrap">
                    {action.title}
                  </h3>
                  <p className="text-xs font-light min-w-[230px] text-[#706D8A]">
                    {action.description}
                  </p>
                </div>
              </div>
              <div
                // variant={"ghost"}
                className="bg-transparent transition duration-300 "
                onClick={() => handleActionClick(action.title)}
              >
                <Plus
                  size={24}
                  className="cursor-pointer text-[#706D8A] transition duration-300"
                />
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
