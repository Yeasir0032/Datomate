import { FileJson, FileSpreadsheet, Upload } from "lucide-react";
import React from "react";
import MoreMenuButton from "../more-menu-button";
import { objectToCSV } from "@/lib/flatten";

const ExportButtonMenu = ({ data, name }: { data: any; name: string }) => {
  const menuactions: MenuAction[] = [
    {
      id: "csv",
      label: "Export as CSV",
      icon: FileSpreadsheet,
      onClick: () => {
        const csv = objectToCSV(data);
        const blob = new Blob([csv], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${name}.csv`;
        link.click();

        URL.revokeObjectURL(url);
      },
    },
    {
      id: "json",
      label: "Export as JSON",
      icon: FileJson,
      onClick: () => {
        const json = JSON.stringify(data);
        const blob = new Blob([json], {
          type: "text/json;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${name}.json`;
        link.click();

        URL.revokeObjectURL(url);
      },
    },
  ];
  return (
    <MoreMenuButton
      actions={menuactions}
      mainIcon={<Upload className="h-5 w-5 text-gray-400 rotate-90" />}
    />
  );
};

export default ExportButtonMenu;
