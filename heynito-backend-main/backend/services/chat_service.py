import logging

from fastapi import HTTPException

from backend.llm import calculate_cost

from backend.repositories.conversation_repository import (
    create_conversation,
    get_conversation,
    get_chat_history,
    save_message
)

from backend.repositories.usage_repository import (
    enforce_token_limit,
    save_usage
)


logger = logging.getLogger(__name__)


def prepare_chat(user_id, message, conversation_id=None):

    enforce_token_limit(user_id)

    if conversation_id:

        conversation = get_conversation(
            conversation_id,
            user_id
        )

        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

    else:

        conversation = create_conversation(
            user_id=user_id,
            title=message
        )

    conversation_id = conversation["_id"]

    history = get_chat_history(conversation_id)

    save_message(
        conversation_id=conversation_id,
        role="user",
        content=message
    )

    return conversation_id, history


def complete_chat(
    user_id,
    conversation_id,
    reply,
    model,
    input_tokens,
    output_tokens
):

    save_message(
        conversation_id=conversation_id,
        role="assistant",
        content=reply
    )

    try:
        estimated_cost = calculate_cost(
            model,
            input_tokens,
            output_tokens
        )

    except Exception:
        logger.exception("Cost calculation failed")
        estimated_cost = 0.0

    save_usage(
        user_id=user_id,
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        estimated_cost=estimated_cost
    )


def estimate_tokens(text):

    if not text:
        return 0

    return max(1, (len(text) + 3) // 4)