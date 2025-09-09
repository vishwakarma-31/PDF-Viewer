import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

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

interface ExtractedInvoice {
  vendor: IVendor;
  invoice: IInvoiceData;
}

const prompt = `
Extract invoice data from the following PDF text. Return a valid JSON object with the following structure:
{
  "vendor": {
    "name": "Vendor Name",
    "address": "Vendor Address (if available, otherwise omit)"
  },
  "invoice": {
    "number": "Invoice Number",
    "date": "Invoice Date (in ISO format if possible)",
    "total": 123.45,
    "lineItems": [
      {
        "description": "Item Description",
        "quantity": 1,
        "unitPrice": 123.45,
        "total": 123.45
      }
    ]
  }
}
Handle missing fields by omitting them or setting to null. Ensure the JSON is valid.
PDF Text:
`;

export async function extractWithGemini(text: string): Promise<ExtractedInvoice> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    const result = await model.generateContent(prompt + text);
    const response = await result.response;
    const textResponse = response.text();
    console.log('Gemini response:', textResponse);
    const parsed = JSON.parse(textResponse);
    // Validate and clean the data
    return cleanExtractedData(parsed);
  } catch (error) {
    console.error('Gemini extraction error:', error);
    throw new Error('Failed to extract with Gemini');
  }
}

export async function extractWithGroq(text: string): Promise<ExtractedInvoice> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not set');
  }

  const groq = new Groq({ apiKey });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt + text,
        },
      ],
      model: 'llama3-8b-8192',
    });

    const response = chatCompletion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq');
    }
    console.log('Groq response:', response);
    const parsed = JSON.parse(response);
    return cleanExtractedData(parsed);
  } catch (error) {
    console.error('Groq extraction error:', error);
    throw new Error('Failed to extract with Groq');
  }
}

function cleanExtractedData(data: any): ExtractedInvoice {
  // Basic validation and cleaning
  if (!data.vendor || !data.invoice) {
    throw new Error('Invalid extracted data structure');
  }

  const vendor: IVendor = {
    name: data.vendor.name || 'Unknown Vendor',
    address: data.vendor.address || undefined,
  };

  const lineItems: ILineItem[] = (data.invoice.lineItems || []).map((item: any) => ({
    description: item.description || 'Unknown Item',
    quantity: item.quantity || 1,
    unitPrice: item.unitPrice || 0,
    total: item.total || 0,
  }));

  const invoice: IInvoiceData = {
    number: data.invoice.number || 'Unknown',
    date: new Date(data.invoice.date || Date.now()),
    total: data.invoice.total || 0,
    lineItems,
  };

  return { vendor, invoice };
}