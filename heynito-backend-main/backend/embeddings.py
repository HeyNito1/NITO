# from sentence_transformers import SentenceTransformer

# model = SentenceTransformer("all-MiniLM-L6-v2")

# def generate_embeddings(chunks: list[str]):
#     return model.encode(chunks)


#  implemented lazy loading. start backend, backend ready, load modal when needed.


from functools import lru_cache


@lru_cache(maxsize=1)
def get_embedding_model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(
        "all-MiniLM-L6-v2",
        device="cpu"
    )


def generate_embeddings(chunks: list[str]):
    model = get_embedding_model()
    return model.encode(chunks)
