from vector_store import collection

print("Total chunks:", collection.count())

data = collection.get(
    include=["documents", "metadatas"]
)

print(data)