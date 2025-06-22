import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

const MoreMenuButton = ({
  actions,
  className = "",
  mainIcon,
}: {
  actions: MenuAction[];
  className?: string;
  mainIcon?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<any>(null);
  const buttonRef = useRef<any>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuItemClick = (e: React.MouseEvent, action: MenuAction) => {
    e.stopPropagation();
    setIsOpen(false);
    if (action.onClick) {
      action.onClick();
    }
  };
  const getActionStyles = (action: MenuAction) => {
    if (action.variant === "destructive") {
      return "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20";
    }
    return "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        title="More"
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {mainIcon ? (
          mainIcon
        ) : (
          <MoreVertical className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50"
        >
          <div className="py-1">
            {actions.map((action: MenuAction, index) => (
              <button
                key={action.id || index}
                onClick={(e) => handleMenuItemClick(e, action)}
                disabled={action.disabled}
                className={`flex items-center w-full px-3 py-2 text-sm transition-colors ${getActionStyles(
                  action
                )} ${action.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default MoreMenuButton;
