import { PrismaClient } from "@prisma/client";
import axios from "axios";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    console.log("Starting call initiation");
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
        startTime: new Date(),
      },
    });

    // Prepare metadata for Retell AI
    const callMetadata = {
      callId: callRecord.id,
      userId,
      contactInfo: {
        name: contact.fullName,
        phone: contact.phone,
        email: contact.email,
        category: contact.category,
      },
      qualificationCriteria: contact.category ? `Interested in ${contact.category}` : "General inquiry",
    };

    // Initiate call using Retell AI API
    const retellResponse = await axios.post(
      "https://api.retellai.com/v2/create-phone-call",
      {
        from_number: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number linked to Retell
        to_number: contact.phone, // Customer's number
        override_agent_id: process.env.RETELL_AGENT_ID, // Your Retell agent ID
        metadata: callMetadata, // Optional: Pass metadata to Retell
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Update call record with Retell call ID
    await prisma.call.update({
      where: { id: callRecord.id },
      data: {
        callSid: retellResponse.data.call_id, // Retell uses call_id, not Twilio's SID
        status: "initiated",
      },
    });

    return NextResponse.json({
      success: true,
      callId: callRecord.id,
      retellCallId: retellResponse.data.call_id,
    });
  } catch (error) {
    console.error("Call initiation failed:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to initiate call", details: error.message },
      { status: 500 }
    );
  }
}