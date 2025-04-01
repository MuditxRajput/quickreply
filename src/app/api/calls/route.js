// import { PrismaClient } from "@prisma/client";
// import { NextResponse } from "next/server";

// const prisma = new PrismaClient();

// // Get all calls
// export async function GET() {
//   try {
//     const calls = await prisma.call.findMany({
//       include: {
//         user: true,
//         contact: true,
//       },
//     });
//     return NextResponse.json(calls, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 });
//   }
// }

// // Create a new call
// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { userId, contactId, direction, status, startTime } = body;

//     if (!userId || !contactId || !direction || !status || !startTime) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     const newCall = await prisma.call.create({
//       data: {
//         userId,
//         contactId,
//         direction,
//         status,
//         startTime: new Date(startTime),
//       },
//     });

//     return NextResponse.json(newCall, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to create call" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import twilio from "twilio";

const prisma = new PrismaClient();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const RETELL_AI_WEBHOOK = process.env.RETELL_AI_WEBHOOK_URL;

export async function POST(req) {
  try {
    const { contactId } = await req.json();

    // Fetch the contact from Prisma
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    if (!contact.phone) {
      return NextResponse.json({ error: "Phone number is missing for this contact" }, { status: 400 });
    }

    // Start AI-powered call using Twilio & Retell.ai
    const call = await client.calls.create({
      to: contact.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: RETELL_AI_WEBHOOK, // Retell.ai handles the conversation
    });

    // Save call log in Prisma
    const savedCall = await prisma.call.create({
      data: {
        userId: contact.userId,
        contactId: contact.id,
        direction: "outbound",
        status: "scheduled",
        startTime: new Date(),
        callSid: call.sid,
      },
    });

    return NextResponse.json({ message: "Call initiated successfully", callId: savedCall.id, callSid: call.sid });
  } catch (error) {
    console.error("Call initiation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
