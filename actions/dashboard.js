"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getUserAccounts() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const accounts = await db.account.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            transactions: {
                orderBy: {
                    date: "desc",
                },
            },
            _count: {
                select: {
                    transactions: true,
                },
            },
        },
    });

    return accounts;
}

export async function getCurrentBudget(accountId) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const budget = await db.budget.findFirst({
        where: {
            accountId,
            userId: session.user.id,
        },
    });

    return budget;
}