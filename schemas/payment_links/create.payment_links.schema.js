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

const createPaymentLinkSchema = z.object({
    name: z.string({
        error: (issue) => {
            if (issue.input === undefined) return 'Name is required';
            if (issue.code === 'invalid_type') return 'Name must be a string';
        }
    })
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters'),

    description: z.string({
        error: (issue) => {
            if (issue.input === undefined) return 'Description is required';
            if (issue.code === 'invalid_type') return 'Description must be a string';
        }
    })
    .min(1, 'Description cannot be empty')
    .max(500, 'Description cannot exceed 500 characters'),

    amount: z.number({
        error: (issue) => {
            if (issue.input === undefined) return 'Amount is required';
            if (issue.code === 'invalid_type') return 'Amount must be a number';
        }
    })
    .min(1, 'Amount must be greater than zero'),

    tenure_months: tenureMonthsSchema,

    phone: z.string({
        error: (issue) => {
            if (issue.input === undefined) return 'Phone is required';
            if (issue.code === 'invalid_type') return 'Phone must be a string';
        }
    })
    .min(10, 'Phone must be at least 10 characters')
    .max(20, 'Phone cannot exceed 20 characters'),

    email: z.string({
        error: (issue) => {
            if (issue.input === undefined) return 'Email must be a string';
            if (issue.code === 'invalid_type') return 'Email must be a string';
        }
    })
    .email('Email must be valid')
    .optional(),

    type: z.enum(['LOAN', 'ONE_TIME'], {
        error: (issue) => {
            if (issue.input === undefined) return 'Type is required';
            return 'Type must be either LOAN or ONE_TIME';
        }
    }),

    status: z.enum(['UNPAID', 'PAID'], {
        error: (issue) => {
            if (issue.input === undefined) return 'Status is required';
            return 'Status must be either UNPAID or PAID';
        }
    }).default('UNPAID'),
}, {
    message: 'Invalid input data',
}).superRefine((data, ctx) => {
    if (data.type === 'LOAN' && !data.tenure_months) {
        ctx.addIssue({
            code: 'custom',
            path: ['tenure_months'],
            message: 'Tenure months is required for loan payment links',
        });
    }
});

module.exports = createPaymentLinkSchema;
