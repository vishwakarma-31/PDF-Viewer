'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Invoice, FormInvoice } from '../../../packages/types';
import { invoiceSchema, InvoiceFormData } from '../lib/schemas';

interface DataFormProps {
  invoice: Invoice | null;
  onSave: (invoice: FormInvoice) => void;
  onDelete: () => void;
  loading: boolean;
}

export default function DataForm({ invoice, onSave, onDelete, loading }: DataFormProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      vendor: {
        name: '',
        address: '',
        taxId: '',
      },
      invoice: {
        number: '',
        date: '',
        currency: 'USD',
        subtotal: 0,
        taxPercent: 0,
        total: 0,
        poNumber: '',
        poDate: '',
        lineItems: [],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invoice.lineItems',
  });

  const watchedLineItems = watch('invoice.lineItems');
  const watchedTaxPercent = watch('invoice.taxPercent');

  useEffect(() => {
    if (invoice) {
      // Reset form with invoice data
      const formData = {
        ...invoice,
        invoice: {
          ...invoice.invoice,
          date: invoice.invoice.date ? new Date(invoice.invoice.date).toISOString().split('T')[0] : '',
          poDate: invoice.invoice.poDate ? new Date(invoice.invoice.poDate).toISOString().split('T')[0] : '',
        },
      };
      // Use reset to set all values at once
      // But since we have nested objects, we'll use setValue for each
      setValue('vendor', formData.vendor);
      setValue('invoice', formData.invoice);
    }
  }, [invoice, setValue]);

  // Calculate totals when lineItems or taxPercent changes
  useEffect(() => {
    if (watchedLineItems) {
      const subtotal = watchedLineItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const taxPercent = watchedTaxPercent || 0;
      const taxAmount = subtotal * (taxPercent / 100);
      const total = subtotal + taxAmount;

      setValue('invoice.subtotal', subtotal);
      setValue('invoice.total', total);
    }
  }, [watchedLineItems, watchedTaxPercent, setValue]);

  // Update line item total when quantity or unitPrice changes
  const updateLineItemTotal = (index: number) => {
    const lineItems = watch('invoice.lineItems');
    if (lineItems && lineItems[index]) {
      const item = lineItems[index];
      const total = (item.quantity || 0) * (item.unitPrice || 0);
      setValue(`invoice.lineItems.${index}.total`, total);
    }
  };

  const addLineItem = () => {
    append({
      description: '',
      unitPrice: 0,
      quantity: 1,
      total: 0,
    });
  };

  const onSubmit = (data: InvoiceFormData) => {
    onSave(data as FormInvoice);
  };

  const handleDelete = () => {
    if (invoice?._id) {
      onDelete();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold">Invoice Data</h2>

      {/* Vendor Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Vendor Information</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="vendorName">Name *</Label>
            <Input
              id="vendorName"
              {...register('vendor.name')}
              placeholder="Vendor name"
            />
            {errors.vendor?.name && (
              <p className="text-red-500 text-sm mt-1">{errors.vendor.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="vendorAddress">Address</Label>
            <Input
              id="vendorAddress"
              {...register('vendor.address')}
              placeholder="Vendor address"
            />
          </div>
          <div>
            <Label htmlFor="vendorTaxId">Tax ID</Label>
            <Input
              id="vendorTaxId"
              {...register('vendor.taxId')}
              placeholder="Tax ID"
            />
          </div>
        </div>
      </div>

      {/* Invoice Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Invoice Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number *</Label>
            <Input
              id="invoiceNumber"
              {...register('invoice.number')}
              placeholder="Invoice number"
            />
            {errors.invoice?.number && (
              <p className="text-red-500 text-sm mt-1">{errors.invoice.number.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="invoiceDate">Date *</Label>
            <Input
              id="invoiceDate"
              type="date"
              {...register('invoice.date')}
            />
            {errors.invoice?.date && (
              <p className="text-red-500 text-sm mt-1">{errors.invoice.date.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              {...register('invoice.currency')}
              placeholder="Currency"
            />
          </div>
          <div>
            <Label htmlFor="taxPercent">Tax Percent</Label>
            <Input
              id="taxPercent"
              type="number"
              step="0.01"
              {...register('invoice.taxPercent', { valueAsNumber: true })}
              placeholder="Tax percent"
            />
            {errors.invoice?.taxPercent && (
              <p className="text-red-500 text-sm mt-1">{errors.invoice.taxPercent.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="poNumber">PO Number</Label>
            <Input
              id="poNumber"
              {...register('invoice.poNumber')}
              placeholder="Purchase order number"
            />
          </div>
          <div>
            <Label htmlFor="poDate">PO Date</Label>
            <Input
              id="poDate"
              type="date"
              {...register('invoice.poDate')}
            />
            {errors.invoice?.poDate && (
              <p className="text-red-500 text-sm mt-1">{errors.invoice.poDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Line Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Line Items *</h3>
          <Button type="button" onClick={addLineItem} variant="outline" size="sm">
            Add Item
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Item {index + 1}</h4>
              <Button
                type="button"
                onClick={() => remove(index)}
                variant="destructive"
                size="sm"
              >
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Description *</Label>
                <Input
                  {...register(`invoice.lineItems.${index}.description`)}
                  placeholder="Item description"
                />
                {errors.invoice?.lineItems?.[index]?.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.invoice.lineItems[index]?.description?.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Unit Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(`invoice.lineItems.${index}.unitPrice`, {
                    valueAsNumber: true,
                    onChange: () => updateLineItemTotal(index),
                  })}
                  placeholder="Unit price"
                />
                {errors.invoice?.lineItems?.[index]?.unitPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.invoice.lineItems[index]?.unitPrice?.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  step="1"
                  {...register(`invoice.lineItems.${index}.quantity`, {
                    valueAsNumber: true,
                    onChange: () => updateLineItemTotal(index),
                  })}
                  placeholder="Quantity"
                />
                {errors.invoice?.lineItems?.[index]?.quantity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.invoice.lineItems[index]?.quantity?.message}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Label>Total</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(`invoice.lineItems.${index}.total`, { valueAsNumber: true })}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          </div>
        ))}
        {errors.invoice?.lineItems && typeof errors.invoice.lineItems.message === 'string' && (
          <p className="text-red-500 text-sm">{errors.invoice.lineItems.message}</p>
        )}
      </div>

      {/* Totals Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Totals</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Subtotal</Label>
            <Input
              {...register('invoice.subtotal', { valueAsNumber: true })}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label>Total *</Label>
            <Input
              {...register('invoice.total', { valueAsNumber: true })}
              readOnly
              className="bg-muted"
            />
            {errors.invoice?.total && (
              <p className="text-red-500 text-sm mt-1">{errors.invoice.total.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : 'Save'}
        </Button>
        {invoice?._id && (
          <Button type="button" onClick={handleDelete} variant="destructive" disabled={loading}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}