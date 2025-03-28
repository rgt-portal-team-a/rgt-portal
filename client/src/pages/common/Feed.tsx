import AnnouncementCard from "@/components/AnnouncementCard";
import CreatePost from "@/components/CreatePost";
import EventList from "@/components/EventList";
import Post from "@/components/Post";
import { announcements, eventList } from "@/constants";
import { Calendar } from "@/components/ui/calendar";
import React, { useMemo, useState } from "react";
import { PollService } from "@/api/services/poll.service";
import { useQuery } from "@tanstack/react-query";
import { Poll } from "@/types/polls";
import { PostService } from "@/api/services/posts.service";
import { FeedSkeleton } from "../../FeedSkeleton";
import PollUI from "@/components/PollUI";
import WithRole from "@/common/WithRole";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import ArrowIcon from "@/assets/icons/ArrowIcon";
import { useGetAllRecognitions } from "@/api/query-hooks/recognition.hooks";
import Recognition from "@/components/Recognition";
import ToTop from "@/components/common/ToTop";

const Feed = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { currentUser: user } = useAuthContextProvider();

  const { data: recognitions, isLoading: recsLoading } =
    useGetAllRecognitions();

  const { data: polls, isLoading: pollsLoading } = useQuery({
    queryKey: ["polls"],
    queryFn: () =>
      PollService.getPolls().then((res) => {
        console.log("polls:", res.data);
        return res.data as Poll[];
      }),
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => PostService.getPosts().then((res) => res.data as IPost[]),
  });

  const mergedFeed = useMemo(() => {
    const postsWithType =
      posts?.map((p) => ({ ...p, feedType: "post" as const })) || [];
    const pollsWithType =
      polls?.map((p) => ({ ...p, feedType: "poll" as const })) || [];

    return [...postsWithType, ...pollsWithType].sort((a, b) => {
      const dateA = a.feedType === "post" ? a.publishDate : a.createdAt;
      const dateB = b.feedType === "post" ? b.publishDate : b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [posts, polls]);

  if (pollsLoading || postsLoading) {
    return <FeedSkeleton />;
  }

  return (
    <main
      className={`flex flex-col md:flex-row h-full md:space-x-[17px] pb-5 justify-end relative`}>
      <div
        className="space-y-[18px] flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
        <Recognition
          recognitions={
            Array.isArray(recognitions?.data) ? recognitions?.data : []
          }
          isRecLoading={recsLoading}
        />

        {/* Posts section */}
        <section className="space-y-7">
          <WithRole
            roles={["hr", "marketer", "admin"]}
            userRole={user?.role.name as string}>
            <CreatePost />
          </WithRole>

          <div className="space-y-3">
            <header className="font-semibold text-lg text-[#706D8A] ">
              For you
            </header>
            <div className="space-y-5">
              {mergedFeed.length > 0 ? (
                mergedFeed.map((item) => (
                  <React.Fragment key={item.id}>
                    {item.feedType === "post" ? (
                      <Post post={item} postId={item.id} />
                    ) : item.feedType === "poll" ? (
                      <PollUI pollId={item.id} />
                    ) : (
                      <div>No post or poll data available</div>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div className="flex w-full bg-slate-200 h-96 text-rgtpurple font-semibold justify-center items-center">
                  <p>No posts available</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <section
        className="hidden custom1:flex space-y-10 w-[380px] overflow-y-auto "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
        <div className="pt-5 space-y-3 h-fit  bg-white rounded-t-2xl w-full flex flex-col items-center">
          <p className="font-bold text-lg text-[#706D8A] px-4 w-full">
            Upcoming Events
          </p>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate} 
            initialFocus
            modifiers={{
              today: new Date(),
            }}
            modifiersClassNames={{
              today: date ? "" : "bg-[#F8C74F] text-white",
            }}
            classNames={{
              day_selected:
                "bg-[#F8C74F] text-white hover:bg-[#F8C74F] focus:bg-[#F8C74F] rounded-full",
              month: "flex flex-col space-y-3 flex-grow",
              day: "w-8 h-8 font-medium rounded-full",
              head_cell:
                "w-8 flex-grow text-[#B5BEC6] font-semibold uppercase text-[10px]",
              cell: "flex items-center justify-center flex-grow text-sm",
            }}
            className="shadow-lg shadow-gray-300 p-2 rounded-md flex flex-col w-[348px] h-full"
          />

          <div className="px-4 py-[24px] bg-white rounded-lg space-y-5 w-full">
            <div className="flex items-center justify-between">
              <p className="text-[#706D8A] font-[700] text-lg">
                Special Events
              </p>

              <ArrowIcon className="hover:bg-slate-200 rounded-full transition-all duration-300 ease-in rotate-360 cursor-pointer" />
            </div>

            <div className="flex flex-col space-y-5">
              {eventList.map((event, index) => (
                <EventList
                  key={index}
                  {...event}
                  className={`${
                    eventList.length - 1 === index ? "border-b-0" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="px-4 bg-white rounded-lg space-y-2 w-full">
            <div className="flex items-center justify-between pb-4">
              <p className="font-semibold text-[#706D8A] text-lg">
                Announcements
              </p>
              <ArrowIcon className="hover:bg-slate-200 rounded-full transition-all duration-300 ease-in rotate-360 cursor-pointer" />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 ">
              {announcements.map((announcement, index) => (
                <AnnouncementCard {...announcement} key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <ToTop />
    </main>
  );
};

export default Feed;
