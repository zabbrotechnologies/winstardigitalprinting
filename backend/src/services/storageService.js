const { supabaseAdmin } = require('../config/supabase');
const logger = require('../utils/logger');
const path = require('path');

const BUCKET_NAME = 'print-files';

const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/jpg'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Validates uploaded file MIME type and size
 */
const validateFile = (file) => {
    if (!file) {
        return { valid: false, message: 'No file uploaded.' };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return { 
            valid: false, 
            message: `Unsupported file type: ${file.mimetype}. Allowed formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG.` 
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, message: 'File size exceeds 50MB limit.' };
    }

    return { valid: true };
};

/**
 * Uploads a file buffer to Supabase Storage bucket 'print-files'
 */
const uploadToSupabaseStorage = async (fileBuffer, originalName, mimeType) => {
    try {
        const ext = path.extname(originalName) || '.pdf';
        const sanitizedBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${sanitizedBaseName}${ext}`;
        const filePath = `uploads/${uniqueFileName}`;

        // Ensure bucket exists in Supabase Storage
        const { data: buckets, error: bucketErr } = await supabaseAdmin.storage.listBuckets();
        if (!bucketErr && buckets) {
            const exists = buckets.some(b => b.name === BUCKET_NAME);
            if (!exists) {
                await supabaseAdmin.storage.createBucket(BUCKET_NAME, { public: true });
            }
        }

        const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(filePath, fileBuffer, {
                contentType: mimeType,
                upsert: false
            });

        if (error) {
            logger.error('Supabase Storage upload error:', error);
            throw new Error(`Failed to upload file to storage: ${error.message}`);
        }

        // Get Public URL
        const { data: publicUrlData } = supabaseAdmin.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return {
            filePath,
            publicUrl: publicUrlData ? publicUrlData.publicUrl : null,
            fileName: originalName,
            fileType: mimeType
        };
    } catch (err) {
        logger.error('Error in uploadToSupabaseStorage:', err);
        throw err;
    }
};

/**
 * Deletes a file from Supabase Storage bucket 'print-files'
 */
const deleteFromSupabaseStorage = async (filePath) => {
    try {
        if (!filePath) return false;

        const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            logger.error(`Failed to delete file ${filePath} from Supabase storage:`, error);
            return false;
        }

        logger.info(`Successfully deleted file ${filePath} from Supabase Storage bucket '${BUCKET_NAME}'`);
        return true;
    } catch (err) {
        logger.error('Error in deleteFromSupabaseStorage:', err);
        return false;
    }
};

/**
 * Get Public Download URL for a file
 */
const getPublicUrl = (filePath) => {
    if (!filePath) return null;
    const { data } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
    return data ? data.publicUrl : null;
};

module.exports = {
    validateFile,
    uploadToSupabaseStorage,
    deleteFromSupabaseStorage,
    getPublicUrl
};
