import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, CloudUpload, FileText, CheckCircle2, AlertCircle, Download, RotateCcw } from 'lucide-react';

export default function ResumeAnalyzerView() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  
  // Interactive UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);

  // Validate file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF resume file.');
      setFile(null);
    } else {
      setError('');
      setFile(selectedFile);
    }
  };

  // Submit form for AI analysis
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please upload your resume PDF first.');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please paste the target Job Description to compare.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    setIsLoading(true);

    try {
      const res = await api.post('/ai/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI analysis failed. Please verify configurations and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset analysis view to compare another
  const handleReset = () => {
    setFile(null);
    setJobDescription('');
    setAnalysis(null);
    setError('');
  };

  // Generate and download raw text report locally
  const downloadReport = () => {
    if (!analysis) return;

    const reportContent = `==================================================
CAREERVAULT AI - RESUME ANALYSIS REPORT
==================================================
Candidate: ${user?.name || 'User'}
Email: ${user?.email || 'N/A'}
Job Match Score: ${analysis.matchScore}%
Generated On: ${new Date().toLocaleDateString()}

MATCHING SKILLS IDENTIFIED:
---------------------------
${analysis.matchingSkills.join(', ') || 'No matching skills found.'}

MISSING SKILLS / GAP ANALYSIS:
------------------------------
${analysis.missingSkills.join(', ') || 'No critical gaps identified.'}

ATS OPTIMIZATION CRITIQUE:
--------------------------
${analysis.atsOptimization}

IMPROVEMENT SUGGESTIONS:
------------------------
${analysis.improvementSuggestions}

==================================================
Prepared by CareerVault AI Placement Assistant.
`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analysis.matchScore}_match_ats_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Delay revocation to ensure browser successfully downloads the file before invalidating the URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand animate-pulse" />
          AI Resume Analyzer
        </h2>
        <p className="text-xs text-dark-400 mt-1">Audit your resume compatibility against job descriptions using Google Gemini AI.</p>
      </div>

      {/* Conditionally render: Form Input OR Analysis Output */}
      {!analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Controls Column */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-2xl h-fit">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <CloudUpload className="w-4.5 h-4.5 text-brand" />
              Upload Assets
            </h3>

            {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/10 p-3 rounded-lg mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1.5">Resume PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none text-dark-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-brand/10 file:text-brand file:cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand/10 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Analyze Resume
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Job Description Column */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-violet-400" />
              Target Job Description (JD)
            </h3>
            <textarea
              placeholder="Paste the full job description here (responsibilities, requirements, skills list)..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full flex-grow min-h-[250px] bg-dark-900 border border-dark-800 focus:border-brand rounded-xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all resize-none text-dark-50"
            />
          </div>
        </div>
      ) : (
        /* Analysis Output View Dashboard */
        <div className="space-y-6">
          
          {/* Top Row: Match Score & Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Match Score Circular Card */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center col-span-1 border-l-4 border-l-brand">
              <span className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-2">Match Score</span>
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-dark-800">
                <span className={`text-3xl font-extrabold tracking-tight ${
                  analysis.matchScore >= 80 ? 'text-emerald-400' : analysis.matchScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {analysis.matchScore}%
                </span>
              </div>
              <p className="text-[10px] text-dark-400 mt-3 font-medium">ATS compatibility rating</p>
            </div>

            {/* AI feedback summary */}
            <div className="glass-panel p-6 rounded-2xl md:col-span-3 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-brand flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  AI Analysis Summary
                </h3>
                <p className="text-xs text-dark-400 leading-relaxed">
                  Your resume has been audited against the provided target description. We identified key match indicators and extracted skills that can be improved to boost your interview success.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 border-t border-dark-800/20 pt-4 mt-6">
                <button
                  onClick={downloadReport}
                  className="bg-brand/10 hover:bg-brand/20 text-brand text-xs font-semibold px-4 py-2 rounded-xl border border-brand/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download ATS Report
                </button>

                <button
                  onClick={handleReset}
                  className="glass-button text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Analyze Another
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Row: Skills & Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Skills Audit Card */}
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                Keyword Skills Audit
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">Matching Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matchingSkills.map((skill, idx) => (
                      <span key={idx} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[9px] px-2 py-0.5 rounded-full font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider mb-2">Missing / Weak Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingSkills.map((skill, idx) => (
                      <span key={idx} className="bg-violet-500/10 text-violet-400 border border-violet-500/10 text-[9px] px-2 py-0.5 rounded-full font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Critique Cards */}
            <div className="space-y-6">
              {/* ATS suggestions */}
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-violet-500">
                <h4 className="font-bold text-xs text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  ATS Optimization Strategy
                </h4>
                <p className="text-xs text-dark-400 leading-relaxed whitespace-pre-line">
                  {analysis.atsOptimization}
                </p>
              </div>

              {/* Phrasing & project suggestions */}
              <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500">
                <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Improvement Suggestions
                </h4>
                <p className="text-xs text-dark-400 leading-relaxed whitespace-pre-line">
                  {analysis.improvementSuggestions}
                </p>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
