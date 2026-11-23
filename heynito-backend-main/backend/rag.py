from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from backend.embeddings import generate_embeddings
from backend.vector_store import search_chunks
from backend.llm import get_chat_model , get_base_chat_model
from pydantic import BaseModel, Field
from typing import Optional, List
from langchain_core.prompts import MessagesPlaceholder

# 1. RAG Question Prompt Template
rag_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "Answer using only the provided document context. "
        "Cite source filename and page number. Do not invent facts."
    ),
    (
        "user",
        "Document context:\n{context}\n\nQuestion: {question}"
    )
])

# 2. Document Compare Prompt Template
compare_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "Compare documents using only their content. "
        "Explain similarities and differences. Cite filenames and pages. "
        "Never invent facts."
    ),
    (
        "user",
        "Comparison request: {question}\n\nDocuments:\n{context}"
    )
])

# 3. Question ko contextualize ( relate to upper conversation ) karne ka prompt
contextualize_q_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "Given a chat history and the latest user question which might reference context in the chat history, "
        "formulate a standalone question which can be understood without the chat history. "
        "Do NOT answer the question, just reformulate it if needed and otherwise return it as is."
    ),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{question}"),
])

# 4. summary of the uploaded pdf by the user 
summary_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are an expert document summarizer. Provide an executive summary with:\n"
        "1. Main Purpose of Document\n"
        "2. Key Highlights / Findings (Bullet points)\n"
        "3. Important Dates, Numbers, or Action Items."
    ),
    ("user", "Document Chunks:\n{text}")
])


def ask_from_documents( question: str,  user_id: str,  filename: str | None = None, model_name: str = "llama" ) -> dict:
    # question --> direct embedding create 
    query_embedding = generate_embeddings([question])[0]

    relevant_chunks = search_chunks(query_embedding, user_id=user_id, filename=filename)

    if not relevant_chunks:
        raise ValueError("No matching documents found. Upload a PDF first.")

    context = "\n\n".join(
        f"[Source: {chunk['filename']}, Page: {chunk['page']}]\n{chunk['text']}"
        for chunk in relevant_chunks
    )

    # LangChain LCEL Chain: Prompt | Model (with fallback) | Parser
    llm = get_chat_model(model_name)
    rag_chain = rag_prompt | llm | StrOutputParser() # runnable 

    answer = rag_chain.invoke({ "context": context, "question": question })

    sources = [
        {
            "filename": chunk["filename"],
            "page": chunk["page"],
            "text": chunk["text"]
        }
        for chunk in relevant_chunks
    ]

    return {"question": question, "answer": answer, "sources": sources}


def compare_documents(
    question: str, 
    filenames: list[str], 
    user_id: str,
    model_name: str = "llama"
) -> dict:
    if len(filenames) < 2 or len(filenames) > 5:
        raise ValueError("Provide between 2 and 5 PDF filenames.")

    query_embedding = generate_embeddings([question])[0]
    all_chunks = []

    for filename in filenames:                          # top 3 relevant chunks fetched 
        chunks = search_chunks(query_embedding, user_id=user_id, n_results=3, filename=filename)

        if not chunks:
            raise ValueError(f"No matching content found in {filename}.")

        all_chunks.extend(chunks)

    context = "\n\n".join(
        f"[PDF: {chunk['filename']}, Page: {chunk['page']}]\n{chunk['text']}"
        for chunk in all_chunks
    )

    # LangChain LCEL Chain for Comparison
    llm = get_chat_model(model_name)
    compare_chain = compare_prompt | llm | StrOutputParser()

    answer = compare_chain.invoke({
        "context": context,
        "question": question
    })

    sources = [
        {
            "filename": chunk["filename"],
            "page": chunk["page"],
            "text": chunk["text"]
        }
        for chunk in all_chunks
    ]

    return { "question": question, "documents_compared": filenames, "answer": answer, "sources": sources }


def ask_with_chat_history( question: str,   chat_history: list,   user_id: str,   filename: str | None = None, model_name: str = "llama" ) -> dict:
    """
    Follow-up questions ko context ke sath handle karne wala RAG
    chat_history format: [("user", "msg1"), ("assistant", "reply1")]
    """
    llm = get_chat_model(model_name)
    # Step A: Agar purani history hai, toh question ko reformulate karo
    if chat_history:
        rephrase_chain = contextualize_q_prompt | llm | StrOutputParser()
        standalone_question = rephrase_chain.invoke({
            "chat_history": chat_history,
            "question": question
        })
    else:
        standalone_question = question
    # Step B: Reformulated question se vector search karein
    return ask_from_documents(
        question=standalone_question, 
        user_id=user_id, 
        filename=filename, 
        model_name=model_name
    )

