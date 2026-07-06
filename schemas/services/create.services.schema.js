const { z } = require('zod');

const optionalString = (max, message) => z.preprocess(
    (value) => value === null || value === '' ? undefined : value,
    z.string().max(max, message).optional()
);

const optionalNumber = z.preprocess(
    (value) => value === null || value === '' ? undefined : value,
    z.number()
        .min(1, 'Tenure months must be at least 1')
        .max(120, 'Tenure months cannot exceed 120')
        .optional()
);

const createServiceSchema = z.object({
    name: optionalString(100, 'Name cannot exceed 100 characters'),

    description: optionalString(500, 'Description cannot exceed 500 characters'),
    
    amount: z.number({
        error: (issue) => {
            if (issue.input === undefined) return 'Amount is required';
            if (issue.code === 'invalid_type') return 'Amount must be a number';
        }
    })
    .min(0, 'Amount cannot be negative'),

    tenure_months: optionalNumber,

    phone: optionalString(20, 'Phone cannot exceed 20 characters'),

    type: z.enum(['LOAN', 'ONE_TIME'], {
    error: (issue) => {
        return 'Type must be either LOAN or ONE_TIME';
    }
    }).default('ONE_TIME'),

    isGeneratePaymentLink: z.boolean().default(false),

    status: z.enum(['UNPAID', 'PAID'], {
        error: (issue) => {
            return 'Status must be either UNPAID or PAID';
        }
    }).default('UNPAID'),

    // expiresAt: z.string({})
}, {
    message: 'Invalid input data',
});

module.exports = createServiceSchema;
