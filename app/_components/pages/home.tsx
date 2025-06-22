"use client";
import React, { useEffect, useState } from "react";
import {
  Plus,
  FileText,
  Database,
  Settings,
  MoreVertical,
  Calendar,
  Users,
  Receipt,
  Clipboard,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface props {
  scannerData: {
    name: string;
    id: string;
    scans: number;
    lastUsed: string;
    description?: string;
    fields: ScanAttributes[];
  }[];
}
const HomePage = ({ scannerData }: props) => {
  const router = useRouter();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    AI Scanner
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Automated Data Entry
                  </p>
                </div>
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
                {scannerData.length}
              </div>
              <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Active Scanners
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {scannerData
                  .reduce((sum, reg) => sum + reg.scans, 0)
                  .toLocaleString()}
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
              {scannerData.map((registry, index) => {
                const IconComponent = Database;
                return (
                  <div
                    key={index}
                    onClick={() => router.push(`/scanner/${registry.id}`)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-700/20 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`bg-green-500 p-2 sm:p-3 rounded-lg`}>
                          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <button
                          title="More"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </button>
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
                        <span>Last used: {formatDate(registry.lastUsed)}</span>
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
        </main>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Link href="/new">
            <button
              title="Add new"
              className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <Plus className="h-6 w-6 sm:h-7 sm:w-7 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </Link>
        </div>

        {/* Mobile-friendly spacing for FAB */}
        <div className="h-20 sm:h-24"></div>
      </div>
    </div>
  );
};

export default HomePage;
