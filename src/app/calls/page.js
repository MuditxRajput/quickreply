"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState } from "react";
import CallDetailModal from "./CallDetailModal";
import CallMetrics from "./CallMetrics";
import CallTable from "./CallTable";
import UploadCSV from "./UploadCSV"; // Import CSV Upload

export default function AICallsPage() {
  const [selectedCall, setSelectedCall] = useState(null);

  return (
    <div className="flex h-screen">
      {/* Sidebar (Left) */}
      <Sidebar />

      {/* AI Calls Section (Right) */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">AI Calls Dashboard</h1>

        {/* CSV Upload */}
        <UploadCSV />

        {/* Call Metrics */}
        <CallMetrics />

        {/* Recent Calls Table */}
        <CallTable setSelectedCall={setSelectedCall} />

        {/* Call Detail Modal */}
        {selectedCall && <CallDetailModal call={selectedCall} onClose={() => setSelectedCall(null)} />}
      </div>
    </div>
  );
}
