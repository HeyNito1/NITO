from langchain_text_splitters import RecursiveCharacterTextSplitter


def split_text_into_chunks(pages: list[dict]) -> list[dict]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = []

    for page in pages:
        page_chunks = text_splitter.split_text(page["text"])

        for chunk in page_chunks:
            chunks.append({
                "page": page["page"],  # page reference alsoo returned !!!! 
                "text": chunk,
            })

    return chunks
