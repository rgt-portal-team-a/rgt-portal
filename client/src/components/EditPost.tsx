// components/EditPost.tsx
import { useEffect, useState } from "react";
import Media from "./Media";
import { Button } from "./ui/button";
import { usePost } from "@/hooks/use-posts";
import { X } from "lucide-react";

interface EditPostProps {
  postId: number;
  initialContent: string;
  initialMedia: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export const EditPost = ({
  postId,
  initialContent,
  initialMedia,
  onClose,
  onSuccess,
}: EditPostProps) => {
  const { updatePost, isPostUpdating } = usePost();
  const [content, setContent] = useState(initialContent);
  const [existingMedia, setExistingMedia] = useState(initialMedia);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    setContent(initialContent);
    setExistingMedia(initialMedia);
  }, [initialContent, initialMedia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", content);

    // Append media to keep (existing media URLs)
    existingMedia.forEach((url) => formData.append("media", url));

    // Append new files
    newFiles.forEach((file) => formData.append("media", file));

    try {
      await updatePost(postId, formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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

          {/* Existing Media Preview */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {existingMedia.map((url, index) => (
              <div key={index} className="relative group">
                <Media url={url} className="h-32 w-full object-cover rounded" />
                <button
                  type="button"
                  onClick={() =>
                    setExistingMedia(
                      existingMedia.filter((_, i) => i !== index)
                    )
                  }
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* New Media Upload */}
          <div className="mb-4">
            <input
              type="file"
              multiple
              onChange={(e) =>
                setNewFiles([...newFiles, ...Array.from(e.target.files || [])])
              }
              className="hidden"
              id="edit-post-upload"
            />
            <label
              htmlFor="edit-post-upload"
              className="inline-block px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
            >
              Add New Media
            </label>
          </div>

          {/* New Files Preview */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {newFiles.map((file, index) => (
              <div key={index} className="relative group">
                <Media
                  url={URL.createObjectURL(file)}
                  className="h-32 w-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() =>
                    setNewFiles(newFiles.filter((_, i) => i !== index))
                  }
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPostUpdating}>
              {isPostUpdating ? "Updating..." : "Update Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
