import Avtr from "./Avtr";
import confetti from "../assets/images/confetti2.png";
import { Key } from "react";
import { EmployeeRecognition } from "@/types/recognition";
import { AvatarSkeleton } from "./common/AvatarSkeleton";

const Recognition = ({
  recognitions,
  isRecLoading,
}: {
  recognitions: EmployeeRecognition[] | undefined;
  isRecLoading: boolean;
}) => {
  const colors = [
    { color: "#FFCFF2", name: "pink" },
    { color: "#FFEBCC", name: "yellow" },
    { color: "#F6EEFF", name: "purple" },
  ];

  console.log("recog", recognitions);

  const emojis = [
    "😎",
    "😜",
    "😤",
    "😇",
    "😁",
    "🎉",
    "🌟",
    "🏆",
    "👏",
    "💡",
    "🔥",
    "✨",
    "💎",
    "🚀",
    "🎖️",
  ];

  const getRandomEmoji = () => {
    const randomIndex = Math.floor(Math.random() * emojis.length);
    return emojis[randomIndex];
  };

  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  return (
    <section
      className="bg-rgtpurple sticky min-h-32 top-0 rounded-[20px] text-white flex flex-col  max-w-full p-3 space-y-1 items-center justify-center"
      style={{
        backgroundImage: `url(${confetti})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        zIndex: 50,
      }}
    >
      {recognitions && recognitions.length > 0 ? (
        <header className="">
          <p className="font-semibold text-xl md:text-2xl text-center">
            Employees of the Week!!
          </p>
          <p className="font-semibold text-xs sm:text-sm text-center">
            Theme of the week: Dedication... Let's Lock in
          </p>
        </header>
      ) : (
        !isRecLoading && (
          <div className="flex items-center w-full font-bold justify-center h-20">
            <p>No recognitions for today</p>
          </div>
        )
      )}

      <div
        className="w-full flex justify-center gap-1 items-center overflow-x-scroll"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>
          {`
                .hide-scrollbar::-webkit-scrollbar {
                display: none; /* Chrome, Safari, and Opera */
              }
              `}
        </style>
        {isRecLoading && (
          <div className="flex items-center justify-center gap-2 h-20 w-20">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, i) => (
              <AvatarSkeleton key={i} />
            ))}
          </div>
        )}
        {recognitions &&
          recognitions.length > 0 &&
          recognitions.map(
            (item: EmployeeRecognition, index: Key | null | undefined) => {
              const randomColor = getRandomColor();
              const randomEmoji = getRandomEmoji();
              return (
                <div
                  className="flex flex-col items-center justify-center"
                  key={index}
                >
                  {/* <p className="font-bold text-sm text-gold-600">{item.project}</p> */}
                  <div
                    className={`border-3 rounded-full p-1 flex w-fit items-center justify-center relative ${
                      randomColor.name === "pink"
                        ? "border-[#EA5E9C]"
                        : randomColor.name === "yellow"
                        ? "border-[#F9B500]"
                        : "border-[#C0AFFF]"
                    }`}
                    key={index}
                  >
                    <Avtr
                      url={
                        item.recognizedEmployee?.user?.profileImage as string
                      }
                      name={item.recognizedEmployee.user?.username as string}
                      className={`w-[55px] h-[55px]`}
                    />

                    <span
                      className="absolute bottom-0 -right-3 text-3xl"
                      style={{ zIndex: "100" }}
                    >
                      {randomEmoji}
                    </span>
                  </div>
                  <p className="font-semibold text-xs  sm:text-sm w-20 truncate  text-center">
                    {item.recognizedEmployee?.firstName}
                  </p>
                </div>
              );
            }
          )}
      </div>
    </section>
  );
};

export default Recognition;
