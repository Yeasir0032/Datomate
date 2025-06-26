import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface JsonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  title?: string;
}

interface EditableEntry {
  originalKey: string;
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "object" | "array";
}

const JsonEditorModal: React.FC<JsonEditorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  title = "Edit JSON",
}) => {
  const [entries, setEntries] = useState<EditableEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && initialData) {
      const editableEntries: EditableEntry[] = Object.entries(initialData).map(
        ([key, value]) => {
          let type: EditableEntry["type"] = "string";
          let stringValue = "";

          if (typeof value === "number") {
            type = "number";
            stringValue = value.toString();
          } else if (typeof value === "boolean") {
            type = "boolean";
            stringValue = value.toString();
          } else if (Array.isArray(value)) {
            type = "array";
            stringValue = JSON.stringify(value);
          } else if (typeof value === "object" && value !== null) {
            type = "object";
            stringValue = JSON.stringify(value);
          } else {
            stringValue = String(value);
          }

          return {
            originalKey: key,
            key,
            value: stringValue,
            type,
          };
        }
      );

      setEntries(editableEntries);
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateEntry = (
    entry: EditableEntry,
    index: number
  ): string | null => {
    // Check for duplicate keys
    const duplicateKeyIndex = entries.findIndex(
      (e, i) => i !== index && e.key === entry.key
    );
    if (duplicateKeyIndex !== -1) {
      return "Duplicate key found";
    }

    return null;
  };

  const updateEntry = (
    index: number,
    field: "key" | "value" | "type",
    newValue: string
  ) => {
    const updatedEntries = [...entries];
    if (field === "type") {
      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: newValue as EditableEntry["type"],
      };

      // Convert value when type changes
      const currentValue = updatedEntries[index].value;
      if (
        newValue === "boolean" &&
        currentValue !== "true" &&
        currentValue !== "false"
      ) {
        updatedEntries[index].value = "false";
      } else if (newValue === "number" && isNaN(Number(currentValue))) {
        updatedEntries[index].value = "0";
      } else if (
        (newValue === "object" || newValue === "array") &&
        currentValue
      ) {
        try {
          JSON.parse(currentValue);
        } catch {
          updatedEntries[index].value = newValue === "array" ? "[]" : "{}";
        }
      }
    } else {
      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: newValue,
      };
    }

    setEntries(updatedEntries);

    // Validate the updated entry
    const error = validateEntry(updatedEntries[index], index);
    const newErrors = { ...errors };
    if (error) {
      newErrors[`${index}`] = error;
    } else {
      delete newErrors[`${index}`];
    }
    setErrors(newErrors);
  };

  const addEntry = () => {
    const newEntry: EditableEntry = {
      originalKey: "",
      key: "",
      value: "",
      type: "string",
    };
    setEntries([...entries, newEntry]);
  };

  const removeEntry = (index: number) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);

    // Remove any errors for this entry
    const newErrors = { ...errors };
    delete newErrors[`${index}`];
    setErrors(newErrors);
  };

  const handleSubmit = () => {
    // Validate all entries
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    entries.forEach((entry, index) => {
      const error = validateEntry(entry, index);
      if (error) {
        newErrors[`${index}`] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (hasErrors) {
      return;
    }

    // Convert entries back to object
    const result: Record<string, any> = {};
    entries.forEach((entry) => {
      let convertedValue: any = entry.value;

      switch (entry.type) {
        case "number":
          convertedValue = Number(entry.value);
          break;
        case "boolean":
          convertedValue = entry.value === "true";
          break;
        case "object":
        case "array":
          convertedValue = JSON.parse(entry.value);
          break;
      }

      result[entry.key] = convertedValue;
    });

    onSubmit(result);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl lg:max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className=" p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <button
            title="Editing this value may affect data consistency within the table."
            className="text-gray-600 dark:text-gray-400 pt-1"
          >
            Edits may affect data consistency.
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Key
                  </label>
                  <input
                    type="text"
                    value={entry.key}
                    onChange={(e) => updateEntry(index, "key", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter key"
                  />
                </div>

                <button
                  onClick={() => removeEntry(index)}
                  className="self-start sm:self-end p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 
                           rounded-md transition-colors"
                  title="Remove entry"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value
                </label>
                {entry.type === "boolean" ? (
                  <select
                    value={entry.value}
                    onChange={(e) =>
                      updateEntry(index, "value", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <textarea
                    value={entry.value}
                    onChange={(e) =>
                      updateEntry(index, "value", e.target.value)
                    }
                    rows={
                      entry.type === "object" || entry.type === "array" ? 3 : 1
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder={`Enter ${entry.type} value`}
                  />
                )}
              </div>

              {errors[`${index}`] && (
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                  {errors[`${index}`]}
                </p>
              )}
            </div>
          ))}

          <button
            onClick={addEntry}
            className="w-full py-2 px-4 text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 
                     rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 
                     dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
          >
            + Add New Entry
          </button>
        </div>
        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                     bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                     hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={Object.keys(errors).length > 0}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 
                     rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed 
                     transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonEditorModal;
