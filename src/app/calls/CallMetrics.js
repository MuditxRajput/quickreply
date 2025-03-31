export default function CallMetrics() {
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-100 rounded-lg">
          <h2 className="text-lg font-semibold">Calls Today</h2>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="p-4 bg-green-100 rounded-lg">
          <h2 className="text-lg font-semibold">Calls This Week</h2>
          <p className="text-2xl font-bold">45</p>
        </div>
        <div className="p-4 bg-purple-100 rounded-lg">
          <h2 className="text-lg font-semibold">Total Duration</h2>
          <p className="text-2xl font-bold">5h 23m</p>
        </div>
      </div>
    );
  }
  