export default function CallDetailModal({ call, onClose }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg w-1/2">
          <h2 className="text-xl font-bold">Call Details</h2>
  
          <p className="mt-2"><strong>Number:</strong> {call.number}</p>
          <p><strong>Duration:</strong> {call.duration}</p>
          <p><strong>Summary:</strong> {call.summary}</p>
  
          {/* Placeholder for Transcript & Recording */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm font-semibold">Transcript:</p>
            <p className="text-sm">Lorem ipsum transcript here...</p>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-semibold">Audio Recording:</p>
            <audio controls>
              <source src="/sample-audio.mp3" type="audio/mp3" />
            </audio>
          </div>
  
          <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
            Close
          </button>
        </div>
      </div>
    );
  }
  