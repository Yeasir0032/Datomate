import React from "react";
import { Table, FileText, Database } from "lucide-react";

interface ObjectTableProps {
  data: any[] | Record<string, any> | null | undefined;
}

type FlattenedObject = Record<string, string>;

const RegistryTable: React.FC<ObjectTableProps> = ({ data }) => {
  const flattenObject = (
    obj: Record<string, any>,
    prefix: string = ""
  ): FlattenedObject[] => {
    const result: FlattenedObject[] = [];
    let hasArrays = false;
    let arrayResults: FlattenedObject[][] = [];
    const baseFlattened: FlattenedObject = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey: string = prefix ? `${prefix}.${key}` : key;

        if (obj[key] === null || obj[key] === undefined) {
          baseFlattened[newKey] = "";
        } else if (Array.isArray(obj[key])) {
          hasArrays = true;
          const arrayValue = obj[key] as any[];

          if (arrayValue.length === 0) {
            arrayResults.push([{ [newKey]: "" }]);
          } else {
            const arrayRows: FlattenedObject[] = [];

            arrayValue.forEach((item: any) => {
              if (typeof item === "object" && item !== null) {
                // For array of objects, flatten each object
                const itemFlattened = flattenObject(item, newKey);
                arrayRows.push(...itemFlattened);
              } else {
                // For array of primitives, create simple key-value
                arrayRows.push({ [newKey]: String(item) });
              }
            });

            arrayResults.push(arrayRows);
          }
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          // Recursively flatten nested objects
          const nested = flattenObject(obj[key] as Record<string, any>, newKey);
          if (nested.length > 1) {
            // Nested object has arrays, so we need to handle denormalization
            hasArrays = true;
            arrayResults.push(nested);
          } else {
            // Simple nested object, merge into base
            Object.assign(baseFlattened, nested[0]);
          }
        } else {
          baseFlattened[newKey] = String(obj[key]);
        }
      }
    }

    if (!hasArrays) {
      return [baseFlattened];
    }

    // Create cartesian product of all array results
    if (arrayResults.length === 0) {
      return [baseFlattened];
    }

    // Start with the first array result
    let combinedResults = arrayResults[0].map((row) => ({
      ...baseFlattened,
      ...row,
    }));

    // Combine with remaining arrays
    for (let i = 1; i < arrayResults.length; i++) {
      const newCombinedResults: FlattenedObject[] = [];

      for (const existingRow of combinedResults) {
        for (const newRow of arrayResults[i]) {
          newCombinedResults.push({ ...existingRow, ...newRow });
        }
      }

      combinedResults = newCombinedResults;
    }

    return combinedResults;
  };

  // Function to convert object to table rows
  const objectToRows = (
    obj: any[] | Record<string, any>
  ): FlattenedObject[] => {
    if (Array.isArray(obj)) {
      // If input is array, flatten each object and combine results
      const allRows: FlattenedObject[] = [];
      obj.forEach((item: Record<string, any>) => {
        const itemRows = flattenObject(item);
        allRows.push(...itemRows);
      });
      return allRows;
    } else if (typeof obj === "object" && obj !== null) {
      // If input is single object, flatten it
      return flattenObject(obj);
    } else {
      // If input is primitive, create simple key-value pair
      return [{ value: String(obj) }];
    }
  };

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Database className="mx-auto mb-2" size={48} />
        <p>No data provided</p>
      </div>
    );
  }

  const rows = objectToRows(data);

  if (rows.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <FileText className="mx-auto mb-2" size={48} />
        <p>No data to display</p>
      </div>
    );
  }

  // Get all unique keys from all rows
  const allKeys = [...new Set(rows.flatMap((row) => Object.keys(row)))].sort();

  return (
    <div className="w-full max-w-full overflow-hidden bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-zinc-800 px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Table className="text-gray-600 dark:text-gray-300" size={20} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({rows.length} row{rows.length !== 1 ? "s" : ""}, {allKeys.length}{" "}
            column{allKeys.length !== 1 ? "s" : ""})
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-zinc-800">
              {allKeys.map((key) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-zinc-700"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {rows.map((row: FlattenedObject, index: number) => (
              <tr
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {allKeys.map((key: string) => (
                  <td
                    key={key}
                    className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-zinc-800"
                  >
                    <div className="max-w-xs truncate" title={row[key] || ""}>
                      {row[key] || ""}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-zinc-800 px-6 py-3 border-t border-gray-200 dark:border-zinc-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Showing {rows.length} record{rows.length !== 1 ? "s" : ""} with{" "}
          {allKeys.length} field{allKeys.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
};
export default RegistryTable;
