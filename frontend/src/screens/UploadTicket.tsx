import React, { useState } from "react";

export default function UploadTicket() {
  const url = import.meta.env.VITE_API_URL;
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    console.log("Sending request to backend...");
    const res = await fetch(url + "/gemini/extract-receipt", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    console.log("Response received:", json);
    setResult(json);
  };

  return (
    <div>
      <input type="file" onChange={handleFile} accept="image/*" />
      <button onClick={handleSubmit}>Upload & Extract</button>

      {result && (
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
