import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
   
    // Get the token from cookies
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "reply");

    // Return user data
    return NextResponse.json({
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        phone: decoded.phone
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
} 