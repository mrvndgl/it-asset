export interface PC {
  id: string;
  employeeName: string;
  employeeId: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  ipAddress: string;
  macAddress: string;
  ram: string;
  storage: string;
  dateOfIssue: string;
  location: string;
  assignedTo: string;
  password: string;
  status: "assigned" | "available" | "maintenance";
}

export interface Printer {
  id: string;
  printerName: string;
  printerModel: string;
  tonerCartridge: string;
  drumUnit: string;
  department: string;
  ipAddress: string;
  password: string;
  location: string;
  status: "active" | "inactive" | "maintenance";
}

export interface Department {
  id: string;
  name: string;
  location: string;
  pcCount: number;
  printerCount: number;
}
