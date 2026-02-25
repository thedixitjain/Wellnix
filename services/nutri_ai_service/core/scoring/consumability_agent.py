import os
import json
import requests
from pathlib import Path

def load_book_chunks():
    """Load the preprocessed book chunks for RAG"""
    chunks_path = Path(__file__).parent.parent / "data" / "book_chunks.json"
    
    try:
        with open(chunks_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: Book chunks file not found at {chunks_path}")
        return []

def load_nutrient_limits():
    """Load recommended nutrient limits based on age, gender, etc."""
    limits_path = Path(__file__).parent.parent / "data" / "nutrient_limits.json"
    
    try:
        with open(limits_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: Nutrient limits file not found at {limits_path}")
        return {}

def load_disease_impacts():
    """Load information about how different foods impact various diseases"""
    disease_path = Path(__file__).parent.parent / "data" / "diseases.json"
    
    try:
        with open(disease_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: Diseases file not found at {disease_path}")
        return {}

# def retrieve_relevant_chunks(nutrition_info, user_profile, book_chunks):
#     """Simple keyword-based retrieval of relevant book chunks"""
#     relevant_chunks = []
    
#     # Search for chunks related to nutrients in the nutrition table
#     keywords = list(nutrition_info.keys())
    
#     # Add keywords based on user's medical conditions
#     if "medical_history" in user_profile and "diseases" in user_profile["medical_history"]:
#         for disease in user_profile["medical_history"]["diseases"]:
#             if isinstance(disease, dict) and "name" in disease:
#                 keywords.append(disease["name"])
#             elif isinstance(disease, str):
#                 keywords.append(disease)
    
#     # Add keywords for diet type
#     if "diet_type" in user_profile:
#         keywords.append(user_profile["diet_type"])
    
#     # Add allergies as keywords
#     if "allergies" in user_profile:
#         keywords.extend(user_profile["allergies"])
    
#     # Simple retrieval logic - check if chunk contains any keywords
#     for chunk in book_chunks:
#         for keyword in keywords:
#             if keyword.lower() in chunk.lower():
#                 relevant_chunks.append(chunk)
#                 break
    
#     return relevant_chunks[:5]  # Return top 5 most relevant chunks
def retrieve_relevant_chunks(nutrition_info, user_profile, book_chunks):
    """Robust keyword-based retrieval of relevant book chunks"""
    relevant_chunks = []
    keywords = list(nutrition_info.keys())

    # Add keywords from medical history
    if "medical_history" in user_profile and "diseases" in user_profile["medical_history"]:
        for disease in user_profile["medical_history"]["diseases"]:
            if isinstance(disease, dict) and "name" in disease:
                keywords.append(disease["name"])
            elif isinstance(disease, str):
                keywords.append(disease)

    # Add diet type and allergies
    keywords += user_profile.get("allergies", [])
    if "diet_type" in user_profile:
        keywords.append(user_profile["diet_type"])

    # Clean and lower all keywords
    keywords = [str(k).lower() for k in keywords if k]

    # Safely search for keywords in book chunks
    for chunk in book_chunks:
        # Handle None and ensure string
        text = chunk.get('text') if isinstance(chunk, dict) else chunk
        if not text:
            continue  # skip if text is None or empty
        text_lower = str(text).lower()

        if any(keyword in text_lower for keyword in keywords):
            relevant_chunks.append(str(text))
            if len(relevant_chunks) >= 5:
                break

    return relevant_chunks


def create_prompt(user_profile, nutrition_info, health_metrics, relevant_chunks):
    """Create a prompt for the GroqAI model including RAG context"""
    
    # Format nutrition info
    nutrition_str = "\n".join([f"{k}: {v}" for k, v in nutrition_info.items()])
    
    # Format health metrics
    health_metrics_str = "\n".join([f"{k}: {v}" for k, v in health_metrics.items()])
    
    # Format user profile (simplified for brevity)
    user_str = f"""
    Age: {user_profile.get('age')}
    Gender: {user_profile.get('gender')}
    Medical Conditions: {', '.join([d['name'] if isinstance(d, dict) else d for d in user_profile.get('medical_history', {}).get('diseases', [])])}
    Allergies: {', '.join(user_profile.get('allergies', []))}
    Diet Type: {user_profile.get('diet_type')}
    Activity Level: {user_profile.get('activity_level')}
    Goal: {user_profile.get('goal')}
    """
    
    # Combine relevant book chunks
    knowledge_str = "\n\n".join(relevant_chunks)
    
    # Create the final prompt
    prompt = f"""
    You are a nutritional expert that provides personalized health advice based on the Harvard Medical School Guide to Healthy Eating.
    
    Your task is to analyze a food item's nutrition information against a user's health profile, and assign a "Consumability Score" from 0-100, where:
    - 0-20: Avoid this food completely
    - 21-40: Consume rarely and in small portions
    - 41-60: Consume occasionally in moderate portions
    - 61-80: Generally good choice for this person
    - 81-100: Excellent choice that aligns with their health needs
    
    USER PROFILE:
    {user_str}
    
    HEALTH METRICS:
    {health_metrics_str}
    
    NUTRITION INFORMATION (per serving):
    {nutrition_str}
    
    RELEVANT HEALTH KNOWLEDGE:
    {knowledge_str}
    
    Based on all this information, provide:
    1. A consumability score (0-100)
    2. A detailed explanation for the score, including specific considerations for this person's health conditions
    3. Specific recommendations for how this food might fit into their diet
    
    Format your response exactly as follows:
    SCORE: [numeric score]
    
    EXPLANATION:
    [Your detailed explanation]
    
    RECOMMENDATIONS:
    [Your specific recommendations]
    """
    
    return prompt

def call_groq_api(prompt, api_key):
    """Call the GroqAI API with the given prompt"""
    url = "https://api.groq.com/openai/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "llama3-70b-8192",  # Using Llama 3 model through Groq
        "messages": [
            {"role": "system", "content": "You are a nutritional expert assistant that provides personalized health advice."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,  # Lower temperature for more deterministic output
        "max_tokens": 1000
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return None

def parse_groq_response(response):
    """Parse the response from GroqAI to extract score and explanation"""
    if not response:
        return 50, "Could not generate a response. Using default score of 50."
    
    try:
        # Extract score
        score_line = [line for line in response.split('\n') if line.startswith('SCORE:')]
        if score_line:
            score_text = score_line[0].replace('SCORE:', '').strip()
            score = int(score_text)
        else:
            score = 50  # Default score
        
        # Extract explanation
        explanation_start = response.find('EXPLANATION:')
        recommendation_start = response.find('RECOMMENDATIONS:')
        
        if explanation_start != -1 and recommendation_start != -1:
            explanation = response[explanation_start:recommendation_start].replace('EXPLANATION:', '').strip()
            recommendations = response[recommendation_start:].replace('RECOMMENDATIONS:', '').strip()
            full_explanation = f"{explanation}\n\nRECOMMENDATIONS:\n{recommendations}"
        else:
            full_explanation = response
        
        return score, full_explanation
    except Exception as e:
        print(f"Error parsing Groq response: {e}")
        return 50, "Error parsing response. Using default score of 50."

def generate_consumability_score(user_profile, nutrition_info, health_metrics, api_key):
    """Generate a consumability score for the food based on the user's profile"""
    # Load reference data
    book_chunks = load_book_chunks()
    nutrient_limits = load_nutrient_limits()
    disease_impacts = load_disease_impacts()
    
    # Retrieve relevant chunks from the book
    relevant_chunks = retrieve_relevant_chunks(nutrition_info, user_profile, book_chunks)
    
    # Create prompt for GroqAI
    prompt = create_prompt(user_profile, nutrition_info, health_metrics, relevant_chunks)
    
    # Call GroqAI API
    response = call_groq_api(prompt, api_key)
    
    # Parse response to extract score and explanation
    score, explanation = parse_groq_response(response)
    
    return score, explanation