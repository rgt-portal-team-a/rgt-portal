import DeleteIcon2 from "@/assets/icons/DeleteIcon2";

const DeleteRippleIcon = () => {
  return (
    <div className="rounded-full p-2 w-fit bg-red-50">
      <div className="rounded-full px-[10px] py-[8px] bg-red-100 w-fit flex justify-center">
        <DeleteIcon2 />
      </div>
    </div>
  );
};

export default DeleteRippleIcon;
