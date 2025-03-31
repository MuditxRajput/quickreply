export default function CallTable({ setSelectedCall }) {
    const recentCalls = [
      { id: 1, date: "2024-07-30", time: "10:15 AM", number: "+1234567890", duration: "5m", summary: "Interested in demo" },
      { id: 2, date: "2024-07-30", time: "11:30 AM", number: "+9876543210", duration: "7m", summary: "Asked for callback" },
    ];
  
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-3">Recent Calls</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Date</th>
              <th className="p-2">Time</th>
              <th className="p-2">Number</th>
              <th className="p-2">Duration</th>
              <th className="p-2">Summary</th>
            </tr>
          </thead>
          <tbody>
            {recentCalls.map((call) => (
              <tr
                key={call.id}
                className="border-b cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedCall(call)}
              >
                <td className="p-2">{call.date}</td>
                <td className="p-2">{call.time}</td>
                <td className="p-2">{call.number}</td>
                <td className="p-2">{call.duration}</td>
                <td className="p-2">{call.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  