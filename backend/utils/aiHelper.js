import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client if key is provided
const isGeminiAvailable = !!(
  process.env.GEMINI_API_KEY && 
  process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
);

let genAI;
if (isGeminiAvailable) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// 1. PDF Parser Service
export const extractTextFromPdf = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`PDF Parsing Error: ${error.message}`);
  }
};

// 2. Local Mock Keyword Matching Fallback (if no Gemini API Key is set)
const runLocalMockAnalysis = (resumeText, jobDescription) => {
  console.log('Using local rule-based match analyzer...');
  
  const resume = resumeText.toLowerCase();
  const jd = jobDescription.toLowerCase();

  // Tech keywords to audit
  const keywordsList = [
    'react', 'node', 'express', 'mongodb', 'sql', 'mysql', 'postgresql', 
    'javascript', 'typescript', 'python', 'java', 'html', 'css', 'tailwind', 
    'git', 'github', 'docker', 'aws', 'kubernetes', 'rest api', 'graphql',
    'c++', 'c#', 'next.js', 'redux', 'redis', 'agile', 'linux', 'testing'
  ];

  const presentInJd = keywordsList.filter(kw => jd.includes(kw));
  
  if (presentInJd.length === 0) {
    // If JD is blank or generic, return generic details
    return {
      matchScore: 50,
      matchingSkills: ['Communication', 'Problem Solving'],
      missingSkills: ['No skills matched. Please add detail to job description.'],
      atsOptimization: 'Ensure your resume uses bullet points and lists specific programming skills.',
      improvementSuggestions: 'Tailor your summary to match the job listing terms.'
    };
  }

  const matchingSkills = presentInJd.filter(kw => resume.includes(kw));
  const missingSkills = presentInJd.filter(kw => !resume.includes(kw));

  const total = presentInJd.length;
  const matches = matchingSkills.length;
  const matchScore = Math.round((matches / total) * 100);

  // Capitalize helpers for output aesthetics
  const capitalize = (str) => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    matchScore,
    matchingSkills: matchingSkills.map(capitalize),
    missingSkills: missingSkills.length > 0 ? missingSkills.map(capitalize) : ['None! Great match!'],
    atsOptimization: missingSkills.length > 0 
      ? `Include missing skills like ${missingSkills.slice(0, 3).map(capitalize).join(', ')} in your project descriptions.` 
      : 'Excellent keyword match. Focus on clarifying font sizes and standard header naming.',
    improvementSuggestions: 'Describe impact using action verbs and quantifiable results (e.g. Optimized database queries, reducing load latency by 15%).'
  };
};

// 3. Gemini Prompt Runner
export const analyzeResumeWithAI = async (resumeText, jobDescription) => {
  if (!isGeminiAvailable) {
    return runLocalMockAnalysis(resumeText, jobDescription);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json' // Forces Gemini to reply strictly in JSON
      }
    });

    const prompt = `
      You are an expert recruitment manager and ATS (Applicant Tracking System) optimizer.
      Analyze the following candidate resume text against the target Job Description.
      
      Resume Text:
      """
      ${resumeText}
      """
      
      Target Job Description:
      """
      ${jobDescription}
      """
      
      Generate an analysis report in JSON format. The response must match this schema exactly:
      {
        "matchScore": number (0 to 100 matching percentage),
        "matchingSkills": array of strings,
        "missingSkills": array of strings (required skills listed in the job description but missing or weak in the resume),
        "atsOptimization": string (concise advice on formatting, layout, keywords, or structure for ATS compatibility),
        "improvementSuggestions": string (concise advice on projects, certifications, or phrasing changes)
      }
      Do not return markdown wraps or extra text. Return only the JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini API call failed. Falling back to local analysis...', error);
    return runLocalMockAnalysis(resumeText, jobDescription);
  }
};
