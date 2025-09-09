'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import SearchBar from '../../components/SearchBar';
import InvoiceTable from '../../components/InvoiceTable';
import { Invoice } from '../../../packages/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [search]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = search ? { q: search } : {};
      const response = await axios.get(`${API_BASE_URL}/invoices`, { params });
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          toast.error('Network error: Please check your connection');
        } else if (error.response.status >= 500) {
          toast.error('Server error: Please try again later');
        } else if (error.response.status === 403) {
          toast.error('Access denied: You do not have permission to view invoices');
        } else {
          toast.error(`Failed to fetch invoices: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to fetch invoices');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/invoices/${id}`);
      setInvoices(invoices.filter(inv => inv._id !== id));
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          toast.error('Network error: Please check your connection and try again');
        } else if (error.response.status >= 500) {
          toast.error('Server error: Please try again later');
        } else if (error.response.status === 404) {
          toast.error('Invoice not found: It may have already been deleted');
          // Remove from local state anyway
          setInvoices(invoices.filter(inv => inv._id !== id));
        } else if (error.response.status === 403) {
          toast.error('Access denied: You do not have permission to delete this invoice');
        } else {
          toast.error(`Delete failed: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to delete invoice');
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Invoice List</h1>
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      {loading ? (
        <div className="text-center py-8">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-8">No invoices found.</div>
      ) : (
        <InvoiceTable invoices={invoices} onDelete={handleDelete} />
      )}
    </div>
  );
}