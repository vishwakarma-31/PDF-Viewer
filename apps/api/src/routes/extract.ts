import express from 'express';
import pdfParse from 'pdf-parse';
import Invoice from '../models/Invoice';
import { extractWithGemini, extractWithGroq } from '../services/aiExtraction';

const router = express.Router();

// POST /extract
router.post('/', async (req, res) => {
  try {
    const { fileId, model, blobUrl, fileName } = req.body;
    if (!fileId) {
      return res.status(400).json({ error: 'fileId is required' });
    }
    if (!model) {
      return res.status(400).json({ error: 'model is required (gemini or groq)' });
    }
    if (!blobUrl) {
      return res.status(400).json({ error: 'blobUrl is required' });
    }
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    // Fetch the PDF from blob
    const response = await fetch(blobUrl);
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch PDF from blob' });
    }
    const buffer = await response.arrayBuffer();
    const data = await pdfParse(Buffer.from(buffer));
    const text = data.text;

    console.log(`Starting AI extraction with model: ${model} for file: ${fileName}`);

    let extracted;
    try {
      if (model === 'gemini') {
        extracted = await extractWithGemini(text);
      } else if (model === 'groq') {
        extracted = await extractWithGroq(text);
      } else {
        return res.status(400).json({ error: 'Invalid model. Use "gemini" or "groq"' });
      }
    } catch (aiError) {
      console.error('AI extraction failed:', aiError);
      return res.status(500).json({ error: 'Failed to extract invoice data from AI' });
    }

    const invoice = new Invoice({
      fileId,
      fileName,
      ...extracted
    });
    await invoice.save();
    console.log(`Invoice extracted and saved for fileId: ${fileId}`);
    res.json(invoice);
  } catch (error) {
    console.error('Error extracting invoice:', error);
    res.status(500).json({ error: 'Failed to extract invoice' });
  }
});

export default router;