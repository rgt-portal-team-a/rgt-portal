// QuickActions.tsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EventModal } from "./Events/EventModal";

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
  const [selectedAction, setSelectedAction] = useState<string | undefined>(undefined);

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="py-[19px] rounded-2xl shadow-sm h-[412px] w-[400px]">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 px-[28px]">Quick Actions</h2>
        <CardContent className="space-y-4">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="flex items-center w-full justify-between py-3 px-2 rounded-lg transition duration-300"
            >
              <div className="flex gap-3">
                <div className={`w-18 flex items-center justify-center rounded-lg ${action.color}`}>
                  <img src={"/Award.svg"} className="w-6 h-6" />
                </div>
                <div className="text-left flex flex-col">
                  <h3 className="text-md font-semibold text-gray-700">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
              <Button
                variant = {"outline"}
                className="rounded-full p-4 hover:bg-gray-100 transition duration-300"
                onClick={() => handleActionClick(action.title)}
              >
                <Plus className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition duration-300" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {isModalOpen && (
        <EventModal
          title = {"Create "+selectedAction}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedAction={selectedAction}
        />
      )}
    </>
  );
}