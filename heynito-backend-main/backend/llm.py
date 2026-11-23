import logging
from typing import Literal
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI

from backend.config import (
    LLAMA_API_KEY,
    DEEPSEEK_API_KEY,
    SARVAM_API_KEY,
    MIMO_API_KEY,
)

# get_base_chat_model 
# get_chat_model(primary_model , enable_fallback ) 
# get_model_response
# get_model_response_with_usage
# get_model_for_query
# calculate_cost
# 

logger = logging.getLogger(__name__)

# Aapke exactly 4 supported models
SupportedModel = Literal["deepseek", "sarvam", "llama", "mimo"]

# returning the model instance so that invoke can be called on it 
def get_base_chat_model(model_name: str) -> BaseChatModel:
    """
    Sabhi 4 models ka LangChain unified instance return karta hai.
    Sabhi models OpenAI API spec follow karte hain (via OpenRouter ya direct provider endpoint).
    """
    model_name = model_name.strip().lower()

    # 1. DEEPSEEK (Coding & Problem Solving)
    if model_name == "deepseek":
        return ChatOpenAI(
            model="deepseek/deepseek-chat",
            api_key=DEEPSEEK_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            temperature=0.6,
            timeout=30.0,
            max_retries=2,
        )

    # 2. SARVAM (Indian Languages / Indic Tasks)
    elif model_name == "sarvam":
        return ChatOpenAI(
            model="sarvam-2b",  # ya Sarvam model slug (e.g. sarvam-m)
            api_key=SARVAM_API_KEY,
            base_url="https://api.sarvam.ai/v1",  # Agar OpenRouter pe hai toh https://openrouter.ai/api/v1 kar sakte hain
            temperature=0.7,
            timeout=30.0,
            max_retries=2,
        )

    # 3. LLAMA (High Reliability & General Reasoning)
    elif model_name == "llama":
        return ChatOpenAI(
            model="meta-llama/llama-3.3-70b-instruct",
            api_key=LLAMA_API_KEY,
            base_url="https://openrouter.ai/api/v1", # url where to direct
            temperature=0.7, 
            timeout=30.0,
            max_retries=2,
        )

    # 4. XIAOMI MIMO (MiMo-V2.6-Flash: Fast responses & Quick tasks)
    elif model_name in ["mimo", "xiaomi", "mimo-flash"]:
        return ChatOpenAI(
            model="xiaomi/mimo-v2.6-flash",
            api_key=MIMO_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            temperature=0.7,
            timeout=30.0,
            max_retries=2,
        )

    else:
        raise ValueError(
            f"Unsupported model: {model_name}. Allowed: ['deepseek', 'sarvam', 'llama', 'mimo']"
        )

# if the model provided --> its limit ends then fallback --> llama 
def get_chat_model(primary_model: str = "llama", enable_fallback: bool = True) -> BaseChatModel:
    """
    LangChain ka `.with_fallbacks()` use karta hai.
    Agar primary model fail hota hai, toh automatically Llama par fallback ho jayega.
    """
    primary = get_base_chat_model(primary_model)

    if not enable_fallback or primary_model == "llama":
        return primary

    fallback_model = get_base_chat_model("llama")
    return primary.with_fallbacks([fallback_model])


def get_model_response(messages: list, model: str = "llama") -> str:
    """Simple text response return karta hai"""
    result = get_model_response_with_usage(messages, model)
    return result["reply"]


def get_model_response_with_usage(messages: list, model: str = "llama") -> dict:
    """
    Chat routes aur DB logging ke liye response + token usage return karta hai.
    """
    model = model.strip().lower()
    llm = get_chat_model(primary_model=model, enable_fallback=True)

    response = llm.invoke(messages)

    # LangChain se token usage extract
    usage = response.response_metadata.get("token_usage", {})
    input_tokens = usage.get("prompt_tokens", 0)
    output_tokens = usage.get("completion_tokens", 0)

    return {
        "reply": response.content,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "model": model,
    }


def get_model_for_query(query: str) -> str:
    """
    User ki query ke keywords ke hisaab se best model choose karta hai.
    """
    query_lower = query.lower()

    coding_keywords = [
        "code", "coding", "debug", "bug", "python",
        "java", "c++", "program", "algorithm", "leetcode", "sql"
    ]
    indic_keywords = [
        "hindi", "tamil", "telugu", "bengali", "marathi", 
        "gujarati", "kannada", "malayalam", "odia", "punjabi", "sarvam"
    ]
    flash_keywords = [
        "quick", "fast", "summary", "short", "tldr", "bullet points"
    ]

    if any(w in query_lower for w in coding_keywords):
        return "deepseek"
    if any(w in query_lower for w in indic_keywords):
        return "sarvam"
    if any(w in query_lower for w in flash_keywords):
        return "mimo"

    return "llama"


# Cost calculation jo chat_routes.py use karta hai
MODEL_PRICING = {
    "deepseek": {"input": 0.14, "output": 0.28},
    "sarvam": {"input": 0.10, "output": 0.20},
    "llama": {"input": 0.12, "output": 0.30},
    "mimo": {"input": 0.10, "output": 0.20},
}


def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    pricing = MODEL_PRICING.get(model, {"input": 0.0, "output": 0.0})
    return (input_tokens * pricing["input"] + output_tokens * pricing["output"]) / 1_000_000

