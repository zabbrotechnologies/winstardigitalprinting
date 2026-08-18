const authService = require('../services/authService');
const ApiResponse = require('../utils/response');

const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        return ApiResponse.success(res, result.message, result, 201);
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        return ApiResponse.success(res, 'Login successful.', result);
    } catch (err) {
        if (err.statusCode === 403) {
            return ApiResponse.error(res, err.message, 403, { status: err.status });
        }
        next(err);
    }
};

const getMe = async (req, res, next) => {
    try {
        return ApiResponse.success(res, 'User authenticated.', {
            profile: req.profile
        });
    } catch (err) {
        next(err);
    }
};

const logout = async (req, res, next) => {
    try {
        return ApiResponse.success(res, 'Logged out successfully.');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login,
    getMe,
    logout
};
