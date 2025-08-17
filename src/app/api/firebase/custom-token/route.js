import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";           // Admin SDK requires Node runtime

export async function GET() {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // Use Clerk userId as Firebase uid
  const token = await adminAuth.createCustomToken(userId);
  return NextResponse.json({ token });
}