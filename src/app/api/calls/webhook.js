import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
      const data = await req.json();
      console.log("Webhook received:", JSON.stringify(data, null, 2));
      
      if (!data.call_id) {
        return NextResponse.json({ error: "Call ID missing" }, { status: 400 });
      }
  
      // Try different ways to identify the call
      let call;
      
      // First attempt: Look by Twilio SID
      try {
        call = await prisma.call.findUnique({
          where: { callSid: data.call_id }
        });
      } catch (e) {
        console.log("Error finding call by callSid:", e);
      }
  
      // Second attempt: Look by internal ID
      if (!call) {
        try {
          call = await prisma.call.findFirst({
            where: { id: data.call_id }
          });
        } catch (e) {
          console.log("Error finding call by id:", e);
        }
      }
  
      if (!call) {
        console.error("Call not found for ID:", data.call_id);
        return NextResponse.json({ success: true }); // Return success to avoid webhook retries
      }
  
      // Process different Retell AI event types
      switch (data.event) {
        case "call_ended":
          await handleCallEnded(data, call);
          break;
        case "transcript_ready":
          await handleTranscript(data, call);
          break;
        case "recording_ready":
          await handleRecording(data, call);
          break;
        case "qualification_result":
          await handleQualification(data, call);
          break;
        default:
          console.log("Unhandled event type:", data.event);
      }
  
      return NextResponse.json({ success: true });
  
    } catch (error) {
      console.error("Webhook processing error:", error);
      // Return success even on error to prevent webhook retries
      return NextResponse.json({ success: true });
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

async function handleCallEnded(data, call) {
    await prisma.call.update({
      where: { id: call.id }, // Use the found call's ID
      data: {
        status: "completed",
        endTime: new Date(data.end_time),
        duration: data.duration_seconds,
        summary: data.summary
      }
    });
  }
  
  async function handleTranscript(data, call) {
    await prisma.call.update({
      where: { id: call.id },
      data: { transcriptText: data.transcript }
    });
  }
  
  async function handleRecording(data, call) {
    await prisma.call.update({
      where: { id: call.id },
      data: { recordingUrl: data.recording_url }
    });
  }
  
  async function handleQualification(data, call) {
    await prisma.$transaction([
      prisma.call.update({
        where: { id: call.id },
        data: { qualification: data.result }
      }),
      prisma.contact.update({
        where: { id: call.contactId },
        data: { status: data.result === "qualified" ? "interested" : "completed" }
      })
    ]);
  }