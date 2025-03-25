import React from "react";

const PostSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col p-4 rounded-lg shadow-md w-full bg-white animate-pulse">
      {/* Header Skeleton */}
      <section className="w-full border-b py-3 flex justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar Skeleton */}
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          {/* User Info Skeleton */}
          <div className="flex flex-col space-y-2">
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
            <div className="w-16 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
        {/* More Icon Skeleton */}
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
      </section>

      {/* Content Skeleton */}
      <section className="pt-3 space-y-3">
        {/* Text Skeleton */}
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-200 rounded"></div>
          <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
        </div>

        {/* Media Skeleton */}
        <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
      </section>

      {/* Actions Skeleton */}
      <section className="pt-3 flex justify-between">
        <div className="flex space-x-4">
          {/* Like Button Skeleton */}
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          {/* Comment Button Skeleton */}
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
        {/* Share Button Skeleton */}
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </section>
    </div>
  );
};

export default PostSkeleton;
