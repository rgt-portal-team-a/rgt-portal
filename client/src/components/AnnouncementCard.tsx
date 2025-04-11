import { IAnnouncementCard } from "@/types/employee";
import { AlarmClock } from "lucide-react";
import WithRole from "@/common/WithRole";
import { MoreVertical } from "lucide-react";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { useEffect, useRef, useState } from "react";
import DeleteIcon2 from "@/assets/icons/DeleteIcon2";
import ConfirmCancelModal from "./common/ConfirmCancelModal";
import DeleteRippleIcon from "./common/DeleteRippleIcon";
import { useDeleteEvent } from "@/api/query-hooks/event.hooks";
import toastService from "@/api/services/toast.service";

const AnnouncementCard: React.FC<IAnnouncementCard> = ({ date, title, id }) => {
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const day = date.getDate();
  const dayOfWeek = date.toDateString().split(" ")[0];
  console.log("day, time:", day, time, dayOfWeek);
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
    try {
      console.log("Deleting Event with Id", id);
      await deleteEventMutation.mutateAsync(id);
      setShowDeleteModal(false);
    } catch (err) {
      console.log("Error Deleting Event", err);
      toastService.error("Failed To Delete Event" + err);
    }
  };

  return (
    <>
      <section className="flex justify-between items-center bg-[#F6F6F9] md:w-[170px] rounded-[6px] w-full h-[70px] px-2">
        <div className="flex space-x-1 flex-1 min-w-0">
          <div className="bg-[#E328AF] text-white p-3 rounded-md flex flex-col items-center justify-center text-sm w-[40px] shrink-0">
            <p>{dayOfWeek}</p>
            <p>{day}</p>
          </div>
          <div className="flex flex-col items-start justify-center md:space-y-1 text-[#706D8A] flex-1 min-w-0 text-nowrap">
            <p className="text-sm w-full truncate">{title}</p>
            <div className="flex items-center justify-center space-x-1">
              <AlarmClock size={15} />
              <p className="text-[12px]">{time.toLocaleLowerCase()}</p>
            </div>
          </div>
        </div>
        <div className="relative flex-shrink-0 pl-2">
          <WithRole
            roles={["hr", "admin"]}
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
      </section>
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
    </>
  );
};

export default AnnouncementCard;
