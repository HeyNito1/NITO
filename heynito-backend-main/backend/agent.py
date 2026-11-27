# from langchain_core.tools import tool
# from langchain_classic.agents import create_openai_tools_agent, AgentExecutor
# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain_core.messages import HumanMessage, AIMessage

# from backend.rag import ask_from_documents
# from backend.llm import get_base_chat_model

# from backend.database import SessionLocal
# from backend.models import UsageLog, Conversation, Message
# from sqlalchemy import func

# # PDF search karna.
# # Indian languages mein translation karna.
# # Mathematical calculations karna.


# def create_user_agent_executor(user_id: str, model_name: str = "llama"):
#     """
#     Logged-in user ke liye dynamic tools aur agent executor taiyar karta hai.
#     """

#     # Tool 1: User's PDF Search (Dynamic user_id ke sath)
#     @tool    # AI callable tool made 
#     def search_user_pdf(query: str) -> str:
#         # current user context se RAG search
#         """Use this tool when the user asks questions about their uploaded documents, PDFs, or files."""
#         try:
#             res = ask_from_documents(question=query, user_id=user_id)
#             return f"Answer: {res['answer']}\nSources: {res['sources']}"
#         except Exception as e:
#             return f"Could not find document context: {str(e)}"

#     # Tool 2: Sarvam Translation Tool (Indian Languages)
#     @tool
#     def translate_to_indian_language(text: str, target_language: str) -> str:
#         """Use this tool when the user specifically asks to translate text into an Indian language (Hindi, Tamil, etc.)."""
#         sarvam_llm = get_base_chat_model("sarvam")
#         prompt = f"Translate the following text into {target_language}. Return ONLY the translation:\n\n{text}"
#         response = sarvam_llm.invoke(prompt)
#         return response.content

#     # Tool 3: Math / Python Calculator Tool
#     @tool
#     def calculate_expression(math_expression: str) -> str:
#         """Use this tool to solve complex math, arithmetic, or financial calculations accurately."""
#         try:
#             # Safe basic evaluation
#             allowed = "0123456789+-*/(). %"   # allowed chars list 
#             if all(c in allowed for c in math_expression):
#                 return str(eval(math_expression))  # evaluate the expressiona nd return the result as string 
#             return "Expression contained unsupported characters."
#         except Exception as err:
#             return f"Math error: {str(err)}"


#      # Tool 4: Database Token & Conversation Analytics Tool
#     @tool
#     def check_user_account_analytics() -> str:
#         """Use this tool when the user asks about their token usage, remaining quota, chat stats, or conversation history stats."""
#         try:
#             with SessionLocal() as session:
#                 # 1. Total Token Usage sum
#                 total_input = (
#                     session.query(func.sum(UsageLog.input_tokens))
#                     .filter(UsageLog.user_id == user_id)
#                     .scalar() or 0
#                 )
#                 total_output = (
#                     session.query(func.sum(UsageLog.output_tokens))
#                     .filter(UsageLog.user_id == user_id)
#                     .scalar() or 0
#                 )
#                 total_cost = (
#                     session.query(func.sum(UsageLog.cost))
#                     .filter(UsageLog.user_id == user_id)
#                     .scalar() or 0.0
#                 )
#                 # 2. Total Conversations count
#                 conv_count = (
#                     session.query(func.count(Conversation.id))
#                     .filter(Conversation.user_id == user_id)
#                     .scalar() or 0
#                 )
#                 return (
#                     f"Analytics for your account:\n"
#                     f"- Total Conversations: {conv_count}\n"
#                     f"- Total Input Tokens Used: {total_input}\n"
#                     f"- Total Output Tokens Used: {total_output}\n"
#                     f"- Total Estimated Cost: ${round(total_cost, 4)}"
#                 )
#         except Exception as e:
#             return f"Could not fetch account analytics: {str(e)}"

