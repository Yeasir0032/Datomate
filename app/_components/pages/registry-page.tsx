"use client";
import React, { useState, useRef } from "react"; // Import useRef
import {
  Search,
  Settings,
  Plus,
  Camera,
  Upload,
  FileText,
  ChevronLeft,
  Table,
  List,
} from "lucide-react";
import { generateFieldString } from "@/lib/utils";
import { useRouter } from "next/navigation";
import RegistryDocItem from "../components/registry/registry-doc-item";
import LoadingSpinner from "../components/loading";
import RegistryTable from "../components/registry/registry-table-display";
import ExportButtonMenu from "../components/registry/export-button";
import ToastMessage from "../components/ui/toast";

interface ScanDocument {
  id: string;
  scannedAt: string;
  data: Record<string, any>;
}

interface props {
  scannerId: string;
  documents: any;
  scannerData: any;
  userid: string;
}
const RegistryPage = ({
  scannerId,
  scannerData,
  userid,
  documents: docs,
}: props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [documents, setDocuments] = useState<ScanDocument[]>(docs);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{
    msg: string | null;
    variant?: ToastVariant;
  }>({ msg: "" });
  const [displayMode, setDisplayMode] = useState(false);

  // Refs for hidden file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const searchInDocument = (doc: ScanDocument, query: string): boolean => {
    const lowerQuery = query.toLowerCase();

    const searchInValue = (value: any): boolean => {
      if (Array.isArray(value)) {
        return value.some((item) => searchInValue(item));
      }
      if (typeof value === "object" && value !== null) {
        return Object.values(value).some((item) => searchInValue(item));
      }
      return String(value).toLowerCase().includes(lowerQuery);
    };

    return Object.entries(doc.data).some(
      ([key, value]) =>
        key.toLowerCase().includes(lowerQuery) || searchInValue(value)
    );
  };

  const removeDocumentFromDocuments = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };
  const filteredDocuments = documents.filter(
    (doc) => searchQuery === "" || searchInDocument(doc, searchQuery)
  );
  const handleFabAction = (action: "camera" | "upload") => {
    setShowFabMenu(false); // Close the FAB menu immediately
    fileInputRef.current?.click();
  };
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setLoading(true);
      const file = files[0];
      setShowFabMenu(false);

      const formData = new FormData();
      formData.append("file", file);

      const userContext = `You converts images into well formatted JSON object
        Your name is ${scannerData.name} and descibe as - ${
        scannerData.description
      }
        Perform OCR to create the fields:
        ${generateFieldString(scannerData.fields)}
        Rules:
        - Fields: Be strict with the naming of the fields as given. If the field has space then add "-" there. Convert to lowercase.
          E.g. Contact Number -> contact-number
        - Dont add any additional fields and text
        - Remove extra spaces in values
        - Nesting: The nested elements should be in proper format
        - Numerical Precision: Extract numerical values with appropriate decimal precision.
        - Missing Fields: If a field is not explicitly present or cannot be confidently extracted, then use null
        - Date Formats: Be flexible with date formats and attempt to standardize to "YYYY-MM-DD" if possible, but output the detected format if standardization is ambiguous.
        - Phone/Mobile/Fax/Email/Website: If multiple numbers/emails/websites are present, include all of them in their respective arrays.
        - Best Effort: The AI should make its best effort to correctly identify and categorize the information. Minor formatting variations in the input should be handled gracefully (e.g., various phone number formats).
        - Language: Assume the content is primarily in English, but the AI should be robust enough to handle non-English characters if present.
        - Your output should only contain JSON.
        Example Output (the fields may be different) - 
        {
          "name": "John Smith",
          "company-name": "Tech Solutions Inc.",
          "mobile": "+11234567890",
          "email": "asdfgh@qwer.com",
          "website": "www.random.com"
        }
      `;

      formData.append("context", userContext);
      formData.append("userid", userid);
      formData.append("scannerId", scannerId);

      // --- Fetch to your Next.js API Route ---
      try {
        const response = await fetch("/api/gemini-process", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          setToastMsg({
            msg: "Failed to scan. Please try again.",
            variant: "error",
          });
          setTimeout(() => setToastMsg({ msg: "" }), 2000);
          console.log(errorData);
        }

        const result = await response.json();
        const newDoc: ScanDocument = {
          id: String(documents.length + 1),
          scannedAt: new Date().toISOString(),
          data: result.extractedData,
        };
        setDocuments((prevDocs) => [newDoc, ...prevDocs]);
        setToastMsg({
          msg: "Scan successful",
          variant: "success",
        });
        setTimeout(() => setToastMsg({ msg: "" }), 2000);
      } catch (error) {
        setToastMsg({
          msg: "Failed to scan. Please try again.",
          variant: "error",
        });
        setTimeout(() => setToastMsg({ msg: "" }), 2000);
      }
      event.target.value = "";
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      {loading && <LoadingSpinner />}
      {toastMsg.msg && (
        <ToastMessage message={toastMsg.msg} variant={toastMsg.variant} />
      )}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div onClick={() => router.push("/dashboard")}>
                <ChevronLeft />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {scannerData.name}
              </h1>
              <span className="px-2 py-1 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                {documents.length}
              </span>
            </div>
            <div>
              <ExportButtonMenu data={docs} name={scannerData.name} />

              <button
                title="Settings"
                onClick={() => router.push(`/new?sc=${scannerId}`)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex gap-1">
        <div className="relative max-w-md mx-auto sm:max-w-lg w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex rounded-lg bg-gray-200">
          <button
            title="List view"
            onClick={() => setDisplayMode(false)}
            className={`px-2 py-2 rounded-lg ${
              displayMode
                ? "bg-gray-200 text-gray-700"
                : "bg-blue-600 text-white"
            }`}
          >
            <List />
          </button>
          <button
            title="Table View"
            onClick={() => setDisplayMode(true)}
            className={`px-2 py-2 rounded-lg ${
              displayMode
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <Table />
          </button>
        </div>
      </div>

      {displayMode ? (
        <div className="px-2 md:px-5">
          <RegistryTable data={filteredDocuments} />
        </div>
      ) : (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="space-y-3 sm:space-y-4">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {searchQuery ? "No documents found" : "No documents yet"}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Start by scanning your first document using the + button below"}
                </p>
              </div>
            ) : (
              filteredDocuments.map((doc, index) => {
                function handleSetDocument(data: any) {
                  setDocuments((prevDocuments: any[]) => {
                    const newDocuments = [...prevDocuments]; // Create a shallow copy to avoid direct mutation
                    newDocuments[index].data = data;
                    return newDocuments;
                  });
                }
                return (
                  <RegistryDocItem
                    key={doc.id}
                    docum={doc}
                    setDocuments={handleSetDocument}
                    docRefString={`Users/${userid}/Scanners/${scannerId}/Docs`}
                    removeFromList={removeDocumentFromDocuments}
                    setLoading={setLoading}
                  />
                );
              })
            )}
          </div>
        </div>
      )}

      {/* FAB Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {showFabMenu && (
          <div className="absolute bottom-16 right-0 mb-2 space-y-2">
            <button
              title="Upload an image"
              onClick={() => handleFabAction("upload")}
              className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        )}

        <button
          title="Fab"
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
            showFabMenu ? "rotate-45" : "rotate-0"
          }`}
        >
          <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </div>

      {/* Hidden file input for file upload */}
      <input
        title="Upload a file"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Overlay */}
      {showFabMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
          onClick={() => setShowFabMenu(false)}
        />
      )}
    </div>
  );
};

export default RegistryPage;
