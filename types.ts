interface DataField {
  id: string;
  name: string;
  type?: string;
  isArray: boolean;
  autoDetect: boolean;
  collapsed: boolean;
  children?: DataField[];
  level: number;
}

interface ScanAttributes {
  name: string;
  type: string;
  children: ScanAttributes[];
}
interface MenuAction {
  id: string;
  label: string;
  icon?: any;
  variant?: "destructive" | "normal";
  disabled?: boolean;
  onClick?: () => void;
}

interface DataStructure {
  name: string;
  description: string;
  fields: DataField[];
}
interface Registry {
  name: string;
  description: string;
  lastUsed: string;
  totalScans: number;
  icon: React.ReactNode;
  color: string;
}
interface ScanDocument {
  id: string;
  scannedAt: string;
  data: Record<string, any>;
}