#     # Available tools list
#     tools = [search_user_pdf, translate_to_indian_language, calculate_expression,check_user_account_analytics]

#     # Agent Prompt Instructions 
#     #Giving the AI Its Instructions (The Prompt) -- sets up the AI's brain and memory 
#     agent_prompt = ChatPromptTemplate.from_messages([
#         (
#             "system",
#             "You are HEYNITO AI, an intelligent agent. "
#             "You have access to tools: document search, language translation, math calculation, and account analytics. "
#             "Only call tools when genuinely necessary. Otherwise, reply directly."
#         ),
#         MessagesPlaceholder(variable_name="chat_history"),
#         ("user", "{input}"),
#         MessagesPlaceholder(variable_name="agent_scratchpad"),
#     ])

#     # Llama 3.3 tools support me best hai
#     llm = get_base_chat_model(model_name)
#     agent = create_openai_tools_agent(llm, tools, agent_prompt)

#     return AgentExecutor(
#         agent=agent, 
#         tools=tools, 
#         verbose=True,
#         handle_parsing_errors=True,
#         max_iterations=4
#     )


# def run_agent(query: str, user_id: str, chat_history: list = None) -> str:
#     """
#     Main function jise chat_routes.py ya kahin se bhi direct call kar sakte hain.
#     chat_history: [("user", "..."), ("assistant", "...")]
#     """
#     executor = create_user_agent_executor(user_id=user_id)

#     formatted_history = []
#     if chat_history:
#         for role, text in chat_history:
#             if role == "user":
#                 formatted_history.append(HumanMessage(content=text))
#             elif role == "assistant":
#                 formatted_history.append(AIMessage(content=text))

#     result = executor.invoke({
#         "input": query,
#         "chat_history": formatted_history
#     })

#     return result["output"]

import logging
import operator
import ast

from langchain_core.tools import tool
from langchain_classic.agents import (
    create_openai_tools_agent,
    AgentExecutor
)
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder
)
from langchain_core.messages import HumanMessage, AIMessage

from backend.rag import ask_from_documents
from backend.llm import get_base_chat_model

from backend.mongodb import conversations, usage_logs

from backend.repositories.usage_repository import (
    get_daily_usage,
    get_active_user
)


logger = logging.getLogger(__name__)


# Safe mathematical operators
OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Mod: operator.mod,
    ast.UAdd: operator.pos,
    ast.USub: operator.neg
}


def evaluate_expression(node):

    if isinstance(node, ast.Constant):
        if type(node.value) in (int, float):
            return node.value

    if isinstance(node, ast.BinOp):
        operation = OPERATORS.get(type(node.op))

        if operation:
            return operation(
                evaluate_expression(node.left),
                evaluate_expression(node.right)
            )

    if isinstance(node, ast.UnaryOp):
        operation = OPERATORS.get(type(node.op))

        if operation:
            return operation(
                evaluate_expression(node.operand)
            )

    raise ValueError("Unsupported mathematical expression")


