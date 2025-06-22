export const generatePreviewJSON = (structure: DataStructure) => {
  const generateFieldPreview = (field: DataField): any => {
    let value: any;

    if (field.autoDetect) {
      // If autoDetect is true and it has children, treat it as an object
      if (field.children && field.children.length > 0) {
        const nestedObject: { [key: string]: any } = {};
        field.children.forEach((child) => {
          nestedObject[child.name || "child_field"] =
            generateFieldPreview(child);
        });
        value = nestedObject;
      } else {
        value = "Detect Automatically";
      }
    } else if (field.type) {
      switch (field.type) {
        case "number":
        case "currency":
          value = 0;
          break;
        case "boolean":
          value = false;
          break;
        case "date":
          value = "2024-01-01";
          break;
        case "email":
          value = "example@email.com";
          break;
        case "phone":
          value = "+1234567890";
          break;
        case "url":
          value = "https://example.com";
          break;
        case "object":
          value = {};
          if (field.children && field.children.length > 0) {
            field.children.forEach((child) => {
              value[child.name || "child_field"] = generateFieldPreview(child);
            });
          }
          break;
        default:
          value = "sample text";
      }
    } else {
      value = "sample text";
    }

    return field.isArray ? [value] : value;
  };

  const preview: any = {};
  structure.fields.forEach((field) => {
    preview[field.name || "field_name"] = generateFieldPreview(field);
  });
  return preview;
};

export const generateFieldAttributes = (
  fields: DataField[]
): ScanAttributes[] => {
  let fieldAttr: ScanAttributes[] = [];
  fields.forEach((item) => {
    fieldAttr.push({
      name: item.name,
      type: `${item.type || "Detect the type"}${item.isArray ? "- List" : ""}`,
      children: item.children ? generateFieldAttributes(item.children) : [],
    });
  });
  return fieldAttr;
};

export const reverseFieldAttributes = (
  attributes: ScanAttributes[],
  level: number = 0,
  parentId: string = ""
): DataField[] => {
  return attributes.map((attr, index) => {
    const isArray = attr.type.endsWith("- List");
    const rawType = attr.type.replace("- List", "");

    const currentId = parentId ? `${parentId}-${index}` : `${index}`;

    return {
      id: currentId,
      name: attr.name,
      type: rawType === "Detect the type" ? undefined : rawType,
      isArray: isArray,
      autoDetect: rawType === "Detect the type",
      collapsed: true,
      level: level,
      children:
        attr.children && attr.children.length > 0
          ? reverseFieldAttributes(attr.children, level + 1, currentId)
          : undefined,
    };
  });
};

export const generateFieldString = (fields: ScanAttributes[]): string => {
  //TODO:
  if (fields.length === 0)
    return "Detect the fields and produce the result by reading the image";
  let fieldAttr: string =
    "These are the fields in the document you have to get: \t";
  fields.forEach((item, index) => {
    fieldAttr = fieldAttr + `\n- `;
    fieldAttr = fieldAttr + `${item.name}: ${item.type}`;
    if (item.children.length > 0) {
      fieldAttr = fieldAttr + "\n  Children:\n";
      item.children.forEach((child) => {
        fieldAttr = fieldAttr + generateNestedStringForField(child, 2);
      });
    }
  });
  return fieldAttr;
};
const generateNestedStringForField = (
  field: ScanAttributes,
  depth: number = 0
): string => {
  let result = "";
  const indent = "  ".repeat(depth);

  result += `${indent}- ${field.name}: ${field.type}\n`;

  if (field.children && field.children.length > 0) {
    result += `${indent}  Children:\n`;
    field.children.forEach((child) => {
      result += generateNestedStringForField(child, depth + 2);
    });
  }

  return result;
};
