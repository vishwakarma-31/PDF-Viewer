import mongoose, { Document, Schema } from 'mongoose';

interface IVendor {
  name: string;
  address?: string;
}

interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface IInvoiceData {
  number: string;
  date: Date;
  total: number;
  lineItems: ILineItem[];
}

interface IInvoice extends Document {
  fileId: string;
  fileName: string;
  vendor: IVendor;
  invoice: IInvoiceData;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>({
  fileId: { type: String, required: true },
  fileName: { type: String, required: true },
  vendor: {
    name: { type: String, required: true },
    address: String
  },
  invoice: {
    number: { type: String, required: true },
    date: { type: Date, required: true },
    total: { type: Number, required: true },
    lineItems: [{
      description: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      total: { type: Number, required: true }
    }]
  }
}, { timestamps: true });

const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

export default Invoice;