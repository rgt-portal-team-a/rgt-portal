import { Loader, X } from "lucide-react";
import { Button } from "../ui/button";

interface IDeleteCard {
  onDelete: () => void;
  onCancel?: () => void;
  message: string;
  title: string;
  isDeleting?: boolean;
}

const DeleteCard: React.FC<IDeleteCard> = ({
  onCancel,
  onDelete,
  message,
  title,
  isDeleting,
}) => {
  return (
    <section
      className="fixed inset-0 backdrop-blur-xs  flex items-center justify-center w-full"
      style={{ zIndex: 100 }}
    >
      <div className="bg-white p-4 rounded-md space-y-5 max-w-[343px] text-wrap border shadow-sm flex flex-col ">
        <div className="flex justify-between items-center">
          <img src="/DelCon.svg" alt="delete" />
          <X
            className="text-gray-500 cursor-pointer p-2 rounded-full transition-all duration-300 ease-in hover:bg-gray-100"
            onClick={onCancel}
            size={35}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[#181D27] font-semibold text-sm">{title}</p>
          <p className="text-sm text-[#535862] font-medium">{message}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            className={`text-white bg-[#D92D20] font-semibold text-lg hover:bg-red-600 transition-all duration-300 ease-in cursor-pointer`}
            disabled={isDeleting}
            onClick={() => onDelete()} // Replace 1 with the actual id you want to delete
          >
            {isDeleting ? <Loader className="animate-spin" /> : `Delete`}
          </Button>
          <Button
            className="bg-white text-[#414651] font-semibold text-lg border-1 border-[#D5D7DA]  hover:bg-gray-200 transition-all duration-300 ease-in cursor-pointer"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DeleteCard;
