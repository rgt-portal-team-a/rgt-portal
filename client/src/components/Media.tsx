import React from "react";
import { ClassNameValue } from "tailwind-merge";

const Media: React.FC<{
  url: string;
  alt?: string;
  className: ClassNameValue;
  onClick?: () => void;
}> = ({ url, alt = "Media", className, onClick }) => {
  const [mediaError, setMediaError] = React.useState(false);

  const isVideo =
    url.endsWith(".mp4") || url.endsWith(".mov") || url.includes("video");

  return (
    <section
      className={`flex justify-center object-contain w-full ${className}`}
    >
      {url && !mediaError ? (
        isVideo ? (
          <video
            controls
            className="w-full h-full rounded-md cursor-pointer hover:brightness-75 transition-all duration-300 ease-in"
            onError={() => setMediaError(true)}
            onClick={onClick}
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={url}
            alt={alt}
            onError={() => setMediaError(true)}
            onClick={onClick}
            className="w-full h-full rounded-2xl object-cover cursor-pointer hover:brightness-75 transition-all duration-300 ease-in"
          />
        )
      ) : (
        <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Media not available</span>
        </div>
      )}
    </section>
  );
};

export default Media;
