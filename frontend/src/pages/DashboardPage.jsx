import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ResumeVaultView from '../components/ResumeVaultView';
import CertificateVaultView from '../components/CertificateVaultView';
import PlacementTrackerView from '../components/PlacementTrackerView';
import ResumeAnalyzerView from '../components/ResumeAnalyzerView';
import AIChatView from '../components/AIChatView';
import { 
  LayoutDashboard, FileText, Award, Columns3, LogOut, Plus, 
  Search, Bell, Briefcase, Calendar, TrendingUp, CheckCircle, Sparkles, Bot 
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);

  // Fetch overview data from backend
  useEffect(() => {
    if (user && activeTab === 'dashboard') {
      const fetchDashboardData = async () => {
        try {
          const [appsRes, resumesRes] = await Promise.all([
            api.get('/applications'),
            api.get('/resumes')
          ]);
          setApplications(appsRes.data);
          setResumes(resumesRes.data);
        } catch (err) {
          console.error('Failed to load dashboard overview details:', err);
        }
      };
      fetchDashboardData();
    }
  }, [user, activeTab]);

  // Route Protection: If not loading and no user exists, redirect to login
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Handle logout action
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Show premium spinner while verifying active cookie session
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-dark-950 text-dark-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  // Compute live placement statistics
  const totalApps = applications.length;
  const advancedApps = applications.filter(app => ['OA', 'Interviewing', 'Offered'].includes(app.status)).length;
  const interviewRate = totalApps > 0 ? ((advancedApps / totalApps) * 100).toFixed(1) + '%' : '0%';
  const activeResumeTitle = resumes.find(r => r.isActive)?.title || 'No active resume';

  const upcomingAssessments = applications.filter(app => 
    app.assessmentDate && 
    new Date(app.assessmentDate) >= new Date().setHours(0,0,0,0)
  ).sort((a, b) => new Date(a.assessmentDate) - new Date(b.assessmentDate));

  const stats = [
    { label: 'Applications', value: totalApps.toString(), change: 'Total job trackers', icon: Briefcase, color: 'text-brand bg-brand/10 border-brand/20' },
    { label: 'Advancement Rate', value: interviewRate, change: 'Progressed past Applied', icon: TrendingUp, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { label: 'Active Resume', value: activeResumeTitle, change: 'For quick applications', icon: FileText, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
  ];

  // Helper status color mapper
  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'OA': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Interviewing': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Offered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Export applications to CSV/Excel format helper
  const handleExportExcel = () => {
    if (applications.length === 0) {
      alert('No applications tracked yet to export!');
      return;
    }
    const headers = ['Company Name', 'Job Role', 'Status', 'Salary (LPA)', 'Job URL', 'Notes', 'Applied Date'];
    const rows = applications.map(app => [
      `"${(app.companyName || '').replace(/"/g, '""')}"`,
      `"${(app.role || '').replace(/"/g, '""')}"`,
      `"${(app.status || '')}"`,
      app.salary || 'N/A',
      `"${(app.jobDescriptionUrl || '').replace(/"/g, '""')}"`,
      `"${(app.notes || '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ')}"`,
      `"${app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'careervault_applications.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Delay revocation to prevent browser download managers from stripping filenames
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-50 flex overflow-hidden">
      {/* Dynamic backdrop ambient glows */}
      <div className="absolute top-[10%] right-[10%] w-[35%] h-[35%] rounded-full bg-brand/5 blur-[120px] pointer-events-none"></div>

      {/* 1. Left Sidebar Navigation */}
      <aside className="w-64 bg-dark-900/60 backdrop-blur-md border-r border-dark-800/40 hidden md:flex flex-col z-20">
        {/* Sidebar Header Brand Logo */}
        <div className="h-16 px-6 border-b border-dark-800/40 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand to-violet-500 flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="font-bold text-lg tracking-tight">CareerVault</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow p-4 space-y-1.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'resumes', label: 'Resume Vault', icon: FileText },
            { id: 'certificates', label: 'Certificate Vault', icon: Award },
            { id: 'tracker', label: 'Placement Tracker', icon: Columns3 },
            { id: 'analyzer', label: 'AI Resume Analyzer', icon: Sparkles },
            { id: 'assistant', label: 'AI Career Assistant', icon: Bot },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'bg-brand/10 text-brand border border-brand/20 shadow-md shadow-brand/5' 
                    : 'text-dark-400 hover:text-dark-50 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile / Logout segment */}
        <div className="p-4 border-t border-dark-800/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-dark-800 border border-dark-700/60 flex items-center justify-center font-semibold text-brand">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold truncate max-w-[130px]">{user.name}</p>
                <p className="text-xs text-dark-400 truncate max-w-[130px]">{user.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 hover:border-red-500/20 rounded-xl text-xs font-semibold cursor-pointer transition-colors duration-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-grow flex flex-col min-w-0 overflow-y-auto z-10">
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-dark-800/40 bg-dark-950/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Quick Search */}
          <div className="relative w-72 hidden sm:block">
            <Search className="w-4 h-4 text-dark-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search companies or assets..."
              className="w-full bg-dark-900/60 border border-dark-800 focus:border-brand rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all duration-300"
            />
          </div>

          {/* Quick Utilities */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-dark-400 hover:text-dark-50 hover:bg-white/5 rounded-lg transition-colors relative cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full ring-2 ring-dark-950"></span>
              </button>
              
              {/* Floating Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-panel p-4 rounded-xl shadow-2xl z-40 text-xs text-left animate-fade-in-up">
                  <h4 className="font-bold border-b border-dark-800/20 pb-2 mb-2 flex items-center justify-between text-dark-50">
                    <span>Notifications</span>
                    <span className="bg-brand/10 text-brand text-[9px] px-1.5 py-0.5 rounded-full font-bold">2 New</span>
                  </h4>
                  <div className="space-y-1">
                    <div className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <p className="font-semibold text-dark-50">Technical Interview Scheduled</p>
                      <p className="text-[10px] text-dark-400 mt-0.5">Google interview is coming up on July 14.</p>
                    </div>
                    <div className="p-2 hover:bg-white/5 rounded-lg transition-colors border-t border-dark-800/10">
                      <p className="font-semibold text-dark-50">AI Resume Analyzer Ready</p>
                      <p className="text-[10px] text-dark-400 mt-0.5">Your resume analysis match score has been compiled.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setActiveTab('tracker')}
              className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg shadow-brand/10 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Track Application</span>
            </button>
          </div>
        </header>

        {/* Dashboard Dashboard Screen Content */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-8 animate-fade-in-up">
          
          {/* A. Default Dashboard View */}
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome Banner Card */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-brand relative overflow-hidden">
                <div>
                  <h2 className="text-xl font-bold">Prepare for Placements, {user.name}!</h2>
                  <p className="text-xs text-dark-400 mt-1">Your next interview is scheduled in 2 days. Track steps below.</p>
                </div>
                <div className="bg-brand/10 border border-brand/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-brand flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Technical Interview on July 14</span>
                </div>
              </div>

              {/* Placement Statistics Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="glass-panel p-6 rounded-2xl hover:border-dark-700 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">{stat.label}</span>
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${stat.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">{stat.change}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* B. Assessment Reminders Section */}
              {upcomingAssessments.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-yellow-500 relative overflow-hidden animate-fade-in-up">
                  <div className="flex items-center justify-between mb-4 border-b border-dark-800/20 pb-2">
                    <h3 className="font-bold text-sm flex items-center gap-2 text-yellow-500">
                      <Bell className="w-4.5 h-4.5 animate-bounce" />
                      <span>Upcoming Assessment Reminders</span>
                    </h3>
                    <span className="bg-yellow-500/10 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-yellow-500/20">
                      {upcomingAssessments.length} Pending
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingAssessments.map((app) => {
                      const daysLeft = Math.ceil((new Date(app.assessmentDate) - new Date().setHours(0,0,0,0)) / (24 * 60 * 60 * 1000));
                      const isToday = new Date(app.assessmentDate).toDateString() === new Date().toDateString();
                      
                      return (
                        <div key={app._id} className="p-4 bg-dark-900/40 border border-dark-800/40 rounded-xl flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-bold text-xs text-dark-50">{app.companyName}</p>
                            <p className="text-[10px] text-dark-400">{app.role}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${
                              isToday 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                                : daysLeft <= 2 
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              {isToday ? 'TODAY!' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`}
                            </p>
                            <p className="text-[9px] text-dark-400 mt-1">
                              {new Date(app.assessmentDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Applications list section */}
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-dark-800/40 flex items-center justify-between">
                  <h3 className="font-bold text-sm">Recent Applications</h3>
                  <div className="flex items-center gap-3">
                    <button onClick={handleExportExcel} className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer">Export Excel (CSV)</button>
                    <button onClick={() => setActiveTab('tracker')} className="text-xs text-brand hover:underline font-semibold cursor-pointer">View Board →</button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-dark-900/40 text-dark-400 border-b border-dark-800/20">
                        <th className="px-6 py-3.5 font-semibold">Company</th>
                        <th className="px-6 py-3.5 font-semibold">Role</th>
                        <th className="px-6 py-3.5 font-semibold">Date Applied</th>
                        <th className="px-6 py-3.5 font-semibold">Resume</th>
                        <th className="px-6 py-3.5 font-semibold">Pipeline Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-800/20">
                      {applications.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-dark-400 select-none">
                            No applications tracked yet. Start applying!
                          </td>
                        </tr>
                      ) : (
                        applications.slice(0, 4).map((app) => (
                          <tr key={app._id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 py-4 font-semibold text-dark-50">{app.companyName}</td>
                            <td className="px-6 py-4 text-dark-400">{app.role}</td>
                            <td className="px-6 py-4 text-dark-400">
                              {new Date(app.appliedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 text-dark-400 font-medium">
                              {app.resumeId ? (
                                <a
                                  href={app.resumeId.fileUrl ? (app.resumeId.fileUrl.startsWith('http') ? app.resumeId.fileUrl : `http://localhost:5000/${app.resumeId.fileUrl}`) : '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-violet-400 hover:underline flex items-center gap-1 font-semibold"
                                >
                                  {app.resumeId.title || 'Resume'}
                                </a>
                              ) : (
                                <span className="text-dark-700 italic">None</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(app.status)}`}>
                                {app.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* B. Resume Vault View */}
          {activeTab === 'resumes' && <ResumeVaultView />}

          {/* C. Certificate Vault View */}
          {activeTab === 'certificates' && <CertificateVaultView />}

          {/* D. Placement Tracker View */}
          {activeTab === 'tracker' && <PlacementTrackerView />}

          {/* E. AI Resume Analyzer View */}
          {activeTab === 'analyzer' && <ResumeAnalyzerView />}

          {/* F. AI Career Assistant View */}
          {activeTab === 'assistant' && <AIChatView />}

        </main>
      </div>
    </div>
  );
}
