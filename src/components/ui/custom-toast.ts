import { toast } from "sonner";

interface ToastOptions {
  [key: string]: unknown;
}

export const customToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      ...options,
      classNames: {
        description: "sonner-description-dark",
      },
      style: {
        backgroundColor: "rgb(220, 252, 231)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: "2px",
        borderStyle: "solid",
        color: "rgb(0, 0, 0)",
      },
    });
  },
  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      ...options,
      classNames: {
        description: "sonner-description-dark",
      },
      style: {
        backgroundColor: "rgb(254, 226, 226)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: "2px",
        borderStyle: "solid",
        color: "rgb(0, 0, 0)",
      },
    });
  },
  info: (message: string, options?: ToastOptions) => {
    return toast.info(message, {
      ...options,
      classNames: {
        description: "sonner-description-dark",
      },
      style: {
        backgroundColor: "rgb(219, 234, 254)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: "2px",
        borderStyle: "solid",
        color: "rgb(0, 0, 0)",
      },
    });
  },
  warning: (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
      ...options,
      classNames: {
        description: "sonner-description-dark",
      },
      style: {
        backgroundColor: "rgb(254, 243, 199)",
        borderColor: "rgb(234, 179, 8)",
        borderWidth: "2px",
        borderStyle: "solid",
        color: "rgb(0, 0, 0)",
      },
    });
  },
};
