import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { usePost } from "@/hooks/use-posts";
import { Loader, Loader2, X } from "lucide-react";
import PhotoIcon from "@/assets/icons/PhotoIcon";
import VideoIcon from "@/assets/icons/VideoIcon";
import { FileUploadService } from "@/api/services/file.service";
import toastService from "@/api/services/toast.service";
import { UploadStatus } from "./CreatePost";

interface EditPostProps {
  postId: number;
  initialContent: string;
  initialMedia: string[];
  onClose: () => void;
  onSuccess: () => void;
}

const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
const allowedVideoTypes = ["video/mp4", "video/quicktime"];
const maxImageSize = 5 * 1024 * 1024; // 5MB
const maxVideoSize = 100 * 1024 * 1024; // 100MB

export const EditPost = ({
  postId,
  initialContent,
  initialMedia,
  onClose,
  onSuccess,
}: EditPostProps) => {
  const { updatePost, isPostUpdating } = usePost();
  const [content, setContent] = useState(initialContent);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newVideos, setNewVideos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    images: "idle",
    videos: "idle",
  });

  useEffect(() => {
    const categorizeMedia = () => {
      const images: string[] = [];
      const videos: string[] = [];

      initialMedia.forEach((url) => {
        if (url.match(/\.(jpe?g|png|gif)$/i)) {
          images.push(url);
        } else if (url.match(/\.(mp4|mov)$/i)) {
          videos.push(url);
        }
      });

      setExistingImages(images);
      setExistingVideos(videos);
    };

    categorizeMedia();
  }, [initialMedia]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];

      for (const file of files) {
        if (!allowedImageTypes.includes(file.type)) {
          setError("Invalid image format. Please upload a JPEG, PNG, or GIF.");
          return;
        }
        if (file.size > maxImageSize) {
          setError("Image is too large. Maximum size is 5MB.");
          return;
        }
        validFiles.push(file);
      }

      setNewImages((prev) => [...prev, ...validFiles]);
      setError(null);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];

      for (const file of files) {
        if (!allowedVideoTypes.includes(file.type)) {
          setError("Invalid video format. Please upload an MP4 or MOV.");
          return;
        }
        if (file.size > maxVideoSize) {
          setError("Video is too large. Maximum size is 100MB.");
          return;
        }
        validFiles.push(file);
      }

      setNewVideos((prev) => [...prev, ...validFiles]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Upload new images
      setUploadStatus((prev) => ({ ...prev, images: "loading" }));
      const uploadedImageUrls = await Promise.all(
        newImages.map(async (file) => {
          const response = await FileUploadService.uploadFile(file);
          if (response.file) {
            return response.file?.url ?? "";
          } else {
            throw new Error(
              "File upload response is missing the file property."
            );
          }
        })
      );
      setUploadStatus((prev) => ({ ...prev, images: "success" }));

      // Upload new videos
      setUploadStatus((prev) => ({ ...prev, videos: "loading" }));
      const uploadedVideoUrls = await Promise.all(
        newVideos.map(async (file) => {
          const response = await FileUploadService.uploadFile(file);
          if (response.file) {
            return response.file.url;
          } else {
            throw new Error(
              "File upload response is missing the file property."
            );
          }
        })
      );
      setUploadStatus((prev) => ({ ...prev, videos: "success" }));

      // Combine all media URLs
      const media = [
        ...existingImages,
        ...existingVideos,
        ...uploadedImageUrls,
        ...uploadedVideoUrls,
      ];

      // Update the post
      await updatePost(postId, { content, media });
      toastService.success("Post updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      toastService.error("Failed to update post");
    } finally {
      setUploadStatus({ images: "idle", videos: "idle" });
    }
  };

  const renderUploadStatus = (fieldName: "images" | "videos") => {
    const status = uploadStatus[fieldName];
    if (status === "loading") {
      return (
        <div className="text-blue-500 text-xs mt-1 flex items-center">
          <Loader className="animate-spin h-3 w-3 mr-1" /> Uploading...
        </div>
      );
    } else if (status === "success") {
      return (
        <div className="text-green-500 text-xs mt-1">Upload successful</div>
      );
    } else if (status === "error") {
      return <div className="text-red-500 text-xs mt-1">Upload failed</div>;
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      style={{ zIndex: 1200 }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 border rounded mb-4 min-h-[100px]"
          />

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-100 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Media Previews */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Existing Images */}
            {existingImages.map((url, index) => (
              <div key={`existing-img-${index}`} className="relative group">
                <img
                  src={url}
                  alt={`Existing content ${index}`}
                  className="w-24 h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() =>
                    setExistingImages(
                      existingImages.filter((_, i) => i !== index)
                    )
                  }
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Existing Videos */}
            {existingVideos.map((url, index) => (
              <div key={`existing-vid-${index}`} className="relative group">
                <video src={url} className="w-24 h-24 object-cover rounded" />
                <button
                  type="button"
                  onClick={() =>
                    setExistingVideos(
                      existingVideos.filter((_, i) => i !== index)
                    )
                  }
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* New Images */}
            {newImages.map((file, index) => (
              <div>
                <div key={`new-img-${index}`} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New content ${index}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewImages(newImages.filter((_, i) => i !== index))
                    }
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                {renderUploadStatus("images")}
              </div>
            ))}

            {/* New Videos */}
            {newVideos.map((file, index) => (
              <div>
                <div key={`new-vid-${index}`} className="relative group">
                  <video
                    src={URL.createObjectURL(file)}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewVideos(newVideos.filter((_, i) => i !== index))
                    }
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                {renderUploadStatus("videos")}
              </div>
            ))}
          </div>

          {/* Upload Controls */}
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer bg-rgtpurple text-white py-2 px-3 rounded-md">
              <PhotoIcon />
              Add Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-rgtpurple text-white py-2 px-3 rounded-md">
              <VideoIcon />
              Add Videos
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPostUpdating}
              className="bg-rgtpink hover:bg-rgtpink hover:shadow-lg hover:shadow-slate-300 cursor-pointer"
            >
              {isPostUpdating ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Update Post"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
