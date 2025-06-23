import React, { useState, useEffect } from "react";

const ToastMessage = ({
  message,
  variant = "info",
}: {
  message: string;
  variant?: ToastVariant;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [toastClass, setToastClass] = useState("");

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      // Automatically hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    switch (variant) {
      case "success":
        setToastClass("bg-green-500 border-green-700");
        break;
      case "error":
        setToastClass("bg-red-500 border-red-700");
        break;
      case "warning":
        setToastClass("bg-yellow-500 border-yellow-700");
        break;
      case "info":
      default:
        setToastClass("bg-blue-500 border-blue-700");
        break;
    }
  }, [variant]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white text-center border-l-4 transition-opacity duration-300 ${toastClass}`}
    >
      {message}
    </div>
  );
};

export default ToastMessage;
