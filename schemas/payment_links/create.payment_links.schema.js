const { z } = require('zod');

const tenureMonthsSchema = z.preprocess(
    (value) => value === null || value === '' ? undefined : value,
    z.number({
        error: (issue) => {
            if (issue.code === 'invalid_type') return 'Tenure months must be a number';
        }
    })
    .min(1, 'Tenure months must be at least 1')
    .max(120, 'Tenure months cannot exceed 120')
    .optional()
);

const optionalString = (max, message) => z.preprocess(
    (value) => value === null || value === '' ? undefined : value,
    z.string().max(max, message).optional()
);

const optionalEmail = z.preprocess(
    (value) => value === null || value === '' ? undefined : value,
    z.string({
        error: (issue) => {
            if (issue.code === 'invalid_type') return 'Email must be a string';
        }
    })
    .email('Email must be valid')
    .optional()
);

const createPaymentLinkSchema = z.object({
    name: optionalString(100, 'Name cannot exceed 100 characters'),

    description: optionalString(500, 'Description cannot exceed 500 characters'),

    amount: z.number({
        error: (issue) => {
            if (issue.input === undefined) return 'Amount is required';
            if (issue.code === 'invalid_type') return 'Amount must be a number';
        }
    })
    .min(1, 'Amount must be greater than zero'),

    tenure_months: tenureMonthsSchema,

    phone: optionalString(20, 'Phone cannot exceed 20 characters'),

    email: optionalEmail,

    type: z.enum(['LOAN', 'ONE_TIME'], {
        error: (issue) => {
            return 'Type must be either LOAN or ONE_TIME';
        }
    }).default('ONE_TIME'),

    status: z.enum(['UNPAID', 'PAID'], {
        error: (issue) => {
            if (issue.input === undefined) return 'Status is required';
            return 'Status must be either UNPAID or PAID';
        }
    }).default('UNPAID'),
}, {
    message: 'Invalid input data',
});

module.exports = createPaymentLinkSchema;
