import { Button } from "../ui/button";

const SuccessCard: React.FC<{ handleClick: () => void }> = ({
  handleClick,
}) => {
  return (
    <section
      className="fixed inset-0  backdrop-blur-xs  flex items-center justify-center"
      style={{ zIndex: 100 }}
    >
      <div className="bg-white flex flex-col items- justify-cente border p-5 min-w-md rounded-lg space-y-6">
        <div className="flex items-center flex-col space-y-2">
          <img src="/successIcon.svg" />
          <p className="font-semibold text-[#181D27] text-lg">Success!</p>
          <p className="text-[#535862] text-sm">
            You have successfully made a request!
          </p>
        </div>
        <Button
          className="bg-[#FFA6CD] text-rgtpink hover:bg-pink-400 transition-colors duration-300 ease-in hover:text-white cursor-pointer"
          onClick={handleClick}
        >
          Check now
        </Button>
      </div>
    </section>
  );
};

export default SuccessCard;
