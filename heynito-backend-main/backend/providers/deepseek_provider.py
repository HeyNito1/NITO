from openai import OpenAI
from backend.config import DEEPSEEK_API_KEY


def get_deepseek_response_with_usage(messages: list) -> dict:
    if not DEEPSEEK_API_KEY:
        raise RuntimeError("DEEPSEEK_API_KEY missing in .env")

    client = OpenAI( api_key=DEEPSEEK_API_KEY, base_url="https://openrouter.ai/api/v1", timeout=30.0, max_retries=2 )

    response = client.chat.completions.create( model="deepseek/deepseek-chat", messages=messages, )

    reply = response.choices[0].message.content

    if not reply:
        raise RuntimeError("DeepSeek returned an empty response")

    usage = response.usage

    return {
        "reply": reply,
        "input_tokens": usage.prompt_tokens if usage else 0,  # usage details unavailable ho toh zero 
        "output_tokens": usage.completion_tokens if usage else 0, 
    }


def get_deepseek_response(messages: list) -> str:
    return get_deepseek_response_with_usage(messages)["reply"]