def summarize_uploaded_document(chunks: list[dict], model_name: str = "mimo") -> str:
    """
    Xiaomi MiMo (Flash) fast & cheap hai, summary ke liye perfect hai!
    """
    # Shuru ke aur important chunks combine karein
    combined_text = "\n\n".join([chunk["text"] for chunk in chunks[:8]])
    llm = get_chat_model(model_name)
    chain = summary_prompt | llm | StrOutputParser()
    return chain.invoke({"text": combined_text})


# structured doc analysis 
class DocumentAnalysis(BaseModel):
    document_type: str = Field(description="e.g. Invoice, Resume, Agreement, Research Paper, Report")
    title_or_subject: str = Field(description="Title or subject of the document")
    key_entities: List[str] = Field(description="Organizations, people, or companies mentioned")
    summary: str = Field(description="Brief 2-line summary")
    action_items_or_dates: List[str] = Field(description="Deadlines, payment amounts, or key actions")

def extract_structured_data_from_doc(context_text: str) -> dict:
    """
    Document context se automatic structured JSON extract karega.
    """
    # DeepSeek ya Llama structured output ke liye best hain
    llm = get_base_chat_model("llama").with_structured_output(DocumentAnalysis)
    
    prompt = f"Extract structured information from this document:\n\n{context_text[:4000]}"
    structured_data = llm.invoke(prompt)
    
    return structured_data.model_dump()


# multi query -- prompt 
multi_query_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are an AI assistant helping with document search. "
        "Generate 3 different alternative ways to phrase the user's question to retrieve relevant chunks from a PDF. "
        "Return ONLY the 3 questions separated by newlines, with no extra numbering or introductory text."
    ),
    ("user", "{question}")
])


def generate_multi_queries(question: str) -> list[str]:
    """1 question ke 3 additional versions banata hai"""
    llm = get_chat_model("mimo")  # MiMo fast hai, turant generate kar deta hai
    chain = multi_query_prompt | llm | StrOutputParser()
    
    try:
        raw_output = chain.invoke({"question": question})
        queries = [q.strip() for q in raw_output.split("\n") if q.strip()]  # ai response in diff-diff lines , extra spaces remove 
        # Original question ko pehle rakhein aur 3 alternative add karein
        all_queries = [question]
        for q in queries:
            if q not in all_queries:
                all_queries.append(q)
        return all_queries[:4]
    except Exception:
        return [question]


def ask_from_documents_multi_query(
    question: str, 
    user_id: str, 
    filename: str | None = None, 
    model_name: str = "llama"
) -> dict:
    """
    Multi-Query Advanced RAG:
    User ke question ke alag-alag variations dhoond kar chunks combine aur deduplicate karta hai.
    """

    # 1. Question ke 3-4 perspectives banaye
    queries = generate_multi_queries(question)
    all_chunks = []
    seen_texts = set()

    
    # 2. Har query ke liye vector search karein
    for q in queries:
        q_emb = generate_embeddings([q])[0]
        chunks = search_chunks(q_emb, user_id=user_id, n_results=2, filename=filename)
        for chunk in chunks:
            # Deduplication: Same chunk dobara add na ho
            if chunk["text"] not in seen_texts:
                seen_texts.add(chunk["text"])
                all_chunks.append(chunk)
    if not all_chunks:
        raise ValueError("No matching documents found. Upload a PDF first.")


    # 3. Context build karein (Top 5 unique chunks)
    context = "\n\n".join(
        f"[Source: {chunk['filename']}, Page: {chunk['page']}]\n{chunk['text']}"
        for chunk in all_chunks[:5]
    )
    llm = get_chat_model(model_name)
    rag_chain = rag_prompt | llm | StrOutputParser()
    answer = rag_chain.invoke({
        "context": context,
        "question": question
    })
    sources = [
        {"filename": c["filename"], "page": c["page"], "text": c["text"]}
        for c in all_chunks[:5]
    ]
    return {
        "question": question,
        "generated_queries": queries,
        "answer": answer,
        "sources": sources
    }

