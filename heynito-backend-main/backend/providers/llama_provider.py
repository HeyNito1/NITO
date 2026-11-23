from openai import OpenAI
from backend.config import LLAMA_API_KEY


def get_llama_response_with_usage(messages: list) -> dict:
    if not LLAMA_API_KEY:
        raise RuntimeError("LLAMA_API_KEY missing in .env")

    client = OpenAI(
        api_key=LLAMA_API_KEY,
        base_url="https://openrouter.ai/api/v1",
        timeout=30.0,
        max_retries=2,
    )

    response = client.chat.completions.create(
        model="meta-llama/llama-3.3-70b-instruct",
        messages=messages,
    )

    reply = response.choices[0].message.content

    if not reply:
        raise RuntimeError("Llama returned an empty response")

    usage = response.usage

    return {
        "reply": reply,
        "input_tokens": usage.prompt_tokens if usage else 0,
        "output_tokens": usage.completion_tokens if usage else 0,
    }


def get_llama_response(messages: list) -> str:
    return get_llama_response_with_usage(messages)["reply"]