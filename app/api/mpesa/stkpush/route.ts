import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { stkPush } from '@/lib/mpesa';

export async function POST(request: Request) {
  try {
    const { phone, amount, packageId } = await request.json();

    const transaction = await prisma.transaction.create({
      data: {
        phoneNumber: phone,
        amount: amount,
        status: 'Pending',
        merchantRequestId: `MR-${Date.now()}`,
        checkoutRequestId: `CR-${Date.now()}`,
      }
    });

    const result = await stkPush(phone, amount);

    return NextResponse.json({
      success: true,
      data: result.data,
      transactionId: transaction.id
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}