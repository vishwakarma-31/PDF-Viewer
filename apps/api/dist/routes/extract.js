"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const router = express_1.default.Router();
// POST /extract
router.post('/', async (req, res) => {
    try {
        const { fileId, model } = req.body;
        if (!fileId) {
            return res.status(400).json({ error: 'fileId is required' });
        }
        // Find the file in uploads/
        const files = fs_1.default.readdirSync('uploads/');
        const file = files.find(f => f.startsWith(fileId));
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        const filePath = path_1.default.join('uploads/', file);
        const dataBuffer = fs_1.default.readFileSync(filePath);
        const data = await (0, pdf_parse_1.default)(dataBuffer);
        // Mock invoice data (stub for AI extraction)
        const mockInvoice = {
            fileId,
            fileName: file, // Using the stored filename
            vendor: {
                name: 'Mock Vendor Inc.',
                address: '123 Mock Street, City, State 12345'
            },
            invoice: {
                number: 'INV-001',
                date: new Date(),
                total: 100.0,
                lineItems: [
                    {
                        description: 'Sample Item',
                        quantity: 1,
                        unitPrice: 100.0,
                        total: 100.0
                    }
                ]
            }
        };
        const invoice = new Invoice_1.default(mockInvoice);
        await invoice.save();
        res.json(invoice);
    }
    catch (error) {
        console.error('Error extracting invoice:', error);
        res.status(500).json({ error: 'Failed to extract invoice' });
    }
});
exports.default = router;
//# sourceMappingURL=extract.js.map