import {
  Calendar,
  FileText,
  Hash,
  Type,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  Globe,
  Tag,
  List,
  Layers,
  ChevronDown,
  ChevronRight,
  Edit,
  Download,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import MoreMenuButton from "../more-menu-button";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";

const RegistrydocumItem = ({
  docum,
  docRefString,
  removeFromList,
  setLoading,
}: {
  docum: ScanDocument;
  docRefString: string;
  removeFromList: (id: string) => void;
  setLoading: Function;
}) => {
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>(
    {}
  );
  const getFieldIcon = (key: string, value: any) => {
    const lowerKey = key.toLowerCase();

    if (Array.isArray(value)) return <List className="w-4 h-4" />;
    if (typeof value === "object" && value !== null)
      return <Layers className="w-4 h-4" />;
    if (lowerKey.includes("email")) return <Mail className="w-4 h-4" />;
    if (lowerKey.includes("phone") || lowerKey.includes("mobile"))
      return <Phone className="w-4 h-4" />;
    if (lowerKey.includes("address") || lowerKey.includes("location"))
      return <MapPin className="w-4 h-4" />;
    if (lowerKey.includes("company") || lowerKey.includes("organization"))
      return <Building className="w-4 h-4" />;
    if (lowerKey.includes("name") && !lowerKey.includes("company"))
      return <User className="w-4 h-4" />;
    if (lowerKey.includes("website") || lowerKey.includes("url"))
      return <Globe className="w-4 h-4" />;
    if (lowerKey.includes("tag") || lowerKey.includes("category"))
      return <Tag className="w-4 h-4" />;
    if (typeof value === "number") return <Hash className="w-4 h-4" />;
    if (typeof value === "string") return <Type className="w-4 h-4" />;

    return <FileText className="w-4 h-4" />;
  };
  const menuactions: MenuAction[] = [
    {
      id: "edit",
      label: "Edit",
      icon: Edit,
      onClick: () => console.log("Edit clicked"),
    },
    {
      id: "export",
      label: "Export",
      icon: Download,
      onClick: () => {
        const csv = JSON.stringify(docum.data);
        const blob = new Blob([csv], {
          type: "text/json;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${docum.id}.json`;
        link.click();

        URL.revokeObjectURL(url);
      },
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      onClick: async () => {
        setLoading(true);
        try {
          const documRef = doc(db, docRefString, docum.id);
          await deleteDoc(documRef);
          removeFromList(docum.id);
        } catch (error) {
          console.log(error);
        }
        setLoading(false);
      },
    },
  ];
  const formatFieldName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, " ");
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const toggleFieldExpansion = (fieldKey: string) => {
    setExpandedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };
  const getdocumentTitle = (data: Record<string, any>): string => {
    const titleFields = [
      "name",
      "title",
      "productName",
      "invoiceNumber",
      "eventName",
      "documentName",
      "documentType",
    ];

    for (const field of titleFields) {
      if (data[field]) {
        return String(data[field]);
      }
    }

    const firstKey = Object.keys(data)[0];
    return firstKey
      ? `${formatFieldName(firstKey)}: ${
          typeof data[firstKey] === "object" ? "Object" : String(data[firstKey])
        }`
      : "Untitled document";
  };

  const getdocumentSubtitle = (data: Record<string, any>): string => {
    const subtitleFields = [
      "company",
      "brand",
      "customerName",
      "venue",
      "category",
      "type",
      "fileName",
      "photoName",
    ];

    for (const field of subtitleFields) {
      if (data[field]) {
        return String(data[field]);
      }
    }

    const keys = Object.keys(data);
    if (keys.length > 1) {
      const secondKey = keys[1];
      const value = data[secondKey];
      return `${formatFieldName(secondKey)}: ${
        typeof value === "object" ? "Object" : String(value)
      }`;
    }

    return `${Object.keys(data).length} fields`;
  };
  const RenderArrayValue = (
    value: any,
    key: string,
    depth = 0
  ): React.JSX.Element => {
    const fieldKey = `${key}-${depth}`;
    const isExpanded = expandedFields[fieldKey];
    const maxPreviewItems = 2;

    if (value.length === 0) {
      return <span className="text-gray-400 italic">Empty array</span>;
    }

    // Check if all items are simple values (strings, numbers, booleans)
    const allSimple = value.every(
      (item: any) =>
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
    );

    if (allSimple && value.length <= 3) {
      // Show simple arrays inline if they're short
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item: any, index: number) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <button
          onClick={() => toggleFieldExpansion(fieldKey)}
          className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 mr-1" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-1" />
          )}
          <span>{value.length} items</span>
        </button>

        {/* {!isExpanded && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {value.slice(0, maxPreviewItems).map((item: any, index: number) => (
              <div key={index} className="truncate">
                {allSimple
                  ? String(item)
                  : `Item ${index + 1}: ${
                      typeof item === "object" ? "Object" : String(item)
                    }`}
              </div>
            ))}
            {value.length > maxPreviewItems && (
              <div className="text-xs text-gray-400">
                +{value.length - maxPreviewItems} more...
              </div>
            )}
          </div>
        )} */}

        {isExpanded && (
          <div className="ml-4 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            {value.map((item: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Item {index + 1}
                </div>
                {typeof item === "object" && item !== null ? (
                  <div className="space-y-2">
                    {RenderObjectValue(item, `${key}-${index}`, depth + 1)}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {String(item)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  const RenderObjectValue = (
    value: Record<string, any>,
    key: string,
    depth = 0
  ): React.JSX.Element => {
    const fieldKey = `${key}-${depth}`;
    const isExpanded = expandedFields[fieldKey];
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return <span className="text-gray-400 italic">Empty object</span>;
    }

    return (
      <div className="space-y-2">
        <button
          onClick={() => toggleFieldExpansion(fieldKey)}
          className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 mr-1" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-1" />
          )}
          <span>{entries.length} properties</span>
        </button>

        {isExpanded && (
          <div className="ml-4 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            {entries.map(([k, v]) => (
              <div key={k} className="flex items-start text-sm">
                <div className="flex items-center mr-3 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {getFieldIcon(k, v)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatFieldName(k)}:
                  </span>
                  <div className="ml-2 mt-1">
                    {renderFieldValue(v, `${key}-${k}`, depth + 1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  const renderFieldValue = (value: any, key: string, depth = 0) => {
    if (Array.isArray(value)) {
      return RenderArrayValue(value, key, depth);
    }

    if (typeof value === "object" && value !== null) {
      return RenderObjectValue(value, key, depth);
    }

    if (typeof value === "boolean") {
      return (
        <span
          className={`inline-block px-2 py-1 text-xs rounded-md ${
            value
              ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      );
    }

    return <span className="break-words">{String(value)}</span>;
  };
  return (
    <div
      key={docum.id}
      className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
            {getdocumentTitle(docum.data)}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2">
            {getdocumentSubtitle(docum.data)}
          </p>
        </div>
        <MoreMenuButton actions={menuactions} />
      </div>

      <div className="space-y-3 sm:space-y-4">
        {Object.entries(docum.data).map(([key, value]) => (
          <div
            key={key}
            className="flex items-start text-sm sm:text-base text-gray-600 dark:text-gray-300"
          >
            <div className="flex items-center mr-3 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0">
              {getFieldIcon(key, value)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {formatFieldName(key)}:
              </span>
              <div className="mt-1">
                {renderFieldValue(value, `${docum.id}-${key}`)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
          <span>Scanned {formatDate(docum.scannedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default RegistrydocumItem;
