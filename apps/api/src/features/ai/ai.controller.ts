import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ComplaintType, Priority } from '../../models/Complaint';

// Mock function representing an AI call to Claude/OpenAI
const analyzeComplaintWithAI = async (text: string) => {
  // In production:
  // const response = await openai.chat.completions.create({...})
  
  const textLower = text.toLowerCase();
  
  let suggestedType = ComplaintType.CIVIL;
  let suggestedPriority = Priority.LOW;
  let summary = text.substring(0, 50) + '...';

  if (textLower.includes('hack') || textLower.includes('scam') || textLower.includes('phishing')) {
    suggestedType = ComplaintType.CYBER_CRIME;
    suggestedPriority = Priority.MEDIUM;
    summary = 'Cyber security incident involving potential fraud or account compromise.';
  } else if (textLower.includes('assault') || textLower.includes('attack') || textLower.includes('murder')) {
    suggestedType = ComplaintType.CRIMINAL;
    suggestedPriority = Priority.CRITICAL;
    summary = 'Violent physical altercation or severe criminal act.';
  } else if (textLower.includes('harass') || textLower.includes('stalk') || textLower.includes('abuse')) {
    suggestedType = ComplaintType.WOMEN_SAFETY;
    suggestedPriority = Priority.HIGH;
    summary = 'Harassment or safety threat requiring immediate attention.';
  }

  return { suggestedType, suggestedPriority, summary };
};

export const classifyComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const aiAnalysis = await analyzeComplaintWithAI(description);

    res.status(200).json({ success: true, data: aiAnalysis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
