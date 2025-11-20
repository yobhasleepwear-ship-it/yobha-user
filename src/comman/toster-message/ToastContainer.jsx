import React, { useState, useEffect } from "react";

let toastHandler = null;

export const message = {
  success: (msg, duration) => toastHandler && toastHandler("success", msg, duration),
  error: (msg, duration) => toastHandler && toastHandler("error", msg, duration),
  info: (msg, duration) => toastHandler && toastHandler("info", msg, duration),
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  // function to add a toast
  const addToast = (type, message, duration = 2000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  // set the global handler
  useEffect(() => {
    toastHandler = addToast;
    return () => {
      toastHandler = null;
    };
  }, []);

  const getBgColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="fixed inset-x-4 top-32 sm:inset-x-auto sm:top-28 sm:right-5 lg:top-24 z-[2000] flex flex-col gap-2 items-center sm:items-end pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${getBgColor(t.type)} text-white px-4 py-2 rounded shadow-lg w-full sm:w-auto max-w-sm pointer-events-auto`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
