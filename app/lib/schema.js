import { z } from "zod";

export const accountSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["CURRENT", "SAVINGS"]),
    balance: z.string().min(1, "Initial balance is required"),
    isDefault: z.boolean().default(false),
});

export const transactionSchema = z.object({
    type: z.enum(["income", "expense"]),
    amount: z.string().min(1, "Amount is required"),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    date: z.date(),
    description: z.string().optional(),
    isRecurring: z.boolean(),
    recurringInterval: z.string().optional(),
});