
import { GoogleGenAI, Type } from "@google/genai";
import { RoleType, ScreenerOutput } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Robustly parses JSON from model output, handling potential markdown code block wrappers.
 */
const safeParseScreenerOutput = (text: string): ScreenerOutput => {
  try {
    // Attempt direct parse first
    return JSON.parse(text);
  } catch (e) {
    // If it fails, try to strip markdown code blocks
    const cleaned = text.replace(/```json|```/gi, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (innerError) {
      console.error("JSON Parsing failed after cleanup. Content:", text);
      throw new Error("The AI provided an invalid data format. Please try again.");
    }
  }
};

export const screenResumes = async (
  roleType: RoleType,
  jobDescription: string,
  resumes: string[]
): Promise<ScreenerOutput> => {
  // 1. Pre-flight Validation
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please ensure your environment is configured correctly.");
  }
  if (!jobDescription || jobDescription.trim().length < 50) {
    throw new Error("Job description is too short. Please provide more detail for accurate analysis.");
  }
  if (resumes.length === 0) {
    throw new Error("No resumes provided for analysis.");
  }

  const model = "gemini-3-pro-preview";

  const prompt = `
    Role: You are an Enterprise-Grade AI Resume Screener and ATS Ranking Engine.
    
    Role Type: ${roleType}
    Job Description:
    ${jobDescription}
    
    Candidate Resumes (Batch):
    ${resumes.map((r, i) => `Candidate ID: Candidate_${i + 1}\nResume Text:\n${r}\n---`).join("\n")}
    
    Processing Instructions:
    1. Extract required and preferred keywords, seniority, and experience from JD.
    2. For each resume, calculate scores based on EXACTLY these weights:
       - ATS Keyword Match (35%)
       - Role-Relevant Experience (25%)
       - Skills & Tools Alignment (20%)
       - Seniority & Scope Fit (10%)
       - Education & Certifications (10%)
    3. The 'fit_score' must be the weighted sum of these five categories (each scored 0-100 individually, then weighted).
    4. Apply Role-Specific Logic:
       - Tech: Focus on tech stack, frameworks, problem-solving.
       - Non-Tech: Focus on KPIs, outcomes, communication.
       - Executive: Focus on leadership scale, strategy, business impact.
    5. Maintain strict fairness: Ignore demographics and names.
    6. Classify as 'Strong Fit', 'Potential Fit', or 'Weak Fit'.
    
    Output MUST be in STRICT JSON format matching this schema:
    {
      "job_analysis": {
        "role_type": "Tech/Non-Tech/Executive",
        "required_keywords": [],
        "preferred_keywords": [],
        "experience_required": "",
        "seniority_level": ""
      },
      "candidates": [
        {
          "candidate_id": "Candidate_N",
          "experience_years": "",
          "ats_keyword_match_score": 0,
          "fit_score": 0,
          "score_breakdown": {
            "ats_match": 0,
            "experience": 0,
            "skills": 0,
            "seniority": 0,
            "education": 0
          },
          "strengths": [],
          "gaps": [],
          "missing_keywords": [],
          "recommendation": "Strong Fit | Potential Fit | Weak Fit",
          "justification": []
        }
      ],
      "final_ranking": [
        {
          "candidate_id": "Candidate_N",
          "rank": 1,
          "fit_score": 0
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("The AI engine failed to generate a response. This might be due to content safety filters or a transient error.");
    }
    
    return safeParseScreenerOutput(resultText);
  } catch (error: any) {
    console.error("Screening error:", error);
    
    // Categorize errors for better user feedback
    if (error.message?.includes('429')) {
      throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
    }
    if (error.message?.includes('401') || error.message?.includes('403')) {
      throw new Error("Authentication failed. Your API key might be invalid or expired.");
    }
    if (error.message?.includes('format') || error.message?.includes('JSON')) {
      throw error; // Re-throw parsing errors as they are already handled
    }
    
    throw new Error(error.message || "An unexpected error occurred during analysis. Please check your network and try again.");
  }
};
