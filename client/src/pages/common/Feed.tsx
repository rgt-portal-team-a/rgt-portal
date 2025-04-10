import CreatePost from "@/components/CreatePost";
import Post from "@/components/Post";
import React, { useMemo } from "react";
import PollUI from "@/components/PollUI";
import WithRole from "@/common/WithRole";
import { useAuthContextProvider } from "@/hooks/useAuthContextProvider";
import { useGetAllRecognitions } from "@/api/query-hooks/recognition.hooks";
import Recognition from "@/components/Recognition";
import { usePoll } from "@/hooks/use-poll";
import { usePost } from "@/hooks/use-posts";
import Upcoming_SpecialCard from "@/components/common/Upcoming_SpecialCard.tsx";
import PostSkeleton from "@/components/common/PostSkeleton";

const Feed = () => {
  const { currentUser: user } = useAuthContextProvider();

  const { data: recognitions, isLoading: recsLoading } =
    useGetAllRecognitions();

  const { polls, pollsLoading } = usePoll();
  const { posts, postsLoading } = usePost();

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

  // if (pollsLoading && postsLoading) {
  //   return <FeedSkeleton />;
  // }

  return (
    <main
      className={`flex w-full h-full pb-3 sm:pb-0 lg:space-x-[17px]`}
    >
      {/* main screen */}
      <div className="flex flex-col h-full flex-1 min-w-0">
        <Recognition
          recognitions={
            Array.isArray(recognitions?.data) ? recognitions?.data : []
          }
          isRecLoading={recsLoading}
        />

        <div
          className=" h-full flex-1 overflow-y-auto mt-4"
          // style={{
          //   scrollbarWidth: "none",
          //   msOverflowStyle: "none",
          // }}
        >
          {/* Posts section */}
          <section className="space-y-7 bg-white rounded-2xl">
            <WithRole
              roles={["hr", "marketer", "admin"]}
              userRole={user?.role.name as string}
            >
              <CreatePost />
            </WithRole>

            <div className="space-y-3">
              <header className="font-semibold text-xs py-1  px-4 bg-purple-200 text-rgtpurple w-fit rounded-r">
                For you
              </header>
              <div className="space-y-5">
                {pollsLoading || postsLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <PostSkeleton key={i} />
                    ))}
                  </>
                ) : mergedFeed.length > 0 ? (
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
                  <div className="flex w-full bg-slate-100 h-96 text-rgtpurple font-semibold justify-center items-center">
                    <p>No posts available</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* calendar */}
      <div
        className="hidden xl:block h-[100%] w-[400px] overflow-y-scroll"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <Upcoming_SpecialCard />
      </div>
    </main>
  );
};

export default Feed;
