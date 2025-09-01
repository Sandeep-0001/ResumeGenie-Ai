import React, { useState } from "react";
import axios from "axios";

export default function ResumeOptimizer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert("\u26A0 File too large! Please upload files under 5MB.");
      return;
    }
    setResumeFile(file);
  };

  const handleSubmit = async () => {
    if (!resumeFile || !jobDesc) {
      alert("\u26A0 Please upload a resume and paste a job description.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDesc", jobDesc);

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/optimize`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setResult({ error: " Error analyzing resume. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">
            ResumeGenie–AI
          </h1>
          <p className="text-gray-600">Boost your resume with AI-powered insights</p>
        </div>

        {/* Resume Upload */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">
             Upload Resume
          </label>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {resumeFile && (
            <p className="text-sm text-gray-500 mt-1">
               {resumeFile.name}
            </p>
          )}
        </div>

        {/* Job Description */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">
             Job Description
          </label>
          <textarea
            placeholder="Paste job description here..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={6}
          />
          <p className="text-xs text-gray-400 mt-1">
            {jobDesc.length} / 2000 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full text-white font-semibold py-3 rounded-lg shadow-md transition-colors ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? " Analyzing..." : " Optimize Resume"}
        </button>

        {/* Result Section */}
        {result && (
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4 text-center text-blue-700">
               Optimization Results
            </h2>

            {result.error ? (
              <div className="bg-red-100 text-red-700 p-3 rounded text-center">
                {result.error}
              </div>
            ) : (
              <>
                {/* ATS Score */}
                <div className="mb-4">
                  <strong>ATS Score:</strong>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
                    <div
                      className="bg-green-500 h-4 rounded-full"
                      style={{ width: `${result.ats_score || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {result.ats_score || "N/A"}%
                  </p>
                </div>

                {/* Missing Skills */}
                <div className="mb-4">
                  <strong>Missing Skills:</strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(result.missing_skills) && result.missing_skills.length > 0 ? (
                      result.missing_skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-600">None 🎉</p>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="mb-4">
                  <strong>Suggestions:</strong>
                  <pre className="bg-white p-3 rounded-lg border text-sm whitespace-pre-wrap">
                    {Array.isArray(result.suggestions)
                      ? result.suggestions.map((s, i) => `• ${s}`).join("\n")
                      : result.suggestions}
                  </pre>
                </div>

                {/* Summary */}
                <div>
                  <strong>Summary:</strong>
                  <pre className="bg-white p-3 rounded-lg border text-sm whitespace-pre-wrap">
                    {result.summary}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
