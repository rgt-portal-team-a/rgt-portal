/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Column {
  key: string | React.Node;
  header: string | React.Node;
  cellClassName?: (row: Record<string, any>) => string | string;
  render?: (row: Record<string, any>) => React.ReactNode;
}

export interface DataTableProps {
  columns: Column[];
  data: any[] | undefined;
  dividers?: boolean;
  actionBool?: boolean;
  actionObj?: { name: string; action: (id?: number, row?: T) => void }[];
  showDelete?: boolean;
  onDelete?: (id: number) => Promise<void>;
  setShowDelete?: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleteLoading?: boolean;
  loading?: boolean; // for initial loading of the table data
  skeleton?: "default" | "employee";
}

export interface ActionObject {
  name: "view" | "edit" | "delete" | "approve" | "reject";
  action: (id?: number, row?: T) => void;
  icon?: React.ReactNode;
  tooltip?: string;
  disabled?: boolean | ((row: any) => boolean);
  className?: string;
  confirmRequired?: boolean;
  confirmMessage?: string;
}
