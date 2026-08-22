// backend/extractSchema.js
export const EXTRACT_SCHEMA = {
    type: "json_schema",
    json_schema: {
        name: "document_extraction",
        strict: true,
        schema: {
            type: "object",
            properties: {
                document_type: {
                    type: "string",
                    enum: ["invoice", "receipt", "purchase_order", "unknown"]
                },
                vendor_name: { type: "string" },
                date: { type: "string" },
                po_reference: { type: "string" },
                gl_code: {
                    type: "string",
                    enum: [
                        "GL-400: Software",
                        "GL-500: Hardware",
                        "GL-600: Travel/Misc",
                        "GL-100: Office Supplies"
                    ]
                },
                line_items: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            description: { type: "string" },
                            quantity: { type: "number" },
                            unit_price: { type: "number" },
                            amount: { type: "number" }
                        },
                        required: ["description", "quantity", "unit_price", "amount"],
                        additionalProperties: false
                    }
                },
                subtotal: { type: "number" },
                tax_rate_percent: { type: "number" },
                tax_amount: { type: "number" },
                currency: { type: "string", enum: ["INR", "USD", "EUR", "GBP", "OTHER"] },
                total_amount: { type: "number" },
                confidence_scores: {
                    type: "object",
                    properties: {
                        vendor_name: { type: "number" },
                        date: { type: "number" },
                        po_reference: { type: "number" },
                        gl_code: { type: "number" },
                        total_amount: { type: "number" }
                    },
                    required: ["vendor_name", "date", "po_reference", "gl_code", "total_amount"],
                    additionalProperties: false
                }
            },
            required: [
                "document_type",
                "vendor_name",
                "date",
                "po_reference",
                "gl_code",
                "line_items",
                "subtotal",
                "tax_rate_percent",
                "tax_amount",
                "currency",
                "total_amount",
                "confidence_scores"
            ],
            additionalProperties: false
        }
    }
};