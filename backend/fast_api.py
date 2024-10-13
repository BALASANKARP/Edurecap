from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from pydantic import BaseModel
import whisper
import uvicorn
import nest_asyncio
import tempfile
import os
from groq import Groq, GroqError
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
import faiss
import numpy as np

# Apply the asyncio patch
nest_asyncio.apply()

# Initialize FastAPI app
app = FastAPI()

# Load the Whisper model for audio transcription
model = whisper.load_model("base")

# Set up the Groq client with your API key
api_key = os.getenv("GROQ_API_KEY", "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")
client = Groq(api_key=api_key)

# Load pre-trained model and tokenizer for embeddings
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
embedding_model = AutoModel.from_pretrained("distilbert-base-uncased")

# Load pre-trained model for question answering
qa_model = pipeline(
    "question-answering",
    model="distilbert-base-cased-distilled-squad",
    tokenizer="distilbert-base-cased-distilled-squad"
)

# Initialize FAISS index for vector storage and retrieval
vector_size = 768  # Dimension for DistilBERT-based models
index = faiss.IndexFlatL2(vector_size)

# In-memory storage for vectors and associated text
paragraphs = []

# Function to get embeddings from text
def get_embedding(text):
    inputs = tokenizer(text, return_tensors='pt')
    with torch.no_grad():
        outputs = embedding_model(**inputs)
    return outputs.last_hidden_state.mean(1).squeeze().numpy()

# Define the request model using Pydantic
class QueryWithContext(BaseModel):
    paragraph: str
    question: str

# Root endpoint to test if the server is running
@app.get("/")
async def root():
    return {"message": "Hello World"}

# Endpoint to transcribe uploaded audio files
@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Save the uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name
        
        # Transcribe the audio
        result = model.transcribe(temp_file_path)
        transcription_text = result["text"]

        # Clean up the temporary file
        os.remove(temp_file_path)
        
        return {"transcription": transcription_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to summarize the transcription using plain text input
@app.post("/summarize/")
async def summarize_transcription(transcript_text: str = Body(..., media_type="text/plain")):
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": f"summarize this class transcript in 3 lines: {transcript_text}",
                }
            ],
            model="llama3-8b-8192",
        )
        summary = chat_completion.choices[0].message.content
        
        return {"summary": summary}
    except GroqError as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to generate flashcards from transcription summary
@app.post("/flashcards/")
async def generate_flashcards(transcript_text: str = Body(..., media_type="text/plain")):
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": f"from the summary of the transcript generate 3 main takeaways as points for flashcards: {transcript_text}",
                }
            ],
            model="llama3-8b-8192",
        )
        flashcards = chat_completion.choices[0].message.content
        
        return {"flashcards": flashcards}
    except GroqError as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint for question-answering and paragraph storage
@app.post("/chat")
async def chat(query: QueryWithContext):
    global index, paragraphs
    paragraph = query.paragraph
    question = query.question
    
    # Get embedding for the paragraph
    paragraph_embedding = get_embedding(paragraph).astype(np.float32)
    paragraphs.append(paragraph)

    # Add paragraph embedding to FAISS index
    index.add(np.array([paragraph_embedding]))

    # Get embedding for the question
    question_embedding = get_embedding(question).astype(np.float32).reshape(1, -1)
    
    # Search the FAISS index for the most similar paragraph
    distances, indices = index.search(question_embedding, k=1)

    # Retrieve the most relevant paragraph based on the search
    context = paragraphs[indices[0][0]]
    
    # Generate an answer using the QA model
    result = qa_model(question=question, context=context)
    
    # Construct a more descriptive response
    response = {
        "question": question,
        "context": context,
        "answer": result['answer'],
        "explanation": f"The answer to your question '{question}' is based on the context: '{context}'."
    }
    
    return response

# Run the FastAPI server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)  # Change port to 8080
