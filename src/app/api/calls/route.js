import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Get all calls
export async function GET() {
  try {
    const calls = await prisma.call.findMany({
      include: {
        user: true,
        contact: true,
      },
    });
    return NextResponse.json(calls, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 });
  }
}

// Create a new call
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, contactId, direction, status, startTime } = body;

    if (!userId || !contactId || !direction || !status || !startTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newCall = await prisma.call.create({
      data: {
        userId,
        contactId,
        direction,
        status,
        startTime: new Date(startTime),
      },
    });

    return NextResponse.json(newCall, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create call" }, { status: 500 });
  }
}
