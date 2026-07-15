import { GoogleGenerativeAI } from '@google/generative-ai';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';
import Certificate from '../models/Certificate.js';

// Verify API Key availability
const isGeminiAvailable = !!(
  process.env.GEMINI_API_KEY && 
  process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
);

let genAI;
if (isGeminiAvailable) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Local offline rule-based chatbot (fallback if no API key is present)
const runLocalMockChat = (query, contextData) => {
  const q = query.toLowerCase();
  const { name, apps, certificates, resumes } = contextData;

  let reply = `Hello ${name}! (Running in Local Offline Mode)\n\n`;

  if (q.includes('company') || q.includes('applied') || q.includes('job') || q.includes('tracker')) {
    if (apps.length === 0) {
      reply += "You haven't tracked any job applications yet. Click 'Track Application' in the header to add your first one!";
    } else {
      reply += "Here are the companies you have tracked applications for:\n";
      apps.forEach(app => {
        reply += `- **${app.companyName}** for the role of **${app.role}** (${app.status})\n`;
      });
    }
  } else if (q.includes('resume') || q.includes('cv')) {
    if (resumes.length === 0) {
      reply += "You don't have any resume versions uploaded yet in your Resume Vault.";
    } else {
      reply += "Here are your uploaded resume versions:\n";
      resumes.forEach(res => {
        reply += `- **${res.title}** (${res.isActive ? 'Active' : 'Inactive'})\n`;
      });
    }
  } else if (q.includes('certificate') || q.includes('course') || q.includes('credential')) {
    if (certificates.length === 0) {
      reply += "You haven't added any certifications yet in your Certificate Vault.";
    } else {
      reply += "Here is your certification catalog:\n";
      certificates.forEach(c => {
        reply += `- **${c.title}** issued by **${c.issuer}**\n`;
      });
    }
  } else {
    reply += "I'm your CareerVault AI Assistant. Ask me about your 'applied companies', 'resumes', or 'certificates'! Add your `GEMINI_API_KEY` to `.env` to enable full general conversations.";
  }

  return reply;
};

// @desc    Chat with Career Assistant using context data injection
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAssistant = async (req, res) => {
  const { message, history } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ message: 'Validation Error: Message is required' });
    }

    // Step 1: Query all database records for this user to compile context
    const [apps, resumes, certificates] = await Promise.all([
      Application.find({ userId: req.user._id }),
      Resume.find({ userId: req.user._id }),
      Certificate.find({ userId: req.user._id })
    ]);

    const activeResume = resumes.find(r => r.isActive)?.title || 'None';
    const resumeList = resumes.map(r => `${r.title} (${r.isActive ? 'Active' : 'Inactive'})`).join(', ');
    const certList = certificates.map(c => `${c.title} (Issued by: ${c.issuer})`).join(', ');
    const appList = applicationsListFormatter(apps);

    const contextData = {
      name: req.user.name,
      email: req.user.email,
      activeResume,
      resumes,
      apps,
      certificates
    };

    // Step 2: Fallback to local rule-based response if Gemini is offline
    if (!isGeminiAvailable) {
      const mockReply = runLocalMockChat(message, contextData);
      return res.status(200).json({ response: mockReply });
    }

    // Step 3: Run Gemini with System Instruction context injection
    const systemInstruction = `
      You are CareerVault AI, a helpful career mentor and placement copilot.
      Your primary role is to answer user queries using their portfolio context.
      
      Here is the candidate's real-time CareerVault database profile context:
      - Candidate Name: ${req.user.name}
      - Candidate Email: ${req.user.email}
      - Active Resume Version: ${activeResume}
      - All Resumes: [${resumeList || 'None'}]
      - Certifications List: [${certList || 'None'}]
      - Tracked Job Applications: [${appList || 'None'}]
      
      Strict Guidelines:
      1. Answer user questions referencing their applications, resumes, or certificates where applicable.
      2. If they ask about items not in the list, politely tell them what is in their vaults.
      3. Keep responses helpful, direct, and structured in clean markdown bullet points.
    `;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction
    });

    // Format history structure to match Gemini SDK requirements
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chatSession = model.startChat({
      history: formattedHistory
    });

    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error('AI chat controller error:', error);
    res.status(500).json({ message: `Chat assistant error: ${error.message}` });
  }
};

// Helper: formats database app list into readable text strings
const applicationsListFormatter = (apps) => {
  if (apps.length === 0) return 'None';
  return apps.map(a => `${a.companyName} for role ${a.role} in pipeline stage ${a.status}`).join(', ');
};
