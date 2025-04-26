import google.generativeai as genai
from dotenv import load_dotenv
import os
from typing import List, Tuple

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

async def generate_summary(transcript: str) -> str:
    prompt = f"""
    Please provide a concise summary of the following lecture transcript:
    {transcript}
    Focus on the main concepts and key takeaways.
    """
    response = await model.generate_content_async(prompt)
    return response.text

async def generate_questions(transcript: str, num_questions: int = 3) -> List[Tuple[str, str]]:
    prompt = f"""
    Based on the following lecture transcript, generate {num_questions} relevant questions
    that could help clarify or deepen understanding of the material, along with suggested answers:
    {transcript}
    Format: Return exactly {num_questions} questions and their answers.
    """
    response = await model.generate_content_async(prompt)
    # In a real implementation, you'd want to parse this more robustly
    questions_and_answers = []
    # Simple parsing logic - in real implementation this should be more robust
    qa_pairs = response.text.split("\n\n")
    for qa in qa_pairs[:num_questions]:
        if "?" in qa:
            question = qa.split("?")[0] + "?"
            answer = qa.split("?")[1].strip()
            questions_and_answers.append((question, answer))
    
    return questions_and_answers 