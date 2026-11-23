import chromadb

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(
    name="heynito_documents"
)

# user ki files stored with user id --- so other user cant access other user's pdfs 
def store_chunks(chunks, embeddings, filename: str, user_id: str):
    # Sirf isi user ki same filename wali purani entries delete hongi
    collection.delete(
        where={
            "$and": [
                {"user_id": user_id},
                {"filename": filename}
            ]
        }
    )

    collection.add(
        ids=[
            f"{user_id}_{filename}_{i}"
            for i in range(len(chunks))
        ],
        documents=[chunk["text"] for chunk in chunks],
        embeddings=embeddings.tolist(),
        metadatas=[
            {
                "user_id": user_id,
                "filename": filename,
                "chunk_index": i,
                "page": chunk["page"]
            }
            for i, chunk in enumerate(chunks)
        ]
    )


def search_chunks( query_embedding, user_id: str, n_results: int = 3, filename: str | None = None ):
    # Search sirf logged-in user ke documents mein hogi
    filters = {"user_id": user_id}

    if filename:
        filters = {
            "$and": [
                {"user_id": user_id},
                {"filename": filename}
            ]
        }

    total = len(
        collection.get(
            where=filters,
            include=[]
        )["ids"]
    )

    if total == 0:
        return []

    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=min(n_results, total),
        where=filters,
        include=["documents", "metadatas"]
    )

    return [
        {
            "text": doc,
            "user_id": metadata["user_id"],
            "filename": metadata["filename"],
            "chunk_index": metadata["chunk_index"],
            "page": metadata["page"]
        }
        for doc, metadata in zip(
            results["documents"][0],
            results["metadatas"][0]
        )
    ]