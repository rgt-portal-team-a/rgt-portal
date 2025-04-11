// toastService.ts
import { toast, Bounce, ToastOptions, ToastContent } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Default configuration for all toast notifications
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
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
   * Show success notification
   * @param message Message to display
   * @param options Optional toast configuration to override defaults
   */
  success: (message: ToastContent, options?: ToastOptions) => {
    return toast.success(message, { ...defaultOptions, ...options });
  },

  /**
   * Show error notification
   * @param message Message to display
   * @param options Optional toast configuration to override defaults
   */
  error: (message: ToastContent, options?: ToastOptions) => {
    return toast.error(message, { ...defaultOptions, ...options });
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
   * Show warning notification
   * @param message Message to display
   * @param options Optional toast configuration to override defaults
   */
  warning: (message: ToastContent, options?: ToastOptions) => {
    return toast.warning(message, { ...defaultOptions, ...options });
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
