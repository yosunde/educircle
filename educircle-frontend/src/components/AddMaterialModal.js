import React, { useState } from "react";
import AiFileCategorizer from "./AiFeatures/AiFileCategorizer";

const materialTypes = [
  { value: "project_report", label: "Project Report" },
  { value: "code_docs", label: "Code Docs" },
  { value: "presentation_video", label: "Presentation Video" },
  { value: "project_schedule", label: "Project Schedule" },
  { value: "github_link", label: "GitHub/GitLab Link" },
  { value: "project_photos", label: "Photos of the Project" }
];

const AddMaterialModal = ({ open, onClose, groupId, onMaterialAdded }) => {
  const [type, setType] = useState(materialTypes[0].value);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleUpload = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      let formData = new FormData();
      formData.append("file_type", type);
      formData.append("description", description);
      if (type === "github_link") {
        formData.append("github_link", link);
      } else {
        if (file) formData.append("file", file);
      }
      const res = await fetch(`/api/groups/${groupId}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      setType(materialTypes[0].value);
      setFile(null);
      setDescription("");
      setLink("");
      onClose();
      if (onMaterialAdded) onMaterialAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: "#eaf4e6", borderRadius: 16, padding: "32px 24px",
        minWidth: "400px", boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
        display: "flex", flexDirection: "column", gap: "16px"
      }}>
        <h3 style={{ margin: 0 }}>Add New Material</h3>
        
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Material Type:</label>
          <select
            value={type}
            onChange={handleTypeChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          >
            {materialTypes.map(mt => (
              <option key={mt.value} value={mt.value}>{mt.label}</option>
            ))}
          </select>
          
          {file && (
            <AiFileCategorizer 
              fileName={file.name}
              fileContent=""
              onCategoryGenerated={(category) => {
                const categoryMap = {
                  'Code': 'code_docs',
                  'Report': 'project_report',
                  'Presentation': 'presentation_video',
                  'Design': 'project_photos',
                  'Documentation': 'code_docs',
                  'Data': 'project_schedule',
                  'Other': type
                };
                const newType = categoryMap[category] || type;
                setType(newType);
              }}
            />
          )}
        </div>

        {type === "github_link" ? (
          <label style={{ fontSize: 18, fontWeight: 500 }}>
            GitHub/GitLab Link:
            <input type="text" value={link} onChange={e => setLink(e.target.value)} style={{ marginLeft: 8, fontSize: 16, padding: 6, borderRadius: 6, width: 180 }} placeholder="https://github.com/..." />
          </label>
        ) : (
          <label style={{ fontSize: 18, fontWeight: 500 }}>
            File:
            <input type="file" onChange={handleFileChange} style={{ marginLeft: 8, fontSize: 16 }} />
          </label>
        )}
        <label style={{ fontSize: 18, fontWeight: 500 }}>
          Description:
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} style={{ marginLeft: 8, fontSize: 16, padding: 6, borderRadius: 6, width: 180 }} />
        </label>
        {error && <div style={{ color: "#e74c3c", fontWeight: 500 }}>{error}</div>}
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <button onClick={onClose} style={{ background: "#eee", borderRadius: 8, padding: "10px 24px", fontSize: 17 }} disabled={loading}>Cancel</button>
          <button
            onClick={handleUpload}
            style={{ background: "#4caf50", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 17, fontWeight: 600 }}
            disabled={loading || (type !== "github_link" && !file) || (type === "github_link" && !link)}
          >{loading ? "Uploading..." : "Upload"}</button>
        </div>
      </div>
    </div>
  );
};

export default AddMaterialModal; 