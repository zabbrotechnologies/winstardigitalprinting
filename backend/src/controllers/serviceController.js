const { supabaseAdmin } = require('../config/supabase');
const storageService = require('../services/storageService');
const whatsappService = require('../services/whatsappService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Submit a Print Instantly Service Request
 */
const createPrintRequest = async (req, res, next) => {
    try {
        const {
            customerName,
            customerPhone,
            customerEmail,
            serviceType,
            printType,
            printSides,
            paperSize,
            paperGsm,
            paperType,
            orientation,
            printCount,
            pageCount,
            pageRange,
            bindingType,
            finishing,
            deliveryRequired,
            deliveryAddress,
            deliveryTime,
            estimatedAmount,
            notes
        } = req.body;

        let filePath = null;
        let fileName = null;
        let fileType = null;
        let fileSize = null;

        // Store physical file in Supabase Storage ONLY for Client Services / B2B Client requests, NOT for instant quick printers
        const isClientService = serviceType === 'client_service' || serviceType === 'wholesale' || serviceType === 'b2b' || !!req.user;

        if (req.file && isClientService) {
            const validation = storageService.validateFile(req.file);
            if (!validation.valid) {
                return ApiResponse.error(res, validation.message, 400);
            }

            const uploaded = await storageService.uploadToSupabaseStorage(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype
            );

            filePath = uploaded.filePath;
            fileName = uploaded.fileName;
            fileType = uploaded.fileType;
            fileSize = req.file.size;
        } else if (req.file) {
            // Instant Print: store metadata without consuming Supabase Storage
            fileName = req.file.originalname;
            fileType = req.file.mimetype;
            fileSize = req.file.size;
        }

        // Generate unique Request Number: e.g. WSR-839210
        const requestNumber = 'WSR-' + Math.floor(100000 + Math.random() * 900000);
        const userId = req.user ? req.user.id : null;

        // Insert into database
        const { data: serviceReq, error } = await supabaseAdmin
            .from('service_requests')
            .insert({
                request_number: requestNumber,
                user_id: userId,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: customerEmail || null,
                service_type: serviceType || 'quick_print',
                file_path: filePath,
                file_name: fileName || (req.body.fileName ? req.body.fileName : null),
                file_type: fileType,
                file_size: fileSize,
                print_type: printType || 'bw',
                print_sides: printSides || 'single',
                paper_size: paperSize || 'A4',
                paper_gsm: paperGsm || '80gsm',
                paper_type: paperType || 'copier',
                orientation: orientation || 'portrait',
                print_count: parseInt(printCount || '1', 10),
                page_count: parseInt(pageCount || '1', 10),
                page_range: pageRange || 'all',
                binding_type: bindingType || 'none',
                finishing: finishing || 'none',
                delivery_required: deliveryRequired === 'true' || deliveryRequired === true,
                delivery_address: deliveryAddress || null,
                delivery_time: deliveryTime || null,
                estimated_amount: parseFloat(estimatedAmount || '0.00'),
                notes: notes || null,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            logger.error('Error creating service request in DB:', error);
            throw error;
        }

        // Generate pre-filled WhatsApp Order Link
        const whatsappData = whatsappService.generateWhatsAppLink(serviceReq);

        return ApiResponse.success(res, 'Service request submitted successfully.', {
            request: serviceReq,
            whatsappUrl: whatsappData.whatsappUrl,
            formattedMessage: whatsappData.formattedMessage
        }, 201);
    } catch (err) {
        next(err);
    }
};

/**
 * Get Service Request details by ID
 */
const getRequestById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: request, error } = await supabaseAdmin
            .from('service_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !request) {
            return ApiResponse.error(res, 'Service request not found.', 404);
        }

        return ApiResponse.success(res, 'Service request retrieved.', { request });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createPrintRequest,
    getRequestById
};
