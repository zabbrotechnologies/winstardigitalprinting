/**
 * Standard API Response Helper
 */
class ApiResponse {
    static success(res, message, data = null, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            ...(data && { data })
        });
    }

    static error(res, message, statusCode = 400, errors = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            ...(errors && { errors })
        });
    }
}

module.exports = ApiResponse;
