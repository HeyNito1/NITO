from openai import OpenAI
from backend.config import NEMOTRON_API_KEY


def get_nemotron_response_with_usage(messages: list) -> dict:
    if not NEMOTRON_API_KEY:
        raise RuntimeError("NEMOTRON_API_KEY missing in .env")

    client = OpenAI(
        api_key=NEMOTRON_API_KEY,
        base_url="https://integrate.api.nvidia.com/v1",
    )

    response = client.chat.completions.create(
        model="nvidia/nemotron-3.5-lightning-30b-a3b",
        messages=messages,
    )

    reply = response.choices[0].message.content

    if not reply:
        raise RuntimeError("Nemotron returned an empty response")

    usage = response.usage

    return {
        "reply": reply,
        "input_tokens": usage.prompt_tokens if usage else 0,
        "output_tokens": usage.completion_tokens if usage else 0,
    }


def get_nemotron_response(messages: list) -> str:
    return get_nemotron_response_with_usage(messages)["reply"]