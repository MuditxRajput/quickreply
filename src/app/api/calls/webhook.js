import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { callSid, status, recordingUrl, transcriptText, duration } = await req.json();

    // Find the call in the database
    const existingCall = await prisma.call.findUnique({
      where: { callSid },
    });

    if (!existingCall) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Update call details
    await prisma.call.update({
      where: { callSid },
      data: {
        status,
        endTime: new Date(),
        duration: duration || null,
        recordingUrl: recordingUrl || null,
        transcriptText: transcriptText || null,
      },
    });

    return NextResponse.json({ message: "Call updated successfully" });
  } catch (error) {
    console.error("Error updating call:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
