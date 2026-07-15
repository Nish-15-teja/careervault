import { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Trash2, CheckCircle2, CloudUpload, ExternalLink } from 'lucide-react';

export default function ResumeVaultView() {
  const [resumes, setResumes] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  
  // Interaction states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all resumes on load
  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data);
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Handle PDF file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      setFile(null);
    } else {
      setError('');
      setFile(selectedFile);
    }
  };

  // Handle Form Submission (Upload)
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file || !title) {
      setError('Please provide both a title and a PDF resume file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('resume', file);

    setIsLoading(true);

    try {
      await api.post('/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Resume version uploaded successfully!');
      setTitle('');
      setFile(null);
      // Reset the file input element manually
      document.getElementById('file-input').value = '';
      fetchResumes(); // Reload resumes list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggling active status
  const handleSetActive = async (id) => {
    try {
      await api.patch(`/resumes/${id}/active`);
      fetchResumes(); // Reload updated statuses
    } catch (err) {
      console.error('Failed to toggle active resume:', err);
    }
  };

  // Handle deleting a resume
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume version?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      fetchResumes();
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold">Resume Vault</h2>
        <p className="text-xs text-dark-400 mt-1">Manage multiple versions of your resume tailored for different roles.</p>
      </div>

      {/* Main Grid: Left = Upload Form, Right = Resumes List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Upload Form Panel */}
        <div className="glass-panel p-6 rounded-2xl h-fit">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <CloudUpload className="w-4 h-4 text-brand" />
            Upload New Resume
          </h3>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/10 p-3 rounded-lg mb-4">{error}</p>}
          {success && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 p-3 rounded-lg mb-4">{success}</p>}

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1.5">Version Title</label>
              <input
                type="text"
                placeholder="e.g. SDE Resume - July"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1.5">PDF Document</label>
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none text-dark-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-brand/10 file:text-brand file:cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand hover:bg-brand-hover text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Upload Document'
              )}
            </button>
          </form>
        </div>

        {/* 2. Resumes List Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            Your Resume Versions
          </h3>

          {resumes.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center text-dark-400 text-xs">
              No resumes uploaded yet. Upload your first PDF to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.map((resume) => (
                <div 
                  key={resume._id} 
                  className={`glass-panel p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 relative ${
                    resume.isActive ? 'border-brand/40 ring-1 ring-brand/10 shadow-lg shadow-brand/5' : ''
                  }`}
                >
                  {/* Card Top */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm truncate max-w-[80%]">{resume.title}</h4>
                      {resume.isActive && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-dark-400 mt-1">Uploaded: {new Date(resume.createdAt).toLocaleDateString()}</p>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center justify-between border-t border-dark-800/40 pt-4 mt-auto">
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-dark-400 hover:text-dark-50 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View PDF
                    </a>

                    <div className="flex items-center gap-2">
                      {!resume.isActive && (
                        <button
                          onClick={() => handleSetActive(resume._id)}
                          className="bg-brand/10 hover:bg-brand/20 text-brand text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-brand/20 transition-all cursor-pointer"
                        >
                          Make Active
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(resume._id)}
                        className="text-red-400/70 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
