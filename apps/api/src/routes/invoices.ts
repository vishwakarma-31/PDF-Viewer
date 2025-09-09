import express from 'express';
import Joi from 'joi';
import Invoice from '../models/Invoice';

const router = express.Router();

// Joi schema for invoice validation
const invoiceSchema = Joi.object({
  fileId: Joi.string().required(),
  fileName: Joi.string().required(),
  vendor: Joi.object({
    name: Joi.string().required(),
    address: Joi.string().optional()
  }).required(),
  invoice: Joi.object({
    number: Joi.string().required(),
    date: Joi.date().required(),
    total: Joi.number().required(),
    lineItems: Joi.array().items(
      Joi.object({
        description: Joi.string().required(),
        quantity: Joi.number().required(),
        unitPrice: Joi.number().required(),
        total: Joi.number().required()
      })
    ).required()
  }).required()
});

// GET /invoices - List all invoices with optional search
router.get('/', async (req, res) => {
  try {
    const query = req.query.q as string;
    let invoices;
    if (query) {
      invoices = await Invoice.find({
        $or: [
          { 'vendor.name': { $regex: query, $options: 'i' } },
          { 'invoice.number': { $regex: query, $options: 'i' } }
        ]
      });
    } else {
      invoices = await Invoice.find();
    }
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// POST /invoices - Create new invoice
router.post('/', async (req, res) => {
  try {
    const { error } = invoiceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// GET /invoices/:id - Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// PUT /invoices/:id - Update invoice
router.put('/:id', async (req, res) => {
  try {
    const { error } = invoiceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// DELETE /invoices/:id - Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;