"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export default function UploadCSV() {
  const [file, setFile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [Papa, setPapa] = useState(null);

  // Add useEffect to dynamically import Papa
  useEffect(() => {
    import('papaparse').then(module => {
      setPapa(module.default);
    });
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Parse CSV
  const handleParseCSV = () => {
    if (!file) return alert("Please select a CSV file.");
    if (!Papa) return alert("Parser is not ready yet.");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setContacts(result.data);
      },
    });
  };

  // Upload to API
  const handleUpload = async () => {
    if (contacts.length === 0) return alert("No contacts to upload.");

    try {
      const response = await axios.post("/api/contacts", { contacts });
      alert("Contacts uploaded successfully!");
      setContacts([]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console for details.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-2">Upload Contacts (CSV)</h2>
      
      {/* File Input */}
      <input type="file" accept=".csv" onChange={handleFileChange} className="mb-2" />
      
      {/* Parse & Upload Buttons */}
      <div className="flex gap-2">
        <button onClick={handleParseCSV} className="bg-blue-500 text-white px-4 py-2 rounded">
          Parse CSV
        </button>
        <button onClick={handleUpload} className="bg-green-500 text-white px-4 py-2 rounded">
          Upload Contacts
        </button>
      </div>

      {/* Preview Table */}
      {contacts.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-semibold">Preview ({contacts.length} contacts)</h3>
          <table className="w-full border-collapse border border-gray-300 mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {contacts.slice(0, 5).map((contact, index) => (
                <tr key={index} className="border">
                  <td className="p-2 border">{contact.fullName}</td>
                  <td className="p-2 border">{contact.email || "N/A"}</td>
                  <td className="p-2 border">{contact.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
