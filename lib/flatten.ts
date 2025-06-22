// Type definitions
type PrimitiveValue = string | number | boolean | null | undefined;
type ObjectValue = Record<string, any>;
type ArrayValue = any[];
type AnyValue = any;

interface FlattenedObject {
  [key: string]: AnyValue;
}

interface CsvRow {
  [key: string]: PrimitiveValue;
}

/**
 * Flattens a nested object into a flat structure with dot notation keys
 * @param obj - The object to flatten
 * @param prefix - The prefix for keys (used for recursion)
 * @returns Flattened object
 */
function flattenObject(obj: ObjectValue, prefix: string = ""): FlattenedObject {
  const flattened: FlattenedObject = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value === null || value === undefined) {
        flattened[newKey] = "";
      } else if (Array.isArray(value)) {
        // Handle arrays - we'll process these separately
        flattened[newKey] = value;
      } else if (typeof value === "object" && value.constructor === Object) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
  }

  return flattened;
}

/**
 * Expands rows based on array values, creating separate rows for each array element
 * @param flatObj - Flattened object
 * @returns Array of expanded row objects
 */
function expandArrays(flatObj: FlattenedObject): CsvRow[] {
  const arrayKeys: string[] = [];
  const nonArrayData: CsvRow = {};

  // Separate array and non-array data
  for (const key in flatObj) {
    if (Array.isArray(flatObj[key])) {
      arrayKeys.push(key);
    } else {
      nonArrayData[key] = flatObj[key];
    }
  }

  // If no arrays, return single row
  if (arrayKeys.length === 0) {
    return [flatObj];
  }

  // Find the maximum array length to determine number of rows needed
  const maxLength: number = Math.max(
    ...arrayKeys.map((key) => (flatObj[key] as ArrayValue).length)
  );

  const expandedRows: CsvRow[] = [];

  // Create a row for each array index
  for (let i = 0; i < maxLength; i++) {
    const row: CsvRow = { ...nonArrayData };

    // Add array elements for this index
    arrayKeys.forEach((key) => {
      const array = flatObj[key] as ArrayValue;
      const element = array[i];

      if (element !== undefined) {
        if (
          typeof element === "object" &&
          element !== null &&
          !Array.isArray(element)
        ) {
          // If array element is an object, flatten it
          const flattenedElement = flattenObject(element, key);
          Object.assign(row, flattenedElement);
        } else {
          row[key] = element;
        }
      } else {
        row[key] = "";
      }
    });

    expandedRows.push(row);
  }

  return expandedRows;
}

/**
 * Main function to convert object to CSV-ready format
 * @param data - The data to convert (object or array of objects)
 * @returns Array of flattened row objects ready for CSV conversion
 */
function objectToCsvData(data: ObjectValue | ObjectValue[]): CsvRow[] {
  const inputArray: ObjectValue[] = Array.isArray(data) ? data : [data];
  const allRows: CsvRow[] = [];

  inputArray.forEach((item) => {
    const flattened = flattenObject(item);
    const expandedRows = expandArrays(flattened);
    allRows.push(...expandedRows);
  });

  return allRows;
}

/**
 * Converts the flattened data to CSV string
 * @param rows - Array of row objects
 * @returns CSV string
 */
function convertToCSV(rows: CsvRow[]): string {
  if (rows.length === 0) return "";

  // Get all unique headers
  const headers = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => headers.add(key));
  });

  const headerArray: string[] = Array.from(headers).sort();

  // Helper function to escape CSV values
  const escapeCSV = (value: PrimitiveValue): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Create CSV content
  const csvRows: string[] = [
    headerArray.join(","), // Header row
    ...rows.map((row) =>
      headerArray.map((header) => escapeCSV(row[header] || "")).join(",")
    ),
  ];

  return csvRows.join("\n");
}

/**
 * Complete utility function that converts object to CSV string
 * @param data - The data to convert
 * @returns CSV string
 */
export function objectToCSV(data: ObjectValue | ObjectValue[]): string {
  const csvData = objectToCsvData(data);
  return convertToCSV(csvData);
}
