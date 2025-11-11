import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

export default function ResumeOptimizer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Preparing analysis...");
  const [showResults, setShowResults] = useState(false);
  
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/ping`).catch(() => {});
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert("\u26A0 File too large! Please upload files under 5MB.");
      return;
    }
    setResumeFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

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
    setShowResults(false);
    setLoadingProgress(0);
    setLoadingText("Preparing analysis...");

    // Faster, more realistic progress simulation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 85) return prev;
        return prev + Math.random() * 20 + 5; // Faster progress
      });
    }, 150); // Faster updates

    const textInterval = setInterval(() => {
      setLoadingText(prev => {
        const texts = [
          "Preparing analysis...",
          "Reading resume...",
          "Analyzing requirements...",
          "Calculating ATS score...",
          "Generating insights...",
          "Finalizing results..."
        ];
        const currentIndex = texts.indexOf(prev);
        return texts[(currentIndex + 1) % texts.length];
      });
    }, 800); // Faster text changes

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/optimize`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 45000, // 45 second timeout
      });
      
      // Complete progress and show results faster
      clearInterval(progressInterval);
      clearInterval(textInterval);
      setLoadingProgress(100);
      setLoadingText("Analysis complete!");
      
      setTimeout(() => {
        setResult(res.data);
        setShowResults(true);
        setLoading(false);
      }, 300); // Faster transition
    } catch (err) {
      console.error(err);
      clearInterval(progressInterval);
      clearInterval(textInterval);
      setResult({ error: " Error analyzing resume. Please try again." });
      setShowResults(true);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setJobDesc("");
    setResult(null);
    setShowResults(false);
    setLoadingProgress(0);
    setLoadingText("Preparing analysis...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4 lg:mb-6 shadow-lg animate-bounceIn">
              <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 lg:mb-4">
              ResumeGenie AI
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              Transform your resume with AI-powered optimization and get noticed by recruiters
            </p>
          </div>

          <div className="flex flex-col items-center">
            {/* Upload & Job Description - Centered */}
            <div className="w-full max-w-2xl space-y-4 lg:space-y-6 mb-8">
              {/* Resume Upload */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Upload Resume</h2>
                </div>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? 'border-indigo-400 bg-indigo-50 scale-105'
                      : resumeFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    {isDragActive ? (
                      <p className="text-indigo-600 font-medium">Drop your resume here...</p>
                    ) : resumeFile ? (
                      <div>
                        <p className="text-green-600 font-medium mb-2">✓ {resumeFile.name}</p>
                        <p className="text-sm text-gray-500">Click to change file</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600 font-medium mb-2">Drag & drop your resume here</p>
                        <p className="text-sm text-gray-500">or click to browse</p>
                        <p className="text-xs text-gray-400 mt-2">Supports PDF, DOCX, TXT (max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Job Description</h2>
                </div>
                
                <textarea
                  placeholder="Paste the job description you're applying for here..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full h-40 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
                  maxLength={2000}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-400">
                    {jobDesc.length} / 2000 characters
                  </p>
                  <div className="w-24 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${(jobDesc.length / 2000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="relative">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !resumeFile || !jobDesc}
                    className={`w-full text-white font-semibold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all duration-300 transform relative overflow-hidden ${
                      loading || !resumeFile || !jobDesc
                        ? "bg-gray-400 cursor-not-allowed scale-100"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl"
                    }`}
                  >
                    {/* Progress bar overlay */}
                    {loading && (
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 transition-all duration-300"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    )}
                    
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      {loading && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-6 w-6 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      )}
                      <span className="text-lg">
                        {loading ? loadingText : "Optimize My Resume"}
                      </span>
                      {!loading && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      )}
                    </div>
                  </button>
                  
                  {/* Progress percentage */}
                  {loading && (
                    <div className="mt-2 text-center">
                      <div className="text-sm text-gray-600 font-medium">
                        {Math.round(loadingProgress)}% Complete
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${loadingProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {(resumeFile || jobDesc || result) && (
                  <button
                    onClick={handleReset}
                    className="w-full text-gray-600 font-medium py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Form
                  </button>
                )}
              </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
              <div className="w-full max-w-4xl animate-fadeIn">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-xl border border-white/20 text-center">
                  <div className="flex flex-col items-center space-y-6">
                    {/* Animated loading icon */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse-slow">
                        <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-bounce"></div>
                    </div>
                    
                    {/* Loading text with typing effect */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-800 animate-typing">
                        {loadingText}
                      </h3>
                      <p className="text-gray-600">
                        Please wait while we analyze your resume...
                      </p>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full max-w-md">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(loadingProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${loadingProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Animated dots */}
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Section - Centered */}
            {result && showResults && (
              <div className="w-full max-w-4xl animate-fadeIn">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20 animate-scaleIn">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Analysis Results
                    </h2>
                  </div>

                  {result.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-red-700 font-medium">{result.error}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* ATS Score */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 animate-stagger-1 hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">ATS Compatibility Score</h3>
                          <div className="text-3xl font-bold text-blue-600">
                            {result.ats_score || 0}%
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div
                            className={`h-3 rounded-full transition-all duration-2000 ease-out ${
                              (result.ats_score || 0) >= 80
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : (result.ats_score || 0) >= 60
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                : 'bg-gradient-to-r from-red-500 to-pink-500'
                            }`}
                            style={{ 
                              width: `${result.ats_score || 0}%`,
                              animation: 'progress 2s ease-out'
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {result.ats_score >= 80 
                            ? "🎉 Excellent! Your resume is highly ATS-compatible"
                            : result.ats_score >= 60
                            ? "⚠️ Good, but there's room for improvement"
                            : "❌ Your resume needs significant optimization for ATS systems"
                          }
                        </p>
                      </div>

                      {/* Missing Skills */}
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100 animate-stagger-2 hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <svg className="w-5 h-5 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Missing Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(result.missing_skills) && result.missing_skills.length > 0 ? (
                            result.missing_skills.map((skill, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-full border border-amber-200 hover:bg-amber-200 transition-colors duration-200"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <div className="flex items-center text-green-600">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="font-medium">All required skills are present! 🎉</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Suggestions */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 animate-stagger-3 hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Optimization Suggestions
                        </h3>
                        <div className="space-y-3">
                          {Array.isArray(result.suggestions) ? (
                            result.suggestions.map((suggestion, i) => (
                              <div key={i} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-purple-100">
                                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-purple-600 text-sm font-bold">{i + 1}</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{suggestion}</p>
                              </div>
                            ))
                          ) : (
                            <div className="bg-white p-4 rounded-lg border border-purple-100">
                              <p className="text-gray-700 text-sm leading-relaxed">{result.suggestions}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-100 animate-stagger-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Executive Summary
                        </h3>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-700 leading-relaxed">{result.summary}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
