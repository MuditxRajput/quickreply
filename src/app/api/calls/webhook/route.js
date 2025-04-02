import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { event, call } = await req.json();
    if (!event || !call || !call.call_id) {
      console.error("Invalid webhook payload:", { event, call });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.log(`Webhook event received: ${event}`, JSON.stringify(call, null, 2));

    switch (event) {
      case "call_started":
        if (!call.start_timestamp) {
          console.warn("Missing start_timestamp in call_started event");
          break;
        }
        await prisma.call.update({
          where: { callSid: call.call_id },
          data: { status: "started", startTime: new Date(call.start_timestamp) },
        });
        break;

      case "call_ended":
        if (!call.start_timestamp || !call.end_timestamp) {
          console.warn("Missing timestamps in call_ended event");
          break;
        }
        const duration = (call.end_timestamp - call.start_timestamp) / 1000; // Duration in seconds
        await prisma.call.update({
          where: { callSid: call.call_id },
          data: {
            status: "completed",
            endTime: new Date(call.end_timestamp),
            duration,
            transcriptText: call.transcript || "No transcript available",
            recordingUrl: call.recording_url || null,
          },
        });
        break;

      case "call_analyzed":
        if (!call.call_analysis) {
          console.warn("Missing call_analysis in call_analyzed event");
          break;
        }
        await prisma.call.update({
          where: { callSid: call.call_id },
          data: {
            summary: call.call_analysis.call_summary || "No summary available",
            qualification: call.call_analysis.user_sentiment || "Unknown",
          },
        });
        break;

      default:
        console.log("Unhandled event:", event);
    }

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error("Webhook error:", error.message, error.stack);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" }, { status: 200 });
}