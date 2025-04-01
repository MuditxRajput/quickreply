import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const data = await req.json();
    
    if (!data.call_id) {
      return NextResponse.json({ error: "Call ID missing" }, { status: 400 });
    }

    // Process different Retell AI event types
    switch (data.event) {
      case "call_ended":
        await handleCallEnded(data);
        break;
      case "transcript_ready":
        await handleTranscript(data);
        break;
      case "recording_ready":
        await handleRecording(data);
        break;
      case "qualification_result":
        await handleQualification(data);
        break;
      default:
        console.log("Unhandled event type:", data.event);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

async function handleCallEnded(data) {
  await prisma.call.update({
    where: { callSid: data.call_id },
    data: {
      status: "completed",
      endTime: new Date(data.end_time),
      duration: data.duration_seconds,
      summary: data.summary
    }
  });
}

async function handleTranscript(data) {
  await prisma.call.update({
    where: { callSid: data.call_id },
    data: { transcriptText: data.transcript }
  });
}

async function handleRecording(data) {
  await prisma.call.update({
    where: { callSid: data.call_id },
    data: { recordingUrl: data.recording_url }
  });
}

async function handleQualification(data) {
  await prisma.$transaction([
    prisma.call.update({
      where: { callSid: data.call_id },
      data: { qualification: data.result }
    }),
    prisma.contact.update({
      where: { id: data.contact_id },
      data: { status: data.result === "qualified" ? "interested" : "completed" }
    })
  ]);
}