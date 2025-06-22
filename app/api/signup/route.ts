import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return new NextResponse("Missing ID Token", { status: 400 });
    }

    // Create session cookie valid for 100 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in ms
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const cookieStore = await cookies();
    cookieStore.set("authToken", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: expiresIn / 1000, // in seconds
    });

    return new NextResponse("Signup successful", { status: 200 });
  } catch (error) {
    console.error("Signup error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
