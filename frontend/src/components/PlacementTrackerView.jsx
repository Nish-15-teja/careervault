import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, Trash2, Calendar, DollarSign, FileText, 
  ChevronRight, AlertCircle, HelpCircle, Columns3 
} from 'lucide-react';

export default function PlacementTrackerView() {
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [assessmentDate, setAssessmentDate] = useState('');
  
  // Modal/Form overlay visibility
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [salary, setSalary] = useState('');
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState('');
  const [notes, setNotes] = useState('');

  // UI state feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const COLUMNS = ['Applied', 'OA', 'Interviewing', 'Offered', 'Rejected'];

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  };

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchResumes();
  }, []);

  // Handle creating a new job tracker
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyName || !role) {
      setError('Company Name and Role are required.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/applications', {
        companyName,
        role,
        status,
        salary: salary ? Number(salary) : null,
        jobDescriptionUrl,
        notes,
        resumeId: selectedResumeId || null,
        assessmentDate: assessmentDate || null
      });
      
      // Reset inputs
      setCompanyName('');
      setRole('');
      setStatus('Applied');
      setSalary('');
      setJobDescriptionUrl('');
      setNotes('');
      setSelectedResumeId('');
      setAssessmentDate('');
      setShowAddForm(false);
      
      fetchApplications(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tracker. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle changing status column (moving card)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/applications/${id}`, { status: newStatus });
      fetchApplications(); // Reload lists
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  // Handle changing associated resume
  const handleResumeChange = async (id, newResumeId) => {
    try {
      await api.put(`/applications/${id}`, { resumeId: newResumeId || null });
      fetchApplications(); // Reload lists
    } catch (err) {
      console.error('Failed to update resume:', err);
    }
  };

  // Handle deleting a job card
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this application tracker?')) return;
    try {
      await api.delete(`/applications/${id}`);
      fetchApplications();
    } catch (err) {
      console.error('Failed to delete tracker:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Utilities */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Placement Tracker</h2>
          <p className="text-xs text-dark-400 mt-1">Track your job applications through the pipeline stages.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand/10 w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Application</span>
        </button>
      </div>

      {/* 1. Add Application Modal Overlayer Form */}
      {showAddForm && (
        <div className="glass-panel p-6 rounded-2xl max-w-xl animate-fade-in-up">
          <h3 className="font-bold text-sm mb-4">Track Job Application</h3>
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/10 p-3 rounded-lg mb-4">{error}</p>}
          
          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="Google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">Role Title</label>
              <input
                type="text"
                placeholder="Frontend Developer Intern"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">Pipeline Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none text-dark-400"
              >
                {COLUMNS.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">CTC / Salary (LPA)</label>
              <input
                type="number"
                placeholder="e.g. 12"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">Associated Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none text-dark-400"
              >
                <option value="">None / Select Resume</option>
                {resumes.map(res => (
                  <option key={res._id} value={res._id}>{res.title} {res.isActive ? '(Active)' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">Assessment / OA Date</label>
              <input
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none text-dark-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">JD / Job URL</label>
              <input
                type="url"
                placeholder="https://careers.google.com/jobs/..."
                value={jobDescriptionUrl}
                onChange={(e) => setJobDescriptionUrl(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">Additional Notes</label>
              <textarea
                placeholder="Add interviews structure, OA formats, or checklist..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-20 bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                Save Tracker
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="glass-button text-xs font-semibold px-6 py-2.5 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Kanban Board Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          // Filter cards belonging to this column stage
          const columnApps = applications.filter(app => app.status === column);

          return (
            <div key={column} className="bg-dark-900/40 border border-dark-800/40 rounded-2xl p-4 flex flex-col gap-4 min-w-[220px]">
              
              {/* Column Title and Counter */}
              <div className="flex items-center justify-between border-b border-dark-800/20 pb-2">
                <span className="font-bold text-xs tracking-wide uppercase text-dark-400">{column}</span>
                <span className="bg-dark-800 text-[10px] font-bold text-brand px-2 py-0.5 rounded-full border border-dark-700/50">
                  {columnApps.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="flex flex-col gap-3 min-h-[300px]">
                {columnApps.length === 0 ? (
                  <div className="text-[10px] text-dark-700 text-center py-12 select-none">
                    Empty Stage
                  </div>
                ) : (
                  columnApps.map((app) => {
                    const isUrgentOA = app.assessmentDate && 
                      (new Date(app.assessmentDate) - new Date() < 48 * 60 * 60 * 1000) && 
                      (new Date(app.assessmentDate) >= new Date().setHours(0, 0, 0, 0));

                    return (
                      <div 
                        key={app._id} 
                        className="glass-panel p-4 rounded-xl flex flex-col gap-3 hover:border-dark-700 transition-all duration-300 relative group"
                      >
                        {/* Card Info Header */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="font-bold text-xs truncate max-w-[80%] leading-snug">{app.companyName}</h4>
                            <button
                              onClick={() => handleDelete(app._id)}
                              className="text-dark-400 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[10px] text-dark-400 font-medium truncate">{app.role}</p>
                          
                          {app.assessmentDate && (
                            <div className={`mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                              isUrgentOA 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isUrgentOA ? 'bg-red-400 animate-ping' : 'bg-yellow-400'}`}></span>
                              <span>OA / Test: {new Date(app.assessmentDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                            </div>
                          )}
                        </div>

                      {/* Card Metadata Segment */}
                      {(app.salary || app.jobDescriptionUrl || app.resumeId) && (
                        <div className="flex flex-wrap items-center gap-3 text-[9px] text-dark-400 border-t border-dark-800/10 pt-2">
                          {app.salary && (
                            <span className="flex items-center text-emerald-400 font-semibold">
                              <DollarSign className="w-3 h-3" /> {app.salary} LPA
                            </span>
                          )}
                          {app.jobDescriptionUrl && (
                            <a
                              href={app.jobDescriptionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand hover:underline flex items-center gap-0.5"
                            >
                              <FileText className="w-3 h-3" /> Job Link
                            </a>
                          )}
                          {app.resumeId && (
                            <a
                              href={app.resumeId.fileUrl ? (app.resumeId.fileUrl.startsWith('http') ? app.resumeId.fileUrl : `http://localhost:5000/${app.resumeId.fileUrl}`) : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-violet-400 hover:underline flex items-center gap-0.5 font-medium"
                            >
                              <FileText className="w-3 h-3" /> {app.resumeId.title || 'Resume'}
                            </a>
                          )}
                        </div>
                      )}

                      {/* Card footer options: Move/Switch Column Dropdown */}
                      <div className="pt-2 border-t border-dark-800/15 space-y-2">
                        <div className="flex items-center justify-between text-[9px] text-dark-700">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" /> {new Date(app.appliedDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 justify-between">
                          <select
                            value={app.resumeId?._id || app.resumeId || ''}
                            onChange={(e) => handleResumeChange(app._id, e.target.value)}
                            className="w-1/2 bg-dark-900 border border-dark-800 text-[9px] text-dark-400 font-semibold px-1.5 py-0.5 rounded focus:outline-none focus:border-brand cursor-pointer truncate"
                            title="Associate Resume"
                          >
                            <option value="">No Resume</option>
                            {resumes.map(res => (
                              <option key={res._id} value={res._id}>{res.title}</option>
                            ))}
                          </select>

                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            className="w-1/2 bg-dark-900 border border-dark-800 text-[9px] text-dark-400 font-semibold px-1.5 py-0.5 rounded focus:outline-none focus:border-brand cursor-pointer"
                          >
                            {COLUMNS.map(col => (
                              <option key={col} value={col}>Stage: {col}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                    </div>
                  );
                })
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
