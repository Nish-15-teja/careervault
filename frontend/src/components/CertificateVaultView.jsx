import { useState, useEffect } from 'react';
import api from '../services/api';
import { Award, Trash2, Calendar, Link, FileText, PlusCircle, ExternalLink } from 'lucide-react';

export default function CertificateVaultView() {
  const [certificates, setCertificates] = useState([]);
  
  // Form fields state
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [file, setFile] = useState(null);

  // Interaction feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all certifications
  const fetchCertificates = async () => {
    try {
      const res = await api.get('/certificates');
      setCertificates(res.data);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Validate and handle file picker changes
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Please attach proof as a PDF document.');
      setFile(null);
    } else {
      setError('');
      setFile(selectedFile);
    }
  };

  // Form submission: Create a certificate
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !issuer || !issueDate) {
      setError('Certificate Name, Issuing Org, and Date are required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('issuer', issuer);
    formData.append('issueDate', issueDate);
    formData.append('credentialId', credentialId);
    formData.append('verificationUrl', verificationUrl);
    if (file) {
      formData.append('certificate', file);
    }

    setIsLoading(true);

    try {
      await api.post('/certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Certificate logged successfully!');
      
      // Clear form inputs
      setTitle('');
      setIssuer('');
      setIssueDate('');
      setCredentialId('');
      setVerificationUrl('');
      setFile(null);
      const fileInput = document.getElementById('cert-file');
      if (fileInput) fileInput.value = '';

      fetchCertificates(); // Refresh grid list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record certificate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete certificate
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certificate? This action is permanent.')) return;

    try {
      await api.delete(`/certificates/${id}`);
      fetchCertificates();
    } catch (err) {
      console.error('Failed to delete certificate:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Title Block */}
      <div>
        <h2 className="text-xl font-bold">Certificate Vault</h2>
        <p className="text-xs text-dark-400 mt-1">Keep a verified catalog of your courses, bootcamps, and professional qualifications.</p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Add Certificate Form */}
        <div className="glass-panel p-6 rounded-2xl h-fit">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <PlusCircle className="w-4.5 h-4.5 text-brand" />
            Add Certification
          </h3>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/10 p-3 rounded-lg mb-4">{error}</p>}
          {success && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 p-3 rounded-lg mb-4">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">Certificate Title</label>
              <input
                type="text"
                placeholder="e.g. AWS Solutions Architect"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">Issuing Organization</label>
              <input
                type="text"
                placeholder="e.g. Amazon Web Services (AWS)"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all text-dark-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">Credential ID</label>
                <input
                  type="text"
                  placeholder="AWS-123A (Optional)"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">Verification Link</label>
              <input
                type="url"
                placeholder="https://aws.verify/123 (Optional)"
                value={verificationUrl}
                onChange={(e) => setVerificationUrl(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dark-400 mb-1">Upload PDF Proof (Optional)</label>
              <input
                id="cert-file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full bg-dark-900 border border-dark-800 focus:border-brand rounded-xl px-3 py-2 text-xs focus:outline-none text-dark-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-brand/10 file:text-brand file:cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand/10"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Save Certificate'
              )}
            </button>
          </form>
        </div>

        {/* 2. Certificate list panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-violet-400 animate-pulse" />
            Active Credentials List
          </h3>

          {certificates.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center text-dark-400 text-xs">
              No certifications logged. Add your accomplishments using the panel on the left!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div key={cert._id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between hover:border-dark-700 transition-all duration-300">
                  
                  {/* Card Header & Metadata */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-sm leading-tight max-w-[85%]">{cert.title}</h4>
                      <button
                        onClick={() => handleDelete(cert._id)}
                        className="text-dark-400 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-brand font-semibold">{cert.issuer}</p>
                    
                    <div className="flex items-center gap-4 text-[10px] text-dark-400 pt-1.5 border-t border-dark-800/10">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-dark-400" />
                        Issued: {new Date(cert.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      </span>
                      {cert.credentialId && (
                        <span>ID: <code className="bg-dark-900 border border-dark-800/50 px-1 py-0.5 rounded text-[9px] text-violet-300 font-mono">{cert.credentialId}</code></span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer links */}
                  <div className="flex items-center gap-4 border-t border-dark-800/40 pt-4 mt-auto">
                    {cert.verificationUrl && (
                      <a
                        href={cert.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-brand hover:text-brand/80 font-bold flex items-center gap-0.5 transition-colors"
                      >
                        <Link className="w-3 h-3" /> Verify Credential <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {cert.fileUrl && (
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-dark-400 hover:text-dark-50 font-semibold flex items-center gap-0.5 transition-colors ml-auto"
                      >
                        <FileText className="w-3 h-3" /> View Proof
                      </a>
                    )}
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
