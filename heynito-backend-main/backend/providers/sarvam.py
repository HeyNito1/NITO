
from groq import (
    Groq, APIConnectionError, APITimeoutError,
    RateLimitError, APIStatusError
)
from backend.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY, timeout=30.0, max_retries=2)


def get_qwen_response_with_usage(messages: list) -> dict:
    try:
        response = client.chat.completions.create( model="qwen/qwen3.8-27b", messages=messages )

        reply = response.choices[0].message.content
        if not reply:
            raise RuntimeError("AI returned an empty response")

        usage = response.usage

        return {
            "reply": reply,
            "input_tokens": usage.prompt_tokens if usage else 0,
            "output_tokens": usage.completion_tokens if usage else 0,
        }

    except ( APITimeoutError, APIConnectionError, RateLimitError, APIStatusError, ):
        raise


def get_qwen_response(messages: list) -> str:
    return get_qwen_response_with_usage(messages)["reply"]
