const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
    PORT: process.env.PORT || 5000,
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://demo.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'demo-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-role-key',
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'smtp',
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    EMAIL_FROM: process.env.EMAIL_FROM || '"Winstar Digital Printing" <noreply@winstardigital.com>',
    WHATSAPP_BUSINESS_NUMBER: process.env.WHATSAPP_BUSINESS_NUMBER || '9345046665',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};
