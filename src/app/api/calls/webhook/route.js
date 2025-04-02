import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { event, call } = await req.json();
    console.log(`Webhook event received: ${event}`, call);

    switch (event) {
      case "call_started":
        await prisma.call.update({
          where: { callSid: call.call_id },
          data: { status: "started", startTime: new Date(call.start_timestamp) },
        });
        break;

      case "call_ended":
        const duration = (call.end_timestamp - call.start_timestamp) / 1000; // Duration in seconds
        await prisma.call.update({
          where: { callSid: call.call_id },
          data: {
            status: "completed",
            endTime: new Date(call.end_timestamp),
            duration,
            transcript: call.transcript || "No transcript available",
          },
        });
        break;

      case "call_analyzed":
        await prisma.call.update({
          where: { callSid: call.call_id },
          data: {
            summary: call.post_call_analysis?.summary,
            sentiment: call.post_call_analysis?.user_sentiment,
            customData: JSON.stringify(call.post_call_analysis?.custom_analysis_data),
          },
        });
        break;

      default:
        console.log("Unhandled event:", event);
    }

    return NextResponse.json({}, { status: 204 }); // Acknowledge receipt
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}