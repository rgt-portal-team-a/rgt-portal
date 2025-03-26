import { useEffect, useMemo, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader, Plus, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { PostService } from "@/api/services/posts.service";
import { FileUploadService } from "@/api/services/file.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import SendIcon from "@/assets/icons/SendIcon";
import { PollService } from "@/api/services/poll.service";
import CustomSelect from "./common/Select";
import { authService } from "@/api/services/auth.service";
import { CreatePollDto } from "@/types/polls";
import DatePicker from "./common/DatePicker";
import PollIcon from "@/assets/icons/PollIcon";
import VideoIcon from "@/assets/icons/VideoIcon";
import PhotoIcon from "@/assets/icons/PhotoIcon";
import Globe from "@/assets/icons/Globe";

interface UploadStatus {
  images?: "idle" | "loading" | "success" | "error";
  videos?: "idle" | "loading" | "success" | "error";
}

const CreatePost = () => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<{
    employee: { id: number; firstName: string; lastName: string };
    profileImage?: string;
  } | null>(null);
  console.log("user:", user);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [previewItem, setPreviewItem] = useState<{
    type: "image" | "video";
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [poll, setPoll] = useState(false);

  const initialPollData: CreatePollDto = {
    description: "",
    options: [{ id: 0, text: "" }],
    isAnonymous: true,
    type: "single_choice",
    allowComments: true,
    startDate: new Date(),
  };
  const [pollInfo, setPollInfo] = useState<CreatePollDto>(initialPollData);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    images: "idle",
    videos: "idle",
  });
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime"];
  const maxImageSize = 5 * 1024 * 1024; // 5MB
  const maxVideoSize = 100 * 1024 * 1024; // 100MB

  const imageUrls = useMemo(
    () => images.map((image) => URL.createObjectURL(image)),
    [images]
  );
  const videoUrls = useMemo(
    () => videos.map((video) => URL.createObjectURL(video)),
    [videos]
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPoll(false);
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

      setImages((prev) => [...prev, ...validFiles]);
      setError(null);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPoll(false);
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

      setVideos((prev) => [...prev, ...validFiles]);
      setError(null);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const openPreview = (type: "image" | "video", url: string) => {
    setPreviewItem({ type, url });
  };

  const closePreview = () => {
    setPreviewItem(null);
  };

  const addPollOption = () => {
    setPollInfo({
      ...pollInfo,
      options: [...pollInfo.options, { id: 0, text: "" }],
    });
  };

  const handlePollOptionChange = (index: number, value: string) => {
    setPollInfo({
      ...pollInfo,
      options: pollInfo.options.map((option, i) =>
        i === index ? { id: i, text: value } : option
      ),
    });
  };

  const createPostMutation = useMutation({
    mutationFn: (postData: CreatePostDto) => {
      setSubmissionStatus("loading");
      return PostService.createPost(postData);
    },
    onSuccess: (data) => {
      setSubmissionStatus("success");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      console.log("data:", data);
    },
    onError: (error: Error) => {
      setSubmissionStatus("error");
      toast({
        title: "Error",
        description: "Failed to create post: " + error.message,
        variant: "destructive",
      });
    },
  });

  const createPollMutation = useMutation({
    mutationFn: (pollData: CreatePollDto) => {
      setSubmissionStatus("loading");
      return PollService.createPoll(pollData);
    },
    onSuccess: (data) => {
      setSubmissionStatus("success");
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast({
        title: "Success",
        description: "Poll created successfully",
      });
      console.log("data:", data);
    },
    onError: (error: Error) => {
      setSubmissionStatus("error");
      toast({
        title: "Error",
        description: "Failed to create poll: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handlePollClick = () => {
    setPoll(!poll);
    setMessage("");
    setImages([]);
    setVideos([]);
  };

  const validatePoll = () => {
    if (!pollInfo.description.trim()) {
      toast({
        title: "Error",
        description: "Poll question is required",
        variant: "destructive",
      });
      return false;
    }

    if (pollInfo.options.length < 2) {
      toast({
        title: "Error",
        description: "Poll needs at least 2 options",
        variant: "destructive",
      });
      return false;
    }

    if (pollInfo.options.some((option) => !option.text.trim())) {
      toast({
        title: "Error",
        description: "All poll options must have text",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const submitPost = async () => {
    try {
      // posting poll
      if (poll && pollInfo) {
        // Handle poll submission
        if (!validatePoll()) return;

        console.log("pollInfo:", pollInfo);

        await createPollMutation.mutateAsync(pollInfo);

        setPoll(false);
        setPollInfo(initialPollData);
        // return;
      } else {
        // posting content(text) and other media
        const mediaUrls: string[] = [];

        // Upload images
        if (images.length > 0) {
          setUploadStatus((prev) => ({ ...prev, images: "loading" }));
          for (const image of images) {
            const uploadResponse = await FileUploadService.uploadFile(image);
            if (uploadResponse.file) {
              mediaUrls.push(uploadResponse.file.url);
            } else {
              throw new Error("Image upload failed");
            }
          }
          setUploadStatus((prev) => ({ ...prev, images: "success" }));
        }

        // Upload videos
        if (videos.length > 0) {
          setUploadStatus((prev) => ({ ...prev, videos: "loading" }));
          for (const video of videos) {
            const uploadResponse = await FileUploadService.uploadFile(video);
            if (uploadResponse.file) {
              mediaUrls.push(uploadResponse.file.url);
            } else {
              throw new Error("Video upload failed");
            }
          }
          setUploadStatus((prev) => ({ ...prev, videos: "success" }));
        }

        if (!user) {
          console.log("User is not valid:");
          return;
        }
        // Submit the post
        const postData = {
          content: message,
          media: mediaUrls,
          author: {
            id: user.employee.id,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            profileImage: user.profileImage,
          },
        };

        if (!postData.content && mediaUrls.length <= 0) {
          toast({
            title: "Error",
            description: "Please enter some content or upload media.",
            variant: "destructive",
          });
          return;
        }

        await createPostMutation.mutateAsync(postData);
      }

      // Reset form after successful submission
      setMessage("");
      setImages([]);
      setVideos([]);
      setPoll(false);
      setPollInfo(initialPollData);
      setError(null);
    } catch (error) {
      console.error("Error submitting post:", error);
      setError("Failed to submit post. Please try again.");
    } finally {
      setSubmissionStatus("idle");
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

  const isSubmitting =
    uploadStatus.images === "loading" ||
    uploadStatus.videos === "loading" ||
    submissionStatus === "loading" ||
    createPollMutation.isPending;

  return (
    <main className="flex-col flex space-y-1 bg-white px-2 py-4 rounded-b-2xl">
      <div className="relative flex items-start gap-1">
        <Avatar>
          <AvatarImage src={user?.profileImage} alt="Avatar" />
          <AvatarFallback>{user?.employee.firstName}</AvatarFallback>
        </Avatar>
        {!poll ? (
          <>
            <TextareaAutosize
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder=" "
              maxRows={4}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                color: "",
                backgroundColor: "transparent",
                borderColor: "transparent",
              }}
              className="outline-none resize-none"
            />
            {/* Custom Placeholder */}
            {!message && (
              <div className="absolute inset-0 flex items-center  pointer-events-none pl-12  text-gray-600">
                <p className="text-[#939393] font-semibold">
                  Write something ...
                </p>
                <img src="/Edit.svg" alt="Edit" className="ml-2 " />
              </div>
            )}
          </>
        ) : (
          <div className="w-full space-y-2">
            <div>
              <label className="font-semibold text-sm">Question</label>
              <Input
                placeholder="Write poll question..."
                className="border shadow-none w-full"
                value={pollInfo.description}
                onChange={(e) =>
                  setPollInfo({ ...pollInfo, description: e.target.value })
                }
              />
            </div>
            <>
              <p className="font-semibold text-sm">Options</p>
              {pollInfo.options.map((option, index) => (
                <Input
                  key={index}
                  placeholder={`Option ${index + 1}`}
                  className="border shadow-none w-full"
                  value={option.text}
                  onChange={(e) =>
                    handlePollOptionChange(index, e.target.value)
                  }
                />
              ))}
            </>

            <section className="space-y-2">
              <Button
                variant={"ghost"}
                className="text-rgtpurple font-semibold cursor-pointer"
                onClick={addPollOption}
              >
                <Plus /> Add Option
              </Button>
              <div className="flex justify-between items-center gap-2 sm:flex-row">
                <div className="flex flex-col gap-1 ">
                  <p className=" text-slate-500 font-semibold text-sm">
                    Is poll anonymous
                  </p>
                  <div className="flex gap-2 text-sm">
                    <label className="gap-1 flex">
                      Yes
                      <input
                        type="radio"
                        value="yes"
                        name="isAnonymous"
                        checked={pollInfo.isAnonymous === true}
                        onChange={() =>
                          setPollInfo({ ...pollInfo, isAnonymous: true })
                        }
                      />
                    </label>
                    <label className="gap-1 flex">
                      No
                      <input
                        type="radio"
                        value="no"
                        name="isAnonymous"
                        checked={pollInfo.isAnonymous === false}
                        onChange={() =>
                          setPollInfo({ ...pollInfo, isAnonymous: false })
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1 ">
                  <p className=" text-slate-500 font-semibold text-sm">
                    Allow comments
                  </p>
                  <div className="flex gap-2 text-sm">
                    <label className="gap-1 flex">
                      Yes
                      <input
                        type="radio"
                        value="yes"
                        name="allowComments"
                        checked={pollInfo.allowComments === true}
                        onChange={() =>
                          setPollInfo({ ...pollInfo, allowComments: true })
                        }
                      />
                    </label>
                    <label className="gap-1 flex">
                      No
                      <input
                        type="radio"
                        value="no"
                        name="allowComments"
                        checked={pollInfo.allowComments === false}
                        onChange={() =>
                          setPollInfo({ ...pollInfo, allowComments: false })
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex sm:justify-between space-y-3 sm:space-y-0 flex-col sm:flex-row">
                <div className="flex w-1/2 flex-col">
                  <label className="text-xs text-slate-500 font-semibold">
                    Type
                  </label>
                  <CustomSelect
                    placeholder="Choose poll type"
                    options={[
                      { label: "Single Choice", value: "single_choice" },
                      { label: "Multiple Choice", value: "multiple_choice" },
                    ]}
                    value={
                      pollInfo.type === "single_choice"
                        ? "single_choice"
                        : pollInfo.type === "multiple_choice"
                        ? "multiple_choice"
                        : ""
                    }
                    className="w-fit h-full"
                    onChange={(value) =>
                      setPollInfo({
                        ...pollInfo,
                        type:
                          value === "single_choice"
                            ? "single_choice"
                            : "multiple_choice",
                      })
                    }
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-2 sm:w-1/2 sm:justify-end">
                  <div className="flex-col flex">
                    <label className="text-xs text-slate-500 font-semibold">
                      From
                    </label>
                    <DatePicker
                      className="bg-transparent"
                      onChange={() => console.log("")}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-slate-500 font-semibold">
                      To
                    </label>
                    <DatePicker
                      className="bg-transparent"
                      onChange={() => console.log("")}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm p-2 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      {!poll ? (
        <>
          <div className="flex items-center gap-2">
            {/* Display selected images */}
            <div className="flex flex-wrap gap-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative">
                    <img
                      src={url}
                      alt={`Selected Image ${index}`}
                      className="w-18 h-18 object-cover rounded-lg cursor-pointer transition-all duration-300 ease-in hover:brightness-75"
                      onClick={() => openPreview("image", url)}
                    />
                    <X
                      size={18}
                      onClick={() => removeImage(index)}
                      className="absolute top-0 cursor-pointer left-0 p-1 bg-white border text-black rounded-full"
                    />
                  </div>
                  {renderUploadStatus("images")}
                </div>
              ))}
            </div>

            {/* Display selected videos */}
            <div className="flex flex-wrap gap-2">
              {videoUrls.map((url, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative">
                    <video
                      src={url}
                      className="w-18 h-18 object-cover rounded-lg cursor-pointer transition-all duration-300 ease-in hover:brightness-75"
                      onClick={() => openPreview("video", url)}
                    />
                    <X
                      size={18}
                      onClick={() => removeVideo(index)}
                      className="absolute top-0 cursor-pointer left-0 p-1 bg-white border text-black rounded-full"
                    />
                  </div>
                  {renderUploadStatus("videos")}
                </div>
              ))}
            </div>
          </div>

          {/* Preview Modal */}
          {previewItem && (
            <div
              className="fixed inset-0 bg-black/70 flex items-center justify-center cursor-pointer"
              style={{ zIndex: "160" }}
              onClick={closePreview}
            >
              <div className="bg-white p-4 rounded-lg max-w-4xl max-h-full overflow-auto">
                {previewItem.type === "image" ? (
                  <img
                    src={previewItem.url}
                    alt="Preview"
                    className="sm:max-w-md sm:max-h-md aspect-video"
                  />
                ) : (
                  <video
                    src={previewItem.url}
                    controls
                    className="sm:max-w-md sm:max-h-md"
                  />
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
      <div className="bg-[#EFE7FF] text-[#2D264B] font-semibold text-sm py-1 px-2 rounded-[8px] w-fit flex items-center gap-1 cursor-pointer transition-all duration-300 ease-in hover:bg-rgtpurpleaccent2">
        <Globe />
        <p>Everyone can view</p>
      </div>
      <div className="flex">
        {/* Creating actions */}
        <div className="bg-rgtpink w-[75%] sm:w-[85%] p-4 rounded-bl-2xl flex items-center justify-evenly text-white font-medium">
          <div className="flex space-x-1 cursor-pointer transition-colors duration-300 ease-in  hover:bg-[#d55991] p-2 rounded-lg">
            <label htmlFor="image-upload" className="cursor-pointer flex gap-2">
              <PhotoIcon />
              <p className="hidden sm:block">Photo</p>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              multiple
              style={{ display: "none" }}
            />
          </div>
          <div className="flex space-x-1 cursor-pointer transition-colors duration-300 ease-in  hover:bg-[#d55991] p-2 rounded-lg">
            <label htmlFor="video-upload" className="cursor-pointer flex gap-2">
              <VideoIcon />
              <p className="hidden sm:block">Video</p>
            </label>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              multiple
              style={{ display: "none" }}
            />
          </div>
          <div
            className="flex space-x-1 cursor-pointer transition-colors duration-300 ease-in  hover:bg-[#d55991] p-2 rounded-lg"
            onClick={handlePollClick}
          >
            <PollIcon />
            <p className="hidden sm:block">Poll</p>
          </div>
        </div>
        <button
          // className="flex-1 bg-green-600"
          className="flex-1 flex bg-purpleaccent2 rounded-br-2xl hover:bg-[#dfd2f8] transition-colors duration-300 ease-in cursor-pointer items-center justify-center"
          onClick={submitPost}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader size={20} className="animate-spin text-slate-500" />
          ) : (
            <SendIcon className="p-4 rounded-br-2xl cursor-pointer w-16 h-16  hover:fill-rgtpink transition-all duration-300 ease-in fill-[#2D264B]" />
          )}
        </button>
      </div>
    </main>
  );
};

export default CreatePost;
