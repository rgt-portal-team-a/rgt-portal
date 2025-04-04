import { ClassNameValue } from "tailwind-merge";
import WithRole from "@/common/WithRole";
import { MoreVertical } from "lucide-react";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { useEffect, useRef, useState } from "react";
import EditIcon from "@/assets/icons/EditIcon";
import DeleteIcon2 from "@/assets/icons/DeleteIcon2";
import ConfirmCancelModal from "./common/ConfirmCancelModal";
import DeleteRippleIcon from "./common/DeleteRippleIcon";
import {useDeleteEvent} from "@/api/query-hooks/event.hooks"
import { toast } from "@/hooks/use-toast";



export interface IEventList {
  event: "holiday" | "birthday" | "meeting";
  date: string;
  title: string;
  id: number;
  className?: ClassNameValue;
}

const EventList: React.FC<IEventList> = ({ event, date, title, id, className }) => {
    const { currentUser } = useAuthContextProvider();
    const [showMore, setShowMore] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const deleteEventMutation = useDeleteEvent();


    useEffect(() => {
      function handleClickOutside(event: MouseEvent): void {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          if (!(event.target as Element)?.closest(".more-vertical-icon")) {
            setShowMore(false);
          }
        }
      }
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);


    const handleDelete = async (id: number) => {
      try{
        console.log("Deleting Event with Id", id)
        await deleteEventMutation.mutateAsync(id);
        setShowDeleteModal(false);
      }catch(err){
        console.log("Error Deleting Event",err);
        toast({
          title: "Error Deleting Event",
          description: "Failed To Delete Event" + err,
          variant: "destructive",
        });
      }
    }

  return (
    <div
      className={`flex items-center justify-between border-b pb-4 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <img
          src={
            event === "birthday"
              ? "/Gift.svg"
              : event === "holiday"
              ? "/Moon.svg"
              : "/UsersFour.svg"
          }
          alt="calendar"
          className="bg-[#EEF2FF] p-3 rounded-[8px]"
        />
        <div className="space-y-1">
          <p className="text-rgtgray text-sm w-32 truncate font-semibold">
            {title}
          </p>
          <p className="text-rgtgray text-xs font-[400]">{date}</p>
        </div>
      </div>
      <div className="relative">
        <WithRole
          roles={["hr", "marketer", "manager"]}
          userRole={currentUser?.role?.name || ""}
        >
          <MoreVertical
            className="more-vertical-icon text-[#CBD5E1] hover:text-[#8d949c] transition-colors duration-300 ease-in cursor-pointer"
            onClick={() => setShowMore(!showMore)}
          />
        </WithRole>
        {showMore && (
          <div
            ref={menuRef}
            className="absolute right-1 top-8  bg-white border rounded flex flex-col items-center transition-all duration-300 ease-in"
            style={{ zIndex: "30" }}
          >
            {/* <p
              className="flex border-b w-full items-center justify-center py-2 px-3 cursor-pointer hover:bg-slate-100 transition-all duration-300"
              onClick={() => console.log("update")}
            >
              <EditIcon />
            </p> */}

            <p
              className="flex p-1 px-2 w-full justify-center cursor-pointer hover:bg-slate-100 transition-all duration-300 py-2"
              onClick={() => setShowDeleteModal(true)}
            >
              <DeleteIcon2 />
            </p>
          </div>
        )}
      </div>
      <ConfirmCancelModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onSubmit={() => handleDelete(id)}
        isSubmitting={deleteEventMutation.isPending}
        submitText="Confirm"
        onOpenChange={() => setShowDeleteModal(false)}
      >
        <div className="flex flex-col justify-center items-center space-y-2">
          <DeleteRippleIcon />
          <p className="text-lg font-semibold">Delete {title} Event?</p>
          <p className="font-light text-[#535862] text-sm text-center text-wrap w-[300px]">
            Are you sure you want to delete this event? This action cannot be
            undone.
          </p>
        </div>
      </ConfirmCancelModal>
    </div>
  );
};

export default EventList;
