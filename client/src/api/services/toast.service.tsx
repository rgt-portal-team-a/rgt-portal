
import React from "react";
import { toast, Bounce, ToastOptions, ToastContent } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Bubbles from "@/assets/icons/Bubbles";
import WarningBubbles from "@/assets/icons/WarningBubbles";
import WarningIcon from "@/assets/icons/WarningIcon";
import FailIcon from "@/assets/icons/FailIcon";
import SuccessBubbles from "@/assets/icons/SuccessBubbles";
import SuccessIcon from "@/assets/icons/SuccessIcon";


interface ToastProps {
  message: string;
  closeToast?: () => void;
}

// Custom toast content component for success notification
const SuccessToast = ({ message, closeToast }: ToastProps) => (
  <div className="relative">
    {/* Left icon */}
    <div className="absolute left-4 -top-10 z-2">
      <SuccessIcon color={"#2C7721"} />
    </div>

    <div className="relative flex items-center p-4 rounded-3xl shadow-lg min-w-90 h-[120px] overflow-hidden bg-[#4EC33D]">
      {/* Content */}
      <div className="flex-1 ml-25">
        <p className="text-white text-xl font-semibold">Well done!</p>
        <p className="text-white text-sm opacity-90">
          {message || "You successfully read this important message."}
        </p>
      </div>


      {/* Background bubbles */}
      <div className="absolute left-0 bottom-0 opacity-30">
        <SuccessBubbles color={"#2C7721"} />
      </div>

      {/* Close button */}
      <button
        onClick={closeToast}
        type="button"
        className="absolute top-2 right-3 text-white"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  </div>
);

// Custom toast content component for warning notification
const WarningToast = ({ message, closeToast }: ToastProps) => (
  <div className="relative">
    {/* Left icon */}
    <div className="absolute left-4 -top-10 z-2">
      <WarningIcon color={"#B15500"} />
    </div>
    <div className="relative flex items-center p-4 rounded-3xl shadow-lg min-w-90 h-[120px] overflow-hidden bg-[#F88F01]">
      {/* Content */}
      <div className="flex-1 ml-25  ">
        <p className="text-white text-2xl font-semibold">Warning!</p>
        <p className="text-white text-sm opacity-90">
          {message || "Sorry! There was a problem with your request."}
        </p>
      </div>

      {/* Background bubbles */}
      <div className="absolute left-0 bottom-0 opacity-30">
        <WarningBubbles color={"#B15500"} />
      </div>

      {/* Close button */}
      <button         
        onClick={closeToast}
        type="button"
        className="absolute top-2 right-3 text-white">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  </div>
);

// Custom toast content component for error notification
const ErrorToast = ({ message, closeToast }: ToastProps) => (
  <div className="relative">
    {/* Left icon */}
    <div className="absolute left-4 -top-10 z-2">
      <FailIcon color={"#940000"} />
    </div>

    <div className="relative flex items-center p-4 rounded-3xl shadow-lg min-w-90 h-[120px] overflow-hidden bg-[#FC2E20]">
      {/* Content */}
      <div className="flex-1 ml-25">
        <p className="text-white text-xl font-semibold">Oh snap!</p>
        <p className="text-white text-sm opacity-90">
          {message || "Change a few things up and try submitting again."}
        </p>
      </div>

      {/* Background bubbles */}
      <div className="absolute left-0 bottom-0 ">
        <Bubbles color={"#940000"} />
      </div>

      {/* Close button */}
      <button
        onClick={closeToast}
        type="button"
        className="absolute top-2 right-3 text-white"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  </div>
);

// Default configuration for all toast notifications
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: true, // Hide progress bar since our custom toasts don't need it
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  transition: Bounce,
};

// Custom toast service with predefined notification types
const toastService = {
  /**
   * Show success notification with custom UI
   * @param message Message to display
   * @param options Optional toast configuration to override defaults
   */
  success: (message: ToastContent, options?: ToastOptions) => {
    const stringMessage =
      typeof message === "string"
        ? message
        : "You successfully read this important message.";
    return toast(<SuccessToast message={stringMessage} />, {
      ...defaultOptions,
      closeButton: false,
      style: {
        background: "transparent",
        boxShadow: "none",
        padding: 0,
        margin: "30px 25px 4px 0px",
      },
      ...options,
    });
  },

  /**
   * Show error notification with custom UI
   * @param message Message to display
   * @param options Optional toast configuration to override defaults
   */
  error: (message: ToastContent, options?: ToastOptions) => {
    const stringMessage =
      typeof message === "string"
        ? message
        : "Change a few things up and try submitting again.";
    return toast(<ErrorToast message={stringMessage} />, {
      ...defaultOptions,
      closeButton: false,
      style: {
        background: "transparent",
        boxShadow: "none",
        padding: 0,
        margin: "30px 25px 4px 0px",
      },
      ...options,
    });
  },

  /**
   * Show info notification
   * @param message Message to display
   * @param options Optional toast configuration to override defaults
   */
  info: (message: ToastContent, options?: ToastOptions) => {
    return toast.info(message, { ...defaultOptions, ...options });
  },

  /**
   * Show warning notification with custom UI
   * @param message Message to display
   * @param options Optional toast configuration to override defaults
   */
  warning: (message: ToastContent, options?: ToastOptions) => {
    const stringMessage =
      typeof message === "string"
        ? message
        : "Sorry! There was a problem with your request.";
    return toast(<WarningToast message={stringMessage} />, {
      ...defaultOptions,
      closeButton: false,
      style: {
        background: "transparent",
        boxShadow: "none",
        padding: 0,
        margin: "30px 25px 4px 0px",
      },
      ...options,
    });
  },

  /**
   * Show default notification
   * @param message Message to display
   * @param options Optional toast configuration to override defaults
   */
  default: (message: ToastContent, options?: ToastOptions) => {
    return toast(message, { ...defaultOptions, ...options });
  },
};

export default toastService;
