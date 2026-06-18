const { z } = require('zod');

const changePasswordSchema = z.object({
    currentPassword: z.string({
        error: (issue) => {
            if (issue.input === undefined) return 'Current password is required';
            if (issue.code === 'invalid_type') return 'Current password must be a string';
        }
    })
    .min(8, 'Current password must be at least 8 characters long')
    .max(100, 'Current password cannot exceed 100 characters'),
    newPassword: z.string({
        error: (issue) => {
            if (issue.input === undefined) return 'New password is required';
            if (issue.code === 'invalid_type') return 'New password must be a string';
        }
    })
    .min(8, 'New password must be at least 8 characters long')
    .max(100, 'New password cannot exceed 100 characters'),
}, {
    message: 'Invalid input data',
});

module.exports = changePasswordSchema;