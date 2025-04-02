import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Helper function to calculate the start of a period
const getPeriodStart = (date, period) => {
  const d = new Date(date);
  if (period === "year") {
    d.setMonth(0, 1); // Start of the year
    d.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    d.setDate(1); // Start of the month
    d.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const day = d.getDay();
    d.setDate(d.getDate() - day); // Start of the week (Sunday)
    d.setHours(0, 0, 0, 0);
  }
  return d;
};

export async function GET(req) {
  try {
    // Get the auth_token cookie
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify the JWT and extract userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "reply");
    const userId = decoded.id;

    // Verify the user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch aggregated call statistics
    const totalCalls = await prisma.call.count({ where: { userId } });
    const completedCalls = await prisma.call.count({
      where: { userId, status: "completed" },
    });
    const successRate = totalCalls > 0 ? ((completedCalls / totalCalls) * 100).toFixed(2) : 0;

    // Fetch average call duration
    const avgDurationResult = await prisma.call.aggregate({
      _avg: { duration: true },
      where: { userId, duration: { not: null } },
    });
    const avgDuration = avgDurationResult._avg.duration || 0;

    // Fetch daily call trends for the last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // Last 7 days including today
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTrends = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(sevenDaysAgo);
      dayStart.setDate(sevenDaysAgo.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const dateStr = dayStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      // Fetch total calls for the day
      const totalCallsForDay = await prisma.call.count({
        where: {
          userId,
          startTime: { gte: dayStart, lt: dayEnd },
        },
      });

      // Fetch completed calls for the day
      const completedCallsForDay = await prisma.call.count({
        where: {
          userId,
          startTime: { gte: dayStart, lt: dayEnd },
          status: "completed",
        },
      });

      // Fetch failed calls for the day
      const failedCallsForDay = await prisma.call.count({
        where: {
          userId,
          startTime: { gte: dayStart, lt: dayEnd },
          status: "failed",
        },
      });

      // Fetch average duration for the day
      const avgDurationForDayData = await prisma.call.aggregate({
        _avg: { duration: true },
        where: {
          userId,
          startTime: { gte: dayStart, lt: dayEnd },
          duration: { not: null },
        },
      });
      const avgDurationForDay = avgDurationForDayData._avg.duration || 0;

      dailyTrends.push({
        date: dateStr,
        totalCalls: totalCallsForDay,
        completed: completedCallsForDay,
        failed: failedCallsForDay,
        avgDuration: avgDurationForDay,
      });
    }

    // Fetch call status distribution
    const statusCounts = await prisma.call.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    });

    const statusDistribution = statusCounts.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1), // Capitalize status
      value: item._count.status,
    }));

    // Fetch recent calls (limited to 5 for dashboard)
    const recentCalls = await prisma.call.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
      take: 5,
      select: {
        callSid: true,
        status: true,
        startTime: true,
        duration: true,
        direction: true,
        qualification: true,
        recordingUrl: true,
        publicLogUrl: true,
        disconnectionReason: true,
        cost: true,
        transcriptText: true,
        contact: {
          select: {
            phone: true,
            fullName: true,
          },
        },
      },
    });

    // Format recent calls
    const formattedRecentCalls = recentCalls.map(call => ({
      callSid: call.callSid,
      status: call.status,
      startTime: call.startTime,
      duration: call.duration,
      direction: call.direction,
      qualification: call.qualification,
      recordingUrl: call.recordingUrl,
      publicLogUrl: call.publicLogUrl,
      disconnectionReason: call.disconnectionReason,
      cost: call.cost,
      transcriptText: call.transcriptText,
      contactPhone: call.contact?.phone || "Unknown",
      contactName: call.contact?.fullName || "Unknown",
    }));

    return NextResponse.json({
      totalCalls,
      successRate,
      avgDuration,
      callTrends: dailyTrends,
      statusDistribution,
      recentCalls: formattedRecentCalls,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}