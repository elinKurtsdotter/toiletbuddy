import { toast } from "sonner";

export { toast };

// Custom toast functions with colors
export const customToast = {
  success: (message: string, options?: any) => {
    return toast.success(message, {
      ...options,
      style: {
        backgroundColor: "rgb(220, 252, 231)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: "2px",
        borderStyle: "solid",
      },
    });
  },
  error: (message: string, options?: any) => {
    return toast.error(message, {
      ...options,
      style: {
        backgroundColor: "rgb(254, 226, 226)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: "2px",
        borderStyle: "solid",
      },
    });
  },
  info: (message: string, options?: any) => {
    return toast.info(message, {
      ...options,
      style: {
        backgroundColor: "rgb(219, 234, 254)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: "2px",
        borderStyle: "solid",
      },
    });
  },
  warning: (message: string, options?: any) => {
    return toast.warning(message, {
      ...options,
      style: {
        backgroundColor: "rgb(254, 243, 199)",
        borderColor: "rgb(234, 179, 8)",
        borderWidth: "2px",
        borderStyle: "solid",
      },
    });
  },
};
