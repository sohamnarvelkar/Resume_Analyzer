
import { GoogleGenAI, Type } from "@google/genai";
import { RoleType, ScreenerOutput } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const screenResumes = async (
  roleType: RoleType,
  jobDescription: string,
  resumes: string[]
): Promise<ScreenerOutput> => {
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

    const resultText = response.text || "";
    return JSON.parse(resultText) as ScreenerOutput;
  } catch (error) {
    console.error("Screening error:", error);
    throw new Error("Failed to process resumes. Please ensure the API key is valid and inputs are reasonable.");
  }
};
