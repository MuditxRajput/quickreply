import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import twilio from "twilio";
const prisma = new PrismaClient();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req) {
  try {
    
    const token = req.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
   

    // Verify the token and get userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "reply");
    const userId = decoded.id;
    const { contactId } = await req.json();
    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const contact = await prisma.contact.findUnique({ where: { id: contactId, userId } });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Create call record
    const callRecord = await prisma.call.create({
      data: {
        userId,
        contactId,
        direction: "outbound",
        status: "scheduled",
        startTime: new Date()
      }
    });

    // Prepare metadata for Retell AI
    const callMetadata = {
      callId: callRecord.id,
      userId,
      contactInfo: {
        name: contact.fullName,
        phone: contact.phone,
        email: contact.email,
        category: contact.category
      },
      qualificationCriteria: contact.category ? `Interested in ${contact.category}` : "General inquiry"
    };

    // Configure Twilio with Retell AI
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.connect({
      action: `/api/calls/status?callId=${callRecord.id}`,
    }).stream({
      url: `wss://api.retellai.com/call/${process.env.RETELL_AGENT_ID}`,
      track: "both_tracks",
      metadata: JSON.stringify(callMetadata)
    });

    // Initiate call
    const call = await client.calls.create({
      to: contact.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      twiml: twiml.toString(),
      statusCallback: `/api/calls/status?callId=${callRecord.id}`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"]
    });

    // Update call with Twilio SID
    await prisma.call.update({
      where: { id: callRecord.id },
      data: { callSid: call.sid, status: "initiated" }
    });

    return NextResponse.json({
      success: true,
      callId: callRecord.id,
      callSid: call.sid
    });

  } catch (error) {
    console.error("Call initiation failed:", error);
    return NextResponse.json(
      { error: "Failed to initiate call", details: error.message },
      { status: 500 }
    );
  }
}
