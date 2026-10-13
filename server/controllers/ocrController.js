const fs = require('fs');

exports.processOCR = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        // This is where real OCR (e.g. AWS Textract, Tesseract.js, Google Cloud Vision) would hook in.
        // REQUIRES EXTERNAL CONFIGURATION: process.env.AWS_ACCESS_KEY_ID or similar.
        // For now, we simulate a heavy async operation that parses the document into structured data.
        
        const mockStructuredExtraction = {
            appliedBy: "Jane Doe",
            division: "Retail",
            description: "Passport upload",
            contactName: "Jane Doe",
            qty: 1,
            material: "Paper",
            rate: 100,
            gst: 18,
            hsn: "9983",
            handwrittenContent: "Verified original",
            confidence: 0.92,
            requiresReview: true // Always true for blurry/unverified mocks
        };

        // Clean up the file from temp storage after processing
        if (req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if(err) console.error("Failed to delete temp file:", err);
            });
        }

        res.json({
            success: true,
            data: mockStructuredExtraction,
            message: 'OCR processed successfully. Please review the extracted fields.'
        });
    } catch (err) { next(err); }
};