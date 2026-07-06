const { z } = require('zod');

const optionalString = (max, message) => z.preprocess(
    (value) => value === null || value === '' ? undefined : value,
    z.string().max(max, message).optional()
);

const updateServiceSchema = z.object({
    name: optionalString(100, 'Name cannot exceed 100 characters'),

    description: optionalString(500, 'Description cannot exceed 500 characters'),

    amount: z.number({
        error: (issue) => {
            if (issue.input === undefined) return 'Amount is required';
            if (issue.code === 'invalid_type') return 'Amount must be a number';
        }
    })
    .min(0, 'Amount cannot be negative')
    .optional(),

    email: z.string({
        error: (issue) => {
            if(issue.input === undefined) return "Email is required";
            if(issue.code === 'invalid_type') return "Email must be a string";
        }
    })
    .min(1, 'Email must not be empty')
    .max(100, "Email must not be greater than 100 characters")
    .optional(),

    tenure_months: z.preprocess(
    (value) => value === null || value === '' ? undefined : value,
    z.number()
    .min(1, 'Tenure months must be at least 1')
    .max(120, 'Tenure months cannot exceed 120')
    .optional()
    ),

    phone: optionalString(20, 'Phone cannot exceed 20 characters'),

    type: z.enum(['LOAN', 'ONE_TIME'], {
    error: (issue) => {
        if (issue.input === undefined) return 'Type is required';
        return 'Type must be either LOAN or ONE_TIME';
    }
    })
    .optional(),

    isGeneratePaymentLink: z.boolean({
        error: (issue) => {
            if (issue.input === undefined) return 'isGeneratePaymentLink is required';
            if (issue.code === 'invalid_type') return 'isGeneratePaymentLink must be a boolean';
        }
    })
    .optional(),

    status: z.enum(['UNPAID', 'PAID'], {
        error: (issue) => {
            if (issue.input === undefined) return 'Status is required';
            return 'Status must be either UNPAID or PAID';
        }
    })
    .optional(),

    // expiresAt: z.string({})
}, {
    message: 'Invalid input data',
});

module.exports = updateServiceSchema;
