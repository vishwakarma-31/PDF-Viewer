'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { Invoice } from '../../packages/types';

interface InvoiceTableProps {
  invoices: Invoice[];
  onDelete: (id: string) => void;
}

export default function InvoiceTable({ invoices, onDelete }: InvoiceTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vendor Name</TableHead>
          <TableHead>Invoice Number</TableHead>
          <TableHead>Invoice Date</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow
            key={invoice._id}
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => window.location.href = `/?id=${invoice._id}`}
          >
            <TableCell>{invoice.vendor.name}</TableCell>
            <TableCell>{invoice.invoice.number}</TableCell>
            <TableCell>{formatDate(invoice.invoice.date)}</TableCell>
            <TableCell>{formatCurrency(invoice.invoice.total)}</TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2">
                <Link href={`/?id=${invoice._id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => invoice._id && onDelete(invoice._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}