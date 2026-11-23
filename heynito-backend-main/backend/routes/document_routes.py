
from fastapi import APIRouter, UploadFile, File, HTTPException
from pypdf import PdfReader
from io import BytesIO
import logging

from backend.rag import extract_structured_data_from_doc

from backend.chunking import split_text_into_chunks
from backend.embeddings import generate_embeddings
from backend.vector_store import store_chunks
from backend.rag import ask_from_documents_multi_query

from pydantic import BaseModel, Field
from backend.rag import ask_from_documents, compare_documents
from fastapi import Depends
from backend.auth import get_current_user

router = APIRouter()

# page wise made  -- chunks ke saath original page number stored
@router.post("/documents/upload")
async def upload_document( file: UploadFile = File(...), user_id: str = Depends(get_current_user) ): 
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    try:
        content = await file.read()
        reader = PdfReader(BytesIO(content))

        pages = [
            {"page": i + 1, "text": page.extract_text() or ""}
            for i, page in enumerate(reader.pages)
        ]

        if not any(page["text"].strip() for page in pages):
            raise HTTPException(
                status_code=400,
                detail="No extractable text found in PDF"
            )

        chunks = split_text_into_chunks(pages)

        chunk_texts = [chunk["text"] for chunk in chunks]
        embeddings = generate_embeddings(chunk_texts)

        store_chunks( chunks, embeddings, file.filename, user_id )

        return {
            "filename": file.filename,
            "pages": len(reader.pages),
            "chunks_count": len(chunks)
        }

    except HTTPException:
        raise
    except Exception:
        logging.exception("PDF upload failed")
        raise HTTPException(
            status_code=400,
            detail="Could not read PDF"
        )



class QuestionRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    filename: str | None = None

@router.post("/documents/ask")
def ask_document( request: QuestionRequest, user_id: str = Depends(get_current_user) ):
    try:
        return ask_from_documents(request.question.strip() , user_id=user_id , filename=request.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) # agr upr se hi error raise kiyaa gyaa 
    except Exception as e:  
        logging.exception("RAG endpoint failed")
        raise HTTPException(
            status_code=502,
            detail=str(e)
        )


class CompareRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    filenames: list[str] = Field(min_length=2, max_length=5)


#User 2–5 PDFs ke filenames send ,  Backend existing RAG retrieval use karega.
@router.post("/documents/compare")
def compare_document_endpoint( request: CompareRequest, user_id: str = Depends(get_current_user) ):
    try:
        filenames = list(dict.fromkeys(
            name.strip() for name in request.filenames if name.strip()
        ))

        if len(filenames) < 2:
            raise HTTPException(
                status_code=400,
                detail="Provide at least 2 different PDF filenames."
            )

        return compare_documents( request.question.strip(), filenames, user_id=user_id )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logging.exception("PDF comparison failed")
        raise HTTPException(
            status_code=502,
            detail="Could not compare documents."
        )



@router.post("/documents/extract")
async def extract_document( file: UploadFile = File(...), user_id: str = Depends(get_current_user) ):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException( status_code=400,
            detail="Only PDF files are allowed" )

    try:
        content = await file.read()
        reader = PdfReader(BytesIO(content))

        context_text = "\n\n".join(
            page.extract_text() or ""
            for page in reader.pages
        )

        if not context_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No extractable text found in PDF"
            )

        result = extract_structured_data_from_doc(context_text)

        return {
            "filename": file.filename,
            "extracted_data": result
        }

    except HTTPException:
        raise
    except Exception:
        logging.exception("Document extraction failed")
        raise HTTPException(
            status_code=500,
            detail="Document extraction failed"
        )


@router.post("/documents/ask-advanced")
def ask_document_advanced(request: QuestionRequest, user_id: str = Depends(get_current_user)):
    try:
        return ask_from_documents_multi_query(
            question=request.question.strip(), 
            user_id=user_id, 
            filename=request.filename
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

