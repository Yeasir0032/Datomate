"use client";
import React, { useState } from "react";
import { Plus, Database, Settings, Trash2, Scan } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MoreMenuButton from "../components/more-menu-button";
import { addDoc, collection, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import ToastMessage from "../components/ui/toast";

interface props {
  scannerData: {
    name: string;
    id: string;
    scans: number;
    lastUsed: string;
    description?: string;
    fields: ScanAttributes[];
  }[];
  exploreData: {
    name: string;
    id: string;
    fields: ScanAttributes[];
    description: string;
  }[];
  uid: string;
  userscans: string;
}

const HomePage = ({ scannerData, exploreData, uid, userscans }: props) => {
  const router = useRouter();
  const [scannerDataState, setScannerDataState] = useState(scannerData);
  const [toast, setToast] = useState("");
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExploreScannerClick = async (id: number) => {
    try {
      const scannerCollectionRef = collection(db, "Users", uid, "Scanners");
      const data = exploreData[id];
      const finalData = {
        name: data.name,
        description: data.description,
        fields: data.fields,
        scans: 0,
        lastUsed: new Date().toISOString(),
      };
      const res = await addDoc(scannerCollectionRef, finalData);
      console.log(res.id);
      router.push(`/scanner/${res.id}`);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        {toast && <ToastMessage message={toast} />}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => router.push("/")}
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Scan className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Datomate
                </span>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  title="Settings"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {scannerDataState.length}
              </div>
              <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Active Scanners
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {userscans}
              </div>
              <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Total Scans
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                98.5%
              </div>
              <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Accuracy Rate
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                24/7
              </div>
              <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Processing
              </div>
            </div>
          </div>

          {/* Registries List */}
          {scannerDataState.length >= 0 && (
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Data Scanners
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Manage your AI-powered data extraction workflows
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {scannerDataState.map((registry, index) => {
                  const sampleActions: MenuAction[] = [
                    {
                      id: "delete",
                      label: "Delete",
                      icon: Trash2,
                      variant: "destructive",
                      onClick: async () => {
                        try {
                          const scannerDocRef = doc(
                            db,
                            "Users",
                            uid,
                            "Scanners",
                            registry.id
                          );
                          await deleteDoc(scannerDocRef);
                          setScannerDataState(
                            scannerDataState.filter((item) => {
                              return registry.id !== item.id;
                            })
                          );
                          setToast("Delete successful Reload for change");
                          setTimeout(() => setToast(""), 3000);
                        } catch (error) {
                          console.log(error);
                        }
                      },
                    },
                  ];
                  return (
                    <div
                      key={index}
                      onClick={() => router.push(`/scanner/${registry.id}`)}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-700/20 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                            <Scan className="w-6 h-6 text-white" />
                          </div>
                          <MoreMenuButton actions={sampleActions} />
                        </div>

                        <div className="mb-3">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {registry.name}
                          </h3>
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                            Forms
                          </span>
                        </div>

                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {registry.description}
                        </p>

                        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <span>
                            Last used: {formatDate(registry.lastUsed)}
                          </span>
                          <span className="font-medium">
                            {registry.scans} scans
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Explore section*/}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Explore Scanners
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Explore the ready to use scanners.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {exploreData.map((registry, index) => (
                <div
                  key={index}
                  onClick={() => handleExploreScannerClick(index)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-700/20 transition-all duration-200 cursor-pointer group"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                        <Scan className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <div className="mb-3">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {registry.name}
                      </h3>
                    </div>

                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {registry.description}
                    </p>

                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span>Tap to add a new {registry.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Explore list */}

          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6 z-10">
            <Link href="/new">
              <button
                title="Add new"
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group flex items-center gap-2"
              >
                <Plus className="h-6 w-6 sm:h-7 sm:w-7 group-hover:rotate-90 transition-transform duration-200" />
                <span className="hidden md:block font-sans font-bold">
                  Add new Scanner
                </span>
              </button>
            </Link>
          </div>

          {/* Mobile-friendly spacing for FAB */}
          <div className="h-20 sm:h-24"></div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
