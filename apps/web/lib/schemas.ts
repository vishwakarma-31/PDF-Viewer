import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  total: z.number().min(0, 'Total must be positive'),
});

export const invoiceSchema = z.object({
  vendor: z.object({
    name: z.string().min(1, 'Vendor name is required'),
    address: z.string().optional(),
    taxId: z.string().optional(),
  }),
  invoice: z.object({
    number: z.string().min(1, 'Invoice number is required'),
    date: z.string().min(1, 'Invoice date is required').refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),
    currency: z.string().optional(),
    subtotal: z.number().min(0).optional(),
    taxPercent: z.number().min(0).max(100).optional(),
    total: z.number().min(0, 'Total must be positive'),
    poNumber: z.string().optional(),
    poDate: z.string().optional().refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid PO date format',
    }),
    lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  }),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;