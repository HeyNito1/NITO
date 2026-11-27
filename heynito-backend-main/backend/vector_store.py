# import os
# import chromadb

# CHROMA_DB_PATH = os.getenv(
#     "CHROMA_DB_PATH",
#     "./chroma_db"
# )

# client = chromadb.PersistentClient(
#     path=CHROMA_DB_PATH
# )
# collection = client.get_or_create_collection(
#     name="heynito_documents"
# )

# # user ki files stored with user id --- so other user cant access other user's pdfs 
# def store_chunks(chunks, embeddings, filename: str, user_id: str):
#     # Sirf isi user ki same filename wali purani entries delete hongi
#     collection.delete(
#         where={
#             "$and": [
#                 {"user_id": user_id},
#                 {"filename": filename}
#             ]
#         }
#     )

#     collection.add(
#         ids=[
#             f"{user_id}_{filename}_{i}"
#             for i in range(len(chunks))
#         ],
#         documents=[chunk["text"] for chunk in chunks],
#         embeddings=embeddings.tolist(),
#         metadatas=[
#             {
#                 "user_id": user_id,
#                 "filename": filename,
#                 "chunk_index": i,
#                 "page": chunk["page"]
#             }
#             for i, chunk in enumerate(chunks)
#         ]
#     )


# def search_chunks( query_embedding, user_id: str, n_results: int = 3, filename: str | None = None ):
#     # Search sirf logged-in user ke documents mein hogi
#     filters = {"user_id": user_id}

#     if filename:
#         filters = {
#             "$and": [
#                 {"user_id": user_id},
#                 {"filename": filename}
#             ]
#         }

#     total = len(
#         collection.get(
#             where=filters,
#             include=[]
#         )["ids"]
#     )

#     if total == 0:
#         return []

#     results = collection.query(
#         query_embeddings=[query_embedding.tolist()],
#         n_results=min(n_results, total),
#         where=filters,
#         include=["documents", "metadatas"]
#     )

#     return [
#         {
#             "text": doc,
#             "user_id": metadata["user_id"],
#             "filename": metadata["filename"],
#             "chunk_index": metadata["chunk_index"],
#             "page": metadata["page"]
#         }
#         for doc, metadata in zip(
#             results["documents"][0],
#             results["metadatas"][0]
#         )
#     ]

from datetime import datetime, timezone
from uuid import uuid4
from math import fsum

from pymongo import ASCENDING

from backend.mongodb import document_chunks


def store_chunks(
    chunks,
    embeddings,
    filename: str,
    user_id: str
):
    if not chunks:
        raise ValueError("No document chunks found")

    if len(chunks) != len(embeddings):
        raise ValueError("Embedding count mismatch")

    upload_id = str(uuid4())
    now = datetime.now(timezone.utc)

    records = [
        {
            "user_id": user_id,
            "filename": filename,
            "upload_id": upload_id,
            "chunk_index": i,
            "page": chunk["page"],
            "text": chunk["text"],
            "embedding": [
                float(value)
                for value in embeddings[i]
            ],
            "created_at": now
        }
        for i, chunk in enumerate(chunks)
    ]

    try:
        document_chunks.insert_many(records)

    except Exception:
        document_chunks.delete_many({
            "user_id": user_id,
            "upload_id": upload_id
        })
        raise

    # Remove previous versions of the same file
    document_chunks.delete_many({
        "user_id": user_id,
        "filename": filename,
        "upload_id": {"$ne": upload_id},
        "created_at": {"$lt": now}
    })


def search_chunks(
    query_embedding,
    user_id: str,
    n_results: int = 3,
    filename: str | None = None
):
    filters = {"user_id": user_id}

    if filename:
        filters["filename"] = filename

    query_vector = [
        float(value)
        for value in query_embedding
    ]

    ranked_results = []

    records = document_chunks.find(filters)

    for record in records:

        vector = record["embedding"]

        if len(vector) != len(query_vector):
            continue

        # Squared Euclidean distance
        distance = fsum(
            (a - b) ** 2
            for a, b in zip(query_vector, vector)
        )

        ranked_results.append((distance, record))

    ranked_results.sort(key=lambda item: item[0])

    return [
        {
            "text": record["text"],
            "user_id": record["user_id"],
            "filename": record["filename"],
            "chunk_index": record["chunk_index"],
            "page": record["page"]
        }
        for _, record in ranked_results[:n_results]
    ]
