import { FileText, Award, Columns3, ArrowRight, Shield, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-dark-950 text-dark-50 overflow-hidden flex flex-col">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand/10 blur-[120px] pointer-events-none animate-glow-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand/5 blur-[120px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-dark-800/40 bg-dark-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand to-violet-500 flex items-center justify-center text-white shadow-md shadow-brand/20">
              C
            </div>
            <span>Career<span className="text-brand">Vault</span> <span className="text-xs bg-dark-800 text-brand px-1.5 py-0.5 rounded font-normal uppercase tracking-wider ml-1 border border-dark-700/50">AI</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-dark-400">
            <a href="#features" className="hover:text-dark-50 transition-colors">Features</a>
            <a href="#security" className="hover:text-dark-50 transition-colors">Security</a>
          </nav>

          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-semibold text-dark-400 hover:text-dark-50 transition-colors">
              Sign In
            </a>
            <a href="/register" className="glass-button px-4 py-2 rounded-lg text-sm font-semibold hover:border-brand/40 shadow-sm transition-all duration-300">
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center justify-center text-center relative z-10 animate-fade-in-up">
        {/* Placement Badge */}
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-xs font-semibold px-3 py-1 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Built for Tech Placement Preparation</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl mb-6">
          Secure. Track. Elevate.
          <span className="block mt-2 bg-gradient-to-r from-brand via-violet-400 to-indigo-200 bg-clip-text text-transparent">
            Your Placement Portfolio
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg text-dark-400 max-w-2xl mb-10 leading-relaxed">
          The ultimate asset hub. Securely store your resumes, track jobs through a custom application kanban, and showcase verified achievements in one unified dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <a
            href="/register"
            className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand/20 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#features"
            className="glass-button px-8 py-3 rounded-lg font-semibold hover:border-white/20 transition-all duration-300"
          >
            Explore Features
          </a>
        </div>

        {/* Grid Features */}
        <section id="features" className="w-full pt-12 border-t border-dark-800/40">
          <h2 className="text-2xl font-bold mb-12">Designed to organize your career journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Feature 1 */}
            <div className="glass-panel p-6 rounded-2xl hover:border-brand/40 group transition-all duration-300 hover:shadow-2xl hover:shadow-brand/5">
              <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Resume Vault</h3>
              <p className="text-dark-400 text-sm leading-relaxed">
                Store multiple customized resumes. Toggle your "Active" resume at a moment's notice to match company profiles.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 rounded-2xl hover:border-brand/40 group transition-all duration-300 hover:shadow-2xl hover:shadow-brand/5">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Certificate Vault</h3>
              <p className="text-dark-400 text-sm leading-relaxed">
                Manage your credentials, issuer details, and verification links. Present a verified checklist for recruitments.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 rounded-2xl hover:border-brand/40 group transition-all duration-300 hover:shadow-2xl hover:shadow-brand/5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Columns3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Placement Tracker</h3>
              <p className="text-dark-400 text-sm leading-relaxed">
                Track your job pipelines through a Kanban board. Log salary, notes, deadlines, and online assessment details.
              </p>
            </div>
          </div>
        </section>

        {/* Security Trust Indicator */}
        <section id="security" className="mt-24 flex items-center gap-3 bg-dark-900/40 border border-dark-800/60 rounded-xl px-5 py-3 text-xs text-dark-400 max-w-md mx-auto">
          <Shield className="w-5 h-5 text-brand flex-shrink-0 animate-pulse" />
          <span className="text-left leading-normal">
            **Encrypted Data Protection**: Your personal documents and resume links are strictly secured behind OAuth/JWT auth guards.
          </span>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-dark-800/40 py-8 bg-dark-950/30 text-center text-xs text-dark-400">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} CareerVault AI. Developed for Career Readiness & Portfolio Building.</p>
        </div>
      </footer>
    </div>
  );
}
