import { NextResponse } from 'next/server';
import device from '@/lib/mikrotik';

export async function POST(req: Request) {
  const { username, password, profile, limitUpstream, limitDownstream } = await req.json();

  try {
    const api = await device.connect();
    
    await api.write('/ip/hotspot/user/add', [
      `=name=${username}`,
      `=password=${password}`,
      `=profile=${profile}`,
      `=limit-rate=${limitUpstream}/${limitDownstream}`,
      `=comment=Created via GNS Billing`
    ]);

    return NextResponse.json({ success: true, message: "User created on Router" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}