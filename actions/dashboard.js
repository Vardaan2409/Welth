"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = { ...obj };

    if(obj.balance){
        serialized.balance = obj.balance.toNumber();
    }

    if(obj.amount){
        serialized.amount = obj.amount.toNumber();
    }

    return serialized;
};

export async function createAccount(data) {
    try {
        const { userId }= await auth();
        if(!userId) 
            throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });

        if(!user){
            throw new Error("User not found");
        }

        //Convert balance to float before saving
        const balanceFloat = parseFloat(data.balance);
        if(isNaN(balanceFloat)){ //NaN --> Not A Number
            throw new Error("Invalid balance amount");
        }

        //Check if this is the User's first account
        const existingAccounts = await db.account.findMany({
            where: {
                userId: user.id
            }
        });

        // If it's the first account, make it default regardless of user input
        // If not, use the user's preference
        const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

        //If the account should be default, unset the other default accounts
        if(shouldBeDefault){
            await db.account.updateMany({
                where: {
                    userId: user.id,
                    isDefault: true
                },
                data: {
                    isDefault: false
                },
            });
        }

        const account = await db.account.create({
            data:{
                ...data,
                balance: balanceFloat, //Nextjs does not take decimal value so we need to convert it back to number
                userId: user.id,
                isDefault: shouldBeDefault,
            },
        });

        // Serialize the account before returning
        const serializedAccount = serializeTransaction(account);

        revalidatePath("/dashboard");
        return { success: true, data: serializedAccount };

    } catch (error) {
        throw new Error (error.message);
    }
}

export async function getUserAccounts() {
    const { userId } = await auth();
        if(!userId) 
            throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });

        if(!user){
            throw new Error("User not found");
        }

        try {
            const accounts = await db.account.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: "desc"},
                include: {
                    _count: {
                        select: {
                            transactions: true,
                        },
                    },
                },
            });
    
            const serializedAccount = accounts.map(serializeTransaction);
    
            return serializedAccount;
        } catch (error) {
            console.error(error);
        }
}