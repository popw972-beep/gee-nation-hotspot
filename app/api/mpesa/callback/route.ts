import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import device from '@/lib/mikrotik';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const body = data.Body.stkCallback;

    if (body.ResultCode === 0) {
      const checkoutID = body.CheckoutRequestID;
      const metadata = body.CallbackMetadata.Item;
      const amount = metadata.find((i: any) => i.Name === 'Amount').Value;
      const receipt = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber').Value;
      const phone = metadata.find((i: any) => i.Name === 'PhoneNumber').Value;

      const transaction = await prisma.transaction.update({
        where: { checkoutRequestId: checkoutID },
        data: {
          status: 'Completed',
          mpesaReceipt: receipt
        }
      });

      await activateHotspotUser(phone, transaction.amount);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error: any) {
    console.error('Callback error:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Rejected" }, { status: 400 });
  }
}

async function activateHotspotUser(phone: string, amount: number) {
  try {
    const api = await device.connect();
    
    let profile = '1Day_Profile';
    if (amount === 20) profile = '1Hour_Profile';
    if (amount === 50) profile = '3Hours_Profile';
    if (amount === 250) profile = '3Days_Profile';
    if (amount === 500) profile = '1Week_Profile';

    await api.write('/ip/hotspot/user/add', [
      `=name=${phone}`,
      `=password=${phone}`,
      `=profile=${profile}`
    ]);

    console.log(`Hotspot user activated for ${phone}`);
  } catch (error: any) {
    console.error('MikroTik activation error:', error.message);
  }
}