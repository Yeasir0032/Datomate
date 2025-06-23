"use client";
import React, { useEffect, useState } from "react";
import {
  Plus,
  X,
  Save,
  Eye,
  Database,
  FileSpreadsheet,
  Download,
  ChevronDown,
  ChevronUp,
  List,
  Layers,
  Upload,
} from "lucide-react";
import {
  generateFieldAttributes,
  generatePreviewJSON,
  reverseFieldAttributes,
} from "@/lib/utils";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "../components/loading";

export default function DataStructureSetup({ uid }: { uid: string }) {
  const [structure, setStructure] = useState<DataStructure>({
    name: "",
    description: "",
    fields: [],
  });
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    async function checkForEdit() {
      const sc = searchParams.get("sc");
      if (sc) {
        setLoading(true);
        const scannerDocRef = doc(db, "Users", uid, "Scanners", sc);
        const snapshot = await getDoc(scannerDocRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setStructure({
            ...structure,
            name: data.name,
            description: data.description,
            fields: reverseFieldAttributes(data.fields),
          });
          setEditMode(sc);
        }
        setLoading(false);
      }
    }
    checkForEdit();
  }, []);

  const fieldTypes = [
    "text",
    "number",
    "email",
    "phone",
    "date",
    "boolean",
    "url",
    "currency",
    "object",
  ];

  const submitScanProfile = async () => {
    setLoading(true);
    try {
      const userDocRef = doc(db, "Users", uid);
      const scannerCollectionRef = collection(userDocRef, "Scanners");
      if (editMode) {
        const scannerDocRef = doc(userDocRef, "Scanners", editMode);
        const scannerDoc = await getDoc(scannerDocRef);
        if (scannerDoc.exists()) {
          await updateDoc(scannerDocRef, {
            name: structure.name,
            description: structure.description,
            fields: generateFieldAttributes(structure.fields),
          });
          router.push(`/scanner/${editMode}`);
        }
      } else {
        const response = await addDoc(scannerCollectionRef, {
          name: structure.name,
          description: structure.description,
          fields: generateFieldAttributes(structure.fields),
          scans: 0,
          lastUsed: new Date().toISOString(),
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const addField = (parentId?: string, level: number = 0) => {
    const newField: DataField = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: "",
      type: undefined,
      isArray: false,
      autoDetect: true,
      collapsed: true,
      children: [],
      level: level,
    };

    setStructure((prev) => {
      if (!parentId) {
        return {
          ...prev,
          fields: [...prev.fields, newField],
        };
      } else {
        return {
          ...prev,
          fields: addFieldToParent(prev.fields, parentId, newField),
        };
      }
    });
  };

  const addFieldToParent = (
    fields: DataField[],
    parentId: string,
    newField: DataField
  ): DataField[] => {
    return fields.map((field) => {
      if (field.id === parentId) {
        return {
          ...field,
          children: [...(field.children || []), newField],
        };
      } else if (field.children && field.children.length > 0) {
        return {
          ...field,
          children: addFieldToParent(field.children, parentId, newField),
        };
      }
      return field;
    });
  };

  const removeField = (id: string) => {
    const fieldElement = document.querySelector(`[data-field-id="${id}"]`);
    if (fieldElement) {
      fieldElement.classList.add("fade-out-animation");
      setTimeout(() => {
        setStructure((prev) => ({
          ...prev,
          fields: removeFieldFromStructure(prev.fields, id),
        }));
      }, 300);
    } else {
      setStructure((prev) => ({
        ...prev,
        fields: removeFieldFromStructure(prev.fields, id),
      }));
    }
  };

  const removeFieldFromStructure = (
    fields: DataField[],
    id: string
  ): DataField[] => {
    return fields
      .filter((field) => field.id !== id)
      .map((field) => ({
        ...field,
        children: field.children
          ? removeFieldFromStructure(field.children, id)
          : [],
      }));
  };

  const updateField = (id: string, updates: Partial<DataField>) => {
    setStructure((prev) => ({
      ...prev,
      fields: updateFieldInStructure(prev.fields, id, updates),
    }));
  };

  const updateFieldInStructure = (
    fields: DataField[],
    id: string,
    updates: Partial<DataField>
  ): DataField[] => {
    return fields.map((field) => {
      if (field.id === id) {
        return { ...field, ...updates };
      } else if (field.children && field.children.length > 0) {
        return {
          ...field,
          children: updateFieldInStructure(field.children, id, updates),
        };
      }
      return field;
    });
  };

  const toggleFieldCollapse = (id: string) => {
    updateField(id, {
      collapsed: !getFieldById(structure.fields, id)?.collapsed,
    });
  };

  const getFieldById = (fields: DataField[], id: string): DataField | null => {
    for (const field of fields) {
      if (field.id === id) return field;
      if (field.children) {
        const found = getFieldById(field.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const renderField = (
    field: DataField,
    index: number,
    parentPath: string = ""
  ) => {
    const fieldPath = parentPath ? `${parentPath}.${index}` : index.toString();
    const indentLevel = field.level * 1.5;

    return (
      <div
        key={field.id}
        data-field-id={field.id}
        className="bg-gray-50 dark:bg-zinc-700 rounded-xl lg:rounded-2xl border border-gray-200 dark:border-zinc-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden mb-3 lg:mb-4"
        style={{
          marginLeft: `${indentLevel}rem`,
          animation: `slideInFromTop 0.3s ease-out ${index * 100}ms both`,
        }}
      >
        {/* Field Header */}
        <div
          className="flex items-center justify-between p-3 lg:p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors duration-200"
          onClick={() => toggleFieldCollapse(field.id)}
        >
          <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
            <span className="text-xs lg:text-sm font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-800 px-2 lg:px-3 py-1 rounded-full transition-colors duration-300 flex-shrink-0">
              Field #{index + 1}
            </span>
            <span className="text-sm lg:text-base text-gray-700 dark:text-gray-300 font-medium transition-colors duration-300 truncate">
              {field.name || "Unnamed Field"}
            </span>
            {field.isArray && (
              <List className="w-3 h-3 lg:w-4 lg:h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
            )}
            {field.type && !field.autoDetect && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded transition-colors duration-300 flex-shrink-0">
                {field.type}
              </span>
            )}
            {field.autoDetect && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded transition-colors duration-300 flex-shrink-0">
                Auto
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
            {field.level < 3 && (field.type === "object" || field.isArray) && (
              <button
                title="Add nested field"
                onClick={(e) => {
                  e.stopPropagation();
                  addField(field.id, field.level + 1);
                }}
                className="text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 transform hover:scale-110"
              >
                <Layers className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
            )}
            <button
              title="Remove field"
              onClick={(e) => {
                e.stopPropagation();
                removeField(field.id);
              }}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 transform hover:scale-110"
            >
              <X className="w-3 h-3 lg:w-4 lg:h-4" />
            </button>
            {field.collapsed ? (
              <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300" />
            ) : (
              <ChevronUp className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300" />
            )}
          </div>
        </div>

        {/* Field Content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            field.collapsed ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
          }`}
        >
          <div className="px-3 lg:px-4 pb-3 lg:pb-4 border-t border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 transition-colors duration-300">
            <div className="space-y-3 lg:space-y-4 pt-3 lg:pt-4">
              {/* Field Name */}
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 lg:mb-2 transition-colors duration-300">
                  Field Name *
                </label>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) =>
                    updateField(field.id, {
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., Full Name, Email, Phone"
                  className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Array Toggle */}
              <div className="flex items-center space-x-2 lg:space-x-3">
                <input
                  type="checkbox"
                  id={`array-${field.id}`}
                  checked={field.isArray}
                  onChange={(e) =>
                    updateField(field.id, {
                      isArray: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor={`array-${field.id}`}
                  className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
                >
                  List
                </label>
              </div>

              {!(field.children && field.children.length > 0) && ( // Add this condition
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <input
                    type="checkbox"
                    id={`auto-${field.id}`}
                    checked={field.autoDetect}
                    onChange={(e) =>
                      updateField(field.id, {
                        autoDetect: e.target.checked,
                        type: e.target.checked ? undefined : "text",
                      })
                    }
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor={`auto-${field.id}`}
                    className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
                  >
                    Detect automatically
                  </label>
                </div>
              )}

              {/* Data Type Selector */}
              {!field.autoDetect && (
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 lg:mb-2 transition-colors duration-300">
                    Data Type
                  </label>
                  <select
                    title="Data type"
                    value={field.type || "text"}
                    onChange={(e) =>
                      updateField(field.id, {
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  >
                    {fieldTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Nested Fields */}
            {field.children && field.children.length > 0 && (
              <div className="mt-4 lg:mt-6 space-y-2 lg:space-y-3">
                <h5 className="text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center">
                  <Layers className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                  Nested Fields
                </h5>
                {field.children.map((childField, childIndex) =>
                  renderField(childField, childIndex, fieldPath)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getAllFields = (fields: DataField[]): DataField[] => {
    let allFields: DataField[] = [];
    fields.forEach((field) => {
      allFields.push(field);
      if (field.children) {
        allFields = allFields.concat(getAllFields(field.children));
      }
    });
    return allFields;
  };

  const isValidStructure =
    structure.name.trim() &&
    getAllFields(structure.fields).every((field) => field.name.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 transition-colors duration-300">
      {loading && <LoadingSpinner />}
      <div className="container mx-auto px-3 lg:px-4 py-4 lg:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl lg:rounded-3xl shadow-2xl dark:shadow-zinc-900/50 overflow-hidden transition-all duration-300">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 px-4 lg:px-8 py-4 lg:py-6">
              <h2 className="text-lg lg:text-2xl font-bold text-white transition-colors duration-300">
                Create Your Data Template
              </h2>
              <p className="text-blue-100 dark:text-blue-200 mt-1 lg:mt-2 text-sm lg:text-base transition-colors duration-300">
                Specify field names and structure - AI will handle the
                complexity
              </p>
            </div>

            <div className="p-4 lg:p-8">
              {/* Basic Information */}
              <div className="mb-6 lg:mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 lg:mb-2 transition-colors duration-300">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={structure.name}
                      onChange={(e) =>
                        setStructure((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Employee Records, Invoice Data"
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 dark:border-zinc-600 rounded-lg lg:rounded-xl bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 lg:mb-2 transition-colors duration-300">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={structure.description}
                      onChange={(e) =>
                        setStructure((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Brief description of this data structure"
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 dark:border-zinc-600 rounded-lg lg:rounded-xl bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Fields Section */}
              <div className="mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 gap-3 sm:gap-0">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    Data Fields
                  </h3>
                  <button
                    onClick={() => addField()}
                    className="inline-flex items-center px-3 lg:px-4 py-2 text-sm lg:text-base bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 text-white rounded-lg lg:rounded-xl hover:from-green-600 hover:to-green-700 dark:hover:from-green-500 dark:hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    Add Field
                  </button>
                </div>

                {structure.fields.length === 0 ? (
                  <div className="text-center py-8 lg:py-12 bg-gray-50 dark:bg-zinc-700 rounded-xl lg:rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-600 transition-all duration-300">
                    <Database className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3 lg:mb-4 transition-colors duration-300" />
                    <p className="text-gray-500 dark:text-gray-400 text-base lg:text-lg mb-3 lg:mb-4 transition-colors duration-300 px-4">
                      Add fields to extract more efficiently.
                    </p>
                    <button
                      onClick={() => addField()}
                      className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base bg-blue-600 dark:bg-blue-500 text-white rounded-lg lg:rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
                    >
                      <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                      Add Your First Field
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 lg:space-y-4">
                    {structure.fields.map((field, index) =>
                      renderField(field, index)
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-between items-center pt-4 lg:pt-6 border-t border-gray-200 dark:border-zinc-600 transition-colors duration-300">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={structure.fields.length === 0}
                  className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg lg:rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 order-2 sm:order-1 w-full sm:w-auto"
                >
                  <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                  {showPreview ? "Hide Preview" : "Preview JSON"}
                </button>

                <div className="flex gap-2 lg:gap-3 order-1 sm:order-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (editMode) {
                        router.push(`/scanner/${editMode}`);
                      } else {
                        router.push("/dashboard");
                      }
                    }}
                    className="inline-flex items-center px-4 lg:px-8 py-2 border lg:py-3 text-sm lg:text-base bg-gradient-to-r  rounded-lg lg:rounded-xl  transition-all duration-300 transform hover:scale-105 shadow-lg flex-1 sm:flex-initial justify-center"
                  >
                    <Upload className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 -rotate-90" />
                    Cancel
                  </button>
                  <button
                    disabled={!isValidStructure}
                    onClick={() => submitScanProfile()}
                    className="inline-flex items-center px-4 lg:px-8 py-2 lg:py-3 text-sm lg:text-base bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-lg lg:rounded-xl hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg flex-1 sm:flex-initial justify-center"
                  >
                    <Save className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    Save & Continue
                  </button>
                </div>
              </div>

              {/* JSON Preview */}
              {showPreview && structure.fields.length > 0 && (
                <div className="mt-6 lg:mt-8 p-4 lg:p-6 bg-gray-900 dark:bg-zinc-900 rounded-xl lg:rounded-2xl border border-gray-800 dark:border-zinc-700 transition-all duration-500 slide-in-animation">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h4 className="text-base lg:text-lg font-semibold text-white transition-colors duration-300">
                      JSON Preview
                    </h4>
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <Database className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                      <FileSpreadsheet className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                      <Download className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                    </div>
                  </div>
                  <pre className="text-green-400 dark:text-green-300 text-xs lg:text-sm overflow-x-auto transition-colors duration-300">
                    {JSON.stringify(generatePreviewJSON(structure), null, 2)}
                  </pre>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 lg:mt-3 transition-colors duration-300">
                    Fields with auto-detection enabled will be dynamically typed
                    by AI during scanning. Nested structures and arrays are
                    fully supported.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