def create_user_agent_executor(
    user_id: str,
    model_name: str = "llama"
):

    # Tool 1: Document search
    @tool
    def search_user_pdf(query: str) -> str:
        """Search the user's uploaded documents and PDFs."""

        try:
            res = ask_from_documents(
                question=query,
                user_id=user_id
            )

            return (
                f"Answer: {res['answer']}\n"
                f"Sources: {res['sources']}"
            )

        except Exception:
            logger.exception("Document search failed")
            return "Could not retrieve document context."


    # Tool 2: Indian language translation
    @tool
    def translate_to_indian_language(
        text: str,
        target_language: str
    ) -> str:
        """Translate text into an Indian language."""

        sarvam_llm = get_base_chat_model("sarvam")

        prompt = (
            f"Translate the following text into "
            f"{target_language}. "
            f"Return ONLY the translation:\n\n{text}"
        )

        response = sarvam_llm.invoke(prompt)

        return response.content


    # Tool 3: Mathematical calculator
    @tool
    def calculate_expression(
        math_expression: str
    ) -> str:
        """Perform mathematical and arithmetic calculations."""

        try:
            if len(math_expression) > 200:
                return "Expression is too long."

            tree = ast.parse(
                math_expression.strip(),
                mode="eval"
            )

            result = evaluate_expression(tree.body)

            return str(result)

        except Exception:
            return "Invalid mathematical expression."


    # Tool 4: MongoDB account analytics
    @tool
    def check_user_account_analytics() -> str:
        """Retrieve token usage, remaining quota and chat statistics."""

        try:
            user = get_active_user(user_id)

            daily_usage = get_daily_usage(user_id)

            pipeline = [
                {
                    "$match": {
                        "user_id": user_id
                    }
                },
                {
                    "$group": {
                        "_id": None,
                        "total_input": {
                            "$sum": "$input_tokens"
                        },
                        "total_output": {
                            "$sum": "$output_tokens"
                        },
                        "total_cost": {
                            "$sum": "$estimated_cost"
                        }
                    }
                }
            ]

            analytics = next(
                usage_logs.aggregate(pipeline),
                {}
            )

            total_input = analytics.get(
                "total_input", 0
            )

            total_output = analytics.get(
                "total_output", 0
            )

            total_cost = analytics.get(
                "total_cost", 0.0
            )

            conversation_count = (
                conversations.count_documents({
                    "user_id": user_id
                })
            )

            daily_limit = (
                user.get("daily_token_limit") or 10000
            )

            daily_used = daily_usage["total_tokens"]

            remaining = max(
                0,
                daily_limit - daily_used
            )

            return (
                f"Analytics for your account:\n"
                f"- Current Plan: {user.get('plan', 'free')}\n"
                f"- Total Conversations: {conversation_count}\n"
                f"- Total Input Tokens: {total_input}\n"
                f"- Total Output Tokens: {total_output}\n"
                f"- Lifetime Tokens Used: "
                f"{total_input + total_output}\n"
                f"- Daily Token Limit: {daily_limit}\n"
                f"- Tokens Used Today: {daily_used}\n"
                f"- Remaining Daily Tokens: {remaining}\n"
                f"- Total Estimated Cost: "
                f"${round(total_cost, 4)}"
            )

        except Exception:
            logger.exception("Account analytics failed")
            return "Could not retrieve account analytics."


    tools = [
        search_user_pdf,
        translate_to_indian_language,
        calculate_expression,
        check_user_account_analytics
    ]


    agent_prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are HEYNITO AI, an intelligent agent. "
            "You have access to tools: document search, "
            "language translation, math calculation, "
            "and account analytics. "
            "Only call tools when genuinely necessary. "
            "Otherwise, reply directly."
        ),
        MessagesPlaceholder(
            variable_name="chat_history"
        ),
        ("user", "{input}"),
        MessagesPlaceholder(
            variable_name="agent_scratchpad"
        )
    ])


    llm = get_base_chat_model(model_name)

    agent = create_openai_tools_agent(
        llm,
        tools,
        agent_prompt
    )

    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=False,
        handle_parsing_errors=True,
        max_iterations=4
    )


def run_agent(
    query: str,
    user_id: str,
    chat_history: list = None
) -> str:

    executor = create_user_agent_executor(
        user_id=user_id
    )

    formatted_history = []

    for item in chat_history or []:

        # MongoDB dictionary format
        if isinstance(item, dict):
            role = item.get("role")
            text = item.get("content", "")

        # Legacy tuple format
        elif isinstance(item, (tuple, list)) and len(item) == 2:
            role, text = item

        else:
            continue

        if role == "user":
            formatted_history.append(
                HumanMessage(content=text)
            )

        elif role == "assistant":
            formatted_history.append(
                AIMessage(content=text)
            )

    result = executor.invoke({
        "input": query,
        "chat_history": formatted_history
    })

    return result["output"]