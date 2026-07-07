const { z } = require('zod');

const updateServiceSchema = z.object({
    name: z.string({
        error: (issue) => {
            if (issue.input === undefined) return 'Name is required';
            if (issue.code === 'invalid_type') return 'Name must be a string';
        }
    })
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),

    description: z.string({
        error: (issue) => {
            if (issue.input === undefined) return 'Description is required';
            if (issue.code === 'invalid_type') return 'Description must be a string';
        }
    })
    .min(1, 'Description cannot be empty')
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),

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

    tenure_months: z.number({
        error: (issue) => {
            if (issue.input === undefined) return 'Tenure months is required';
            if (issue.code === 'invalid_type') return 'Tenure months must be a number';
        }
    })
    .min(1, 'Tenure months must be at least 1')
    .max(120, 'Tenure months cannot exceed 120')
    .optional(),

    phone: z.string({
        error: (issue) => {
            if (issue.input === undefined) return 'Phone is required';
            if (issue.code === 'invalid_type') return 'Phone must be a string';
        }
    })
    .min(10, 'Phone must be at least 10 characters')
    .max(20, 'Phone cannot exceed 20 characters')
    .optional(),

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

    status: z.enum(['UNPAID', 'PENDING', 'PAID', 'EXPIRED', 'CANCELLED'], {
        error: (issue) => {
            if (issue.input === undefined) return 'Status is required';
            return 'Status must be UNPAID, PENDING, PAID, EXPIRED, or CANCELLED';
        }
    })
    .optional(),

    // expiresAt: z.string({})
}, {
    message: 'Invalid input data',
});

module.exports = updateServiceSchema;
