"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const router = express_1.default.Router();
// Joi schema for invoice validation
const invoiceSchema = joi_1.default.object({
    fileId: joi_1.default.string().required(),
    fileName: joi_1.default.string().required(),
    vendor: joi_1.default.object({
        name: joi_1.default.string().required(),
        address: joi_1.default.string().optional()
    }).required(),
    invoice: joi_1.default.object({
        number: joi_1.default.string().required(),
        date: joi_1.default.date().required(),
        total: joi_1.default.number().required(),
        lineItems: joi_1.default.array().items(joi_1.default.object({
            description: joi_1.default.string().required(),
            quantity: joi_1.default.number().required(),
            unitPrice: joi_1.default.number().required(),
            total: joi_1.default.number().required()
        })).required()
    }).required()
});
// GET /invoices - List all invoices with optional search
router.get('/', async (req, res) => {
    try {
        const query = req.query.q;
        let invoices;
        if (query) {
            invoices = await Invoice_1.default.find({
                $or: [
                    { 'vendor.name': { $regex: query, $options: 'i' } },
                    { 'invoice.number': { $regex: query, $options: 'i' } }
                ]
            });
        }
        else {
            invoices = await Invoice_1.default.find();
        }
        res.json(invoices);
    }
    catch (error) {
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
        const invoice = new Invoice_1.default(req.body);
        await invoice.save();
        res.status(201).json(invoice);
    }
    catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});
// GET /invoices/:id - Get single invoice
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice_1.default.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    }
    catch (error) {
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
        const invoice = await Invoice_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    }
    catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ error: 'Failed to update invoice' });
    }
});
// DELETE /invoices/:id - Delete invoice
router.delete('/:id', async (req, res) => {
    try {
        const invoice = await Invoice_1.default.findByIdAndDelete(req.params.id);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
});
exports.default = router;
//# sourceMappingURL=invoices.js.map