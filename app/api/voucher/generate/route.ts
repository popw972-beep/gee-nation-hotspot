import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { planName, count } = await req.json();

  try {
    const vouchers = [];
    for (let i = 0; i < count; i++) {
      const code = `GNS-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      
      vouchers.push({
        code: code,
        plan: planName,
        isUsed: false
      });
    }

    await prisma.voucher.createMany({
      data: vouchers,
      skipDuplicates: true
    });

    return NextResponse.json({ success: true, message: `Generated ${count} vouchers` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}