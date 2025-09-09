export interface Invoice {
  _id?: string;
  fileId: string;
  fileName: string;
  vendor: {
    name: string;
    address?: string;
    taxId?: string;
  };
  invoice: {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total: number;
    poNumber?: string;
    poDate?: string;
    lineItems: LineItem[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface LineItem {
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export type UploadResponse = { fileId: string; fileName: string; blobUrl: string };

export type ExtractRequest = { fileId: string; model: 'gemini' | 'groq' };

export type ExtractResponse = Invoice;

export type InvoiceListResponse = Invoice[];

export type InvoiceResponse = Invoice;

export type UpdateInvoiceRequest = Partial<Invoice>;

export type SearchQuery = { q?: string };

export interface FormInvoice {
  _id?: string;
  fileId?: string;
  fileName?: string;
  vendor: {
    name?: string;
    address?: string;
    taxId?: string;
  };
  invoice: {
    number?: string;
    date?: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems?: LineItem[];
  };
  createdAt?: string;
  updatedAt?: string;
}