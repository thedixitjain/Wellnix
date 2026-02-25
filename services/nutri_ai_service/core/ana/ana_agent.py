"""
Ana — RAG-based diet chatbot for Wellnix Nutri AI.

Given a set of ingredients the user has on hand, Ana retrieves relevant
nutrition knowledge from the Harvard Medical School book chunks and
disease/nutrient reference data, then asks Groq (Llama 3) to compose a
healthy, personalised diet plan.
"""

import json
import os
import requests
from pathlib import Path
from typing import List, Dict, Any, Optional

DATA_DIR = Path(__file__).resolve().parents[4] / "data" / "nutri-ai"


def _load_json(filename: str) -> Any:
    path = DATA_DIR / filename
    if not path.exists():
        return [] if filename.endswith("chunks.json") else {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _load_book_chunks() -> List[Dict]:
    return _load_json("book_chunks.json")


def _load_diseases() -> Dict:
    return _load_json("diseases.json")


def _load_nutrient_limits() -> Dict:
    return _load_json("nutrient_limits.json")


def _retrieve_chunks_for_ingredients(
    ingredients: List[str],
    user_profile: Optional[Dict] = None,
    max_chunks: int = 6,
) -> List[str]:
    """Keyword retrieval over the book chunks, biased toward the user's
    ingredients plus any medical conditions from their profile."""
    book_chunks = _load_book_chunks()
    if not book_chunks:
        return []

    keywords = [i.strip().lower() for i in ingredients if i.strip()]

    nutrition_terms = [
        "protein", "carbohydrate", "fat", "fiber", "vitamin",
        "mineral", "calorie", "healthy", "nutrient", "diet",
    ]
    keywords.extend(nutrition_terms)

    if user_profile:
        diseases = user_profile.get("medical_history", {}).get("diseases", [])
        for d in diseases:
            name = d.get("name") if isinstance(d, dict) else d
            if name:
                keywords.append(str(name).lower())
        allergies = user_profile.get("allergies", [])
        keywords.extend([a.lower() for a in allergies if a])
        if user_profile.get("diet_type"):
            keywords.append(user_profile["diet_type"].lower())
        if user_profile.get("goal"):
            keywords.append(user_profile["goal"].lower())

    results: List[str] = []
    for chunk in book_chunks:
        text = chunk.get("content") if isinstance(chunk, dict) else chunk
        if not text:
            continue
        text_lower = str(text).lower()
        if any(kw in text_lower for kw in keywords):
            results.append(str(text))
            if len(results) >= max_chunks:
                break
    return results


def _build_system_prompt() -> str:
    return (
        "You are Ana, Wellnix's friendly nutrition assistant. "
        "You are an expert dietitian trained on the Harvard Medical School "
        "Guide to Healthy Eating. Your job is to take the ingredients a user "
        "has available and suggest a practical, healthy diet plan they can "
        "prepare at home.\n\n"
        "Guidelines:\n"
        "- Always be encouraging and positive.\n"
        "- Suggest 2-3 meal ideas (breakfast / lunch / dinner as applicable).\n"
        "- For each meal give a short recipe outline (3-5 steps).\n"
        "- Mention approximate calorie and macro estimates per meal.\n"
        "- If the user has medical conditions or dietary restrictions, respect them.\n"
        "- If the ingredients are limited, suggest what single item they could "
        "add from the store to round out nutrition.\n"
        "- Keep responses concise but informative. Use markdown formatting.\n"
        "- End with a short motivational health tip.\n"
    )


def _build_user_prompt(
    ingredients: List[str],
    user_profile: Optional[Dict],
    knowledge_context: str,
    diseases_context: str,
    nutrient_limits_context: str,
    conversation_history: Optional[List[Dict]] = None,
    latest_message: str = "",
) -> str:
    profile_block = ""
    if user_profile:
        profile_block = (
            "\n**User Profile:**\n"
            f"- Age: {user_profile.get('age', 'N/A')}\n"
            f"- Gender: {user_profile.get('gender', 'N/A')}\n"
            f"- Activity Level: {user_profile.get('activity_level', 'N/A')}\n"
            f"- Diet Type: {user_profile.get('diet_type', 'N/A')}\n"
            f"- Goal: {user_profile.get('goal', 'N/A')}\n"
            f"- Allergies: {', '.join(user_profile.get('allergies', [])) or 'None'}\n"
            f"- Medical Conditions: {', '.join(_flat_diseases(user_profile)) or 'None'}\n"
        )

    ingredients_str = ", ".join(ingredients) if ingredients else latest_message

    prompt = (
        f"The user currently has these ingredients: **{ingredients_str}**\n"
        f"{profile_block}\n"
        f"**Relevant Nutrition Knowledge (from Harvard Medical School):**\n"
        f"{knowledge_context}\n\n"
        f"**Disease-Specific Dietary Guidelines:**\n"
        f"{diseases_context}\n\n"
        f"**Daily Nutrient Limits:**\n"
        f"{nutrient_limits_context}\n\n"
        "Based on the above, suggest a healthy diet plan using the available "
        "ingredients. Be specific with portion sizes and preparation methods."
    )
    return prompt


def _flat_diseases(profile: Dict) -> List[str]:
    diseases = profile.get("medical_history", {}).get("diseases", [])
    names = []
    for d in diseases:
        if isinstance(d, dict):
            names.append(d.get("name", ""))
        else:
            names.append(str(d))
    return [n for n in names if n]


GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]


def _call_groq(messages: List[Dict], api_key: str) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    last_error = ""
    for model in GROQ_MODELS:
        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.45,
            "max_tokens": 1500,
        }
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=45)
            if resp.ok:
                return resp.json()["choices"][0]["message"]["content"]
            last_error = f"{model}: {resp.status_code} {resp.text[:200]}"
        except requests.exceptions.Timeout:
            last_error = f"{model}: timeout"
        except Exception as exc:
            last_error = f"{model}: {exc}"

    return f"I'm sorry, I couldn't generate a response right now. Last error: {last_error}"


def _extract_ingredients(text: str) -> List[str]:
    """Best-effort extraction of ingredient names from free-form text."""
    cleaned = text.lower().strip()
    for prefix in [
        "i have", "i've got", "i got", "my ingredients are",
        "ingredients:", "here are my ingredients",
    ]:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):].strip(" :,")

    if "," in cleaned:
        parts = [p.strip() for p in cleaned.split(",")]
    elif " and " in cleaned:
        parts = [p.strip() for p in cleaned.replace(" and ", ",").split(",")]
    else:
        parts = cleaned.split()

    return [p for p in parts if p and len(p) < 60]


def chat(
    message: str,
    history: Optional[List[Dict]] = None,
    user_profile: Optional[Dict] = None,
    api_key: Optional[str] = None,
) -> str:
    """
    Main entry point.  Accepts a user message (typically a list of
    ingredients), optional conversation history, and returns Ana's reply.
    """
    api_key = api_key or os.getenv("GROQ_API_KEY")
    if not api_key:
        return (
            "Ana is not configured yet — the GROQ_API_KEY environment "
            "variable is missing. Please ask the admin to set it up."
        )

    ingredients = _extract_ingredients(message)

    chunks = _retrieve_chunks_for_ingredients(ingredients, user_profile)
    knowledge_context = "\n---\n".join(chunks[:6]) if chunks else "No specific knowledge retrieved."

    diseases_data = _load_diseases()
    user_diseases = _flat_diseases(user_profile) if user_profile else []
    disease_entries = []
    for d_name in user_diseases:
        key = d_name.lower()
        if key in diseases_data:
            info = diseases_data[key]
            disease_entries.append(
                f"**{d_name}**: {info.get('recommended_diet', '')} "
                f"Risks: {json.dumps(info.get('nutrient_risks', {}))}"
            )
    diseases_context = "\n".join(disease_entries) if disease_entries else "No specific disease constraints."

    nutrient_limits = _load_nutrient_limits()
    nutrient_limits_context = json.dumps(nutrient_limits.get("general", {}), indent=2)

    user_prompt = _build_user_prompt(
        ingredients=ingredients,
        user_profile=user_profile,
        knowledge_context=knowledge_context,
        diseases_context=diseases_context,
        nutrient_limits_context=nutrient_limits_context,
        conversation_history=history,
        latest_message=message,
    )

    messages: List[Dict] = [{"role": "system", "content": _build_system_prompt()}]

    if history:
        for entry in history[-8:]:
            messages.append({
                "role": entry.get("role", "user"),
                "content": entry.get("content", ""),
            })

    messages.append({"role": "user", "content": user_prompt})

    return _call_groq(messages, api_key)
