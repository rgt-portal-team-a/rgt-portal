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
      className="bg-rgtpurple min-h-32 rounded-[20px] text-white flex flex-col  w-full p-3 space-y-1 items-center justify-center "
      style={{
        backgroundImage: `url(${confetti})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        zIndex: 50,
      }}
    >
      {recognitions && recognitions.length > 0 ? (
        <div className="relative">
          <header className="">
            <p className="font-semibold text-xl md:text-2xl text-center">
              Employees of the Week!!
            </p>
            <p className="font-semibold text-xs sm:text-sm text-center">
              Theme of the week: Dedication... Let's Lock in
            </p>
          </header>

          {/* <div className="bg-rgtpurple cursor-pointer absolute top-0 -right-20 p-2 rounded-lg text-sm font-semibold border">
            <p>See all</p>
          </div> */}
        </div>
      ) : (
        !isRecLoading && (
          <div className="flex items-center w-full font-bold justify-center h-20">
            <p>No recognitions for today</p>
          </div>
        )
      )}

      <div
        className="flex gap-2 w-full px-4 py-2 relative justify-center"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          overflowX: "auto",
        }}
      >
        <div
          className="flex-shrink-0 invisible"
          style={{ width: "calc(20% - 100px)" }}
        ></div>

        {isRecLoading && (
          <div className="w-full flex justify-center">
            <div className="flex items-center justify-center gap-2 h-20 w-20">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, i) => (
                <AvatarSkeleton key={i} />
              ))}
            </div>
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
                      name={
                        (item.recognizedEmployee?.user?.username as string) ??
                        `#${index}`
                      }
                      className={`w-[50px] h-[50px]`}
                      avtBg="bg-rgtpurple"
                    />

                    <span
                      className="absolute bottom-0 -right-3 text-3xl"
                      style={{ zIndex: "100" }}
                    >
                      {randomEmoji}
                    </span>
                  </div>
                  <p className="font-semibold text-xs  sm:text-sm text-nowrap text-center">
                    {item.recognizedEmployee?.firstName ?? `User #${index}`} -
                    <span className="text-orange-500">{item.project}</span>
                  </p>
                </div>
              );
            }
          )}
        <div
          className="flex-shrink-0 invisible"
          style={{ width: "calc(20% - 100px)" }}
        ></div>
      </div>
    </section>
  );
};

export default Recognition;
