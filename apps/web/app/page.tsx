'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Upload, FileText, Save, Trash2 } from 'lucide-react';
import PDFViewer from '../components/PDFViewer';
import DataForm from '../components/DataForm';
import { Invoice, FormInvoice, UploadResponse, ExtractResponse } from '../../../packages/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export default function Home() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('id');

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);

  // Load existing invoice if ID is provided
  useEffect(() => {
    if (invoiceId) {
      loadInvoice(invoiceId);
    }
  }, [invoiceId]);

  const loadInvoice = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/invoices/${id}`);
      setInvoice(response.data);
      setBlobUrl(response.data.blobUrl || '');
      toast.success('Invoice loaded successfully');
    } catch (error) {
      console.error('Error loading invoice:', error);
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          toast.error('Network error: Please check your connection');
        } else if (error.response.status >= 500) {
          toast.error('Server error: Please try again later');
        } else if (error.response.status === 404) {
          toast.error('Invoice not found');
        } else if (error.response.status === 403) {
          toast.error('Access denied: You do not have permission to view this invoice');
        } else {
          toast.error(`Failed to load invoice: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to load invoice');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<UploadResponse>(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPdfFile(file);
      setBlobUrl(response.data.blobUrl);
      toast.success('PDF uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          toast.error('Network error: Please check your connection and try again');
        } else if (error.response.status >= 500) {
          toast.error('Server error: Please try again later');
        } else if (error.response.status === 413) {
          toast.error('File too large: Please select a smaller PDF file');
        } else if (error.response.status === 415) {
          toast.error('Invalid file type: Please select a valid PDF file');
        } else {
          toast.error(`Upload failed: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to upload PDF');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleExtract = async (model: 'gemini' | 'groq') => {
    if (!pdfFile && !blobUrl) {
      toast.error('Please upload a PDF first');
      return;
    }

    try {
      setExtracting(true);
      const response = await axios.post<ExtractResponse>(`${API_BASE_URL}/extract`, {
        fileId: invoice?.fileId || 'temp',
        model,
        blobUrl: blobUrl,
        fileName: pdfFile?.name || invoice?.fileName || 'unknown.pdf',
      });

      setInvoice(response.data);
      toast.success('Invoice data extracted successfully');
    } catch (error) {
      console.error('Error extracting invoice:', error);
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          toast.error('Network error: Please check your connection and try again');
        } else if (error.response.status >= 500) {
          toast.error('Server error: AI extraction service is temporarily unavailable');
        } else if (error.response.status === 400) {
          toast.error('Invalid request: Please ensure the PDF is valid and try again');
        } else if (error.response.status === 429) {
          toast.error('Rate limit exceeded: Please wait a moment before trying again');
        } else {
          toast.error(`Extraction failed: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to extract invoice data');
      }
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async (formData: FormInvoice) => {
    try {
      setLoading(true);
      const invoiceData = {
        ...formData,
        fileId: formData.fileId || invoice?.fileId,
        fileName: formData.fileName || pdfFile?.name || invoice?.fileName,
      };

      let response;
      if (invoice?._id) {
        response = await axios.put(`${API_BASE_URL}/invoices/${invoice._id}`, invoiceData);
        toast.success('Invoice updated successfully');
      } else {
        response = await axios.post(`${API_BASE_URL}/invoices`, invoiceData);
        toast.success('Invoice created successfully');
      }

      setInvoice(response.data);
    } catch (error) {
      console.error('Error saving invoice:', error);
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          toast.error('Network error: Please check your connection and try again');
        } else if (error.response.status >= 500) {
          toast.error('Server error: Please try again later');
        } else if (error.response.status === 400) {
          toast.error('Validation error: Please check your input data');
        } else if (error.response.status === 409) {
          toast.error('Conflict: Invoice with this number already exists');
        } else if (error.response.status === 403) {
          toast.error('Access denied: You do not have permission to save this invoice');
        } else {
          toast.error(`Save failed: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to save invoice');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice?._id) return;

    const confirmed = window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/invoices/${invoice._id}`);
      setInvoice(null);
      setPdfFile(null);
      setBlobUrl('');
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
        } else if (error.response.status === 403) {
          toast.error('Access denied: You do not have permission to delete this invoice');
        } else {
          toast.error(`Delete failed: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to delete invoice');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">PDF Invoice Viewer</h1>
          <div className="flex items-center gap-4">
            <Link href="/invoices">
              <Button variant="outline">View Invoices</Button>
            </Link>
            {/* File Upload */}
            <div>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" disabled={uploading} asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload PDF'}
                  </span>
                </Button>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* AI Extract */}
            <div className="flex items-center gap-2">
              <Select onValueChange={(value) => handleExtract(value as 'gemini' | 'groq')}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  const select = document.querySelector('[data-radix-select-trigger]') as HTMLElement;
                  if (select) select.click();
                }}
                disabled={extracting || (!pdfFile && !blobUrl)}
              >
                <FileText className="h-4 w-4 mr-2" />
                {extracting ? 'Extracting...' : 'Extract with AI'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - PDF Viewer */}
        <div className="w-1/2 border-r">
          <PDFViewer
            file={pdfFile}
            blobUrl={blobUrl}
          />
        </div>

        {/* Right Panel - Data Form */}
        <div className="w-1/2">
          <DataForm
            invoice={invoice}
            onSave={handleSave}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
