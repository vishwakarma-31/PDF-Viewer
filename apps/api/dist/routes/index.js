"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("./upload"));
const extract_1 = __importDefault(require("./extract"));
const invoices_1 = __importDefault(require("./invoices"));
const router = express_1.default.Router();
// Mount routes
router.use('/upload', upload_1.default);
router.use('/extract', extract_1.default);
router.use('/invoices', invoices_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map