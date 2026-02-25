import json
import re
import os
from pathlib import Path
from typing import List, Dict, Any

class BookChunker:
    """
    Processes book content and breaks it into manageable chunks for vector database storage.
    """
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Initialize the BookChunker.
        
        Args:
            chunk_size: Target size (in characters) for each chunk
            chunk_overlap: Number of characters to overlap between chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
    def load_book(self, file_path: str) -> str:
        """
        Load book content from a file.
        
        Args:
            file_path: Path to the book file (txt, pdf, etc.)
            
        Returns:
            The book content as a string
        """
        file_extension = Path(file_path).suffix.lower()
        
        if file_extension == '.txt':
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        elif file_extension == '.pdf':
            # This would require a PDF extraction library like PyPDF2 or pdfplumber
            # For now, we'll just raise an exception
            raise NotImplementedError("PDF parsing not yet implemented")
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
    
# Modify the preprocess_text method in chunk_book.py to ensure paragraphs are detected:
    def preprocess_text(self, text: str) -> str:
        """
        Cleans and prepares text for chunking.
        """
        # Normalize newlines
        text = text.replace('\r\n', '\n')
        
        # Ensure paragraph breaks - replace single newlines with spaces
        # and double+ newlines with standard paragraph break
        text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)  # Single newlines become spaces
        text = re.sub(r'\n{2,}', '\n\n', text)        # Multiple newlines become double newlines
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters that might interfere with processing
        text = re.sub(r'[^\w\s.,;:?!()"\'-]', '', text)
        
        return text.strip()
    def create_chunks(self, text: str) -> List[Dict[str, Any]]:
        """
        Divides text into overlapping chunks.
        
        Args:
            text: Preprocessed book text
            
        Returns:
            List of dictionaries containing chunks and metadata
        """
        chunks = []
        start = 0
        
        # Split text into paragraphs
        paragraphs = text.split('\n\n')
        
        # If there's only one or very few paragraphs, force chunking by character count
        if len(paragraphs) <= 5:
            print(f"Warning: Only {len(paragraphs)} paragraph breaks detected. Forcing chunking by character count.")
            text_length = len(text)
            
            for i in range(0, text_length, self.chunk_size - self.chunk_overlap):
                chunk_start = i
                chunk_end = min(i + self.chunk_size, text_length)
                
                # Find a good break point - prefer sentence endings
                if chunk_end < text_length:
                    # Look for sentence ending within the last 100 characters of the chunk
                    search_area = text[max(chunk_end - 100, chunk_start):chunk_end]
                    sentence_breaks = list(re.finditer(r'[.!?]\s', search_area))
                    
                    if sentence_breaks:
                        # Adjust chunk_end to end at a sentence break
                        last_break = sentence_breaks[-1].end()
                        chunk_end = max(chunk_end - 100, chunk_start) + last_break
                
                chunk_text = text[chunk_start:chunk_end].strip()
                
                chunks.append({
                    "chunk_id": len(chunks),
                    "content": chunk_text,
                    "char_count": len(chunk_text),
                    "start_pos": chunk_start,
                    "end_pos": chunk_end
                })
                
                # Stop if we've reached the end of the text
                if chunk_end >= text_length:
                    break
            
            return chunks
        
        # Standard paragraph-based chunking code
        current_chunk = ""
        chunk_id = 0
        
        for para in paragraphs:
            # If adding this paragraph would exceed chunk size, save current chunk and start a new one
            if len(current_chunk) + len(para) > self.chunk_size and current_chunk:
                chunks.append({
                    "chunk_id": chunk_id,
                    "content": current_chunk.strip(),
                    "char_count": len(current_chunk),
                    "start_pos": start,
                    "end_pos": start + len(current_chunk)
                })
                
                # Start new chunk with overlap
                overlap_start = max(0, len(current_chunk) - self.chunk_overlap)
                current_chunk = current_chunk[overlap_start:] + " " + para
                start = start + overlap_start
                chunk_id += 1
            else:
                # Add paragraph to current chunk
                current_chunk += " " + para if current_chunk else para
        
        # Add the last chunk if there's content left
        if current_chunk:
            chunks.append({
                "chunk_id": chunk_id,
                "content": current_chunk.strip(),
                "char_count": len(current_chunk),
                "start_pos": start,
                "end_pos": start + len(current_chunk)
            })
            
        return chunks
    def process_book(self, file_path: str, output_path: str = None) -> List[Dict[str, Any]]:
        """
        Process a book file into chunks and optionally save to JSON.
        
        Args:
            file_path: Path to the book file
            output_path: Path to save the JSON output (optional)
            
        Returns:
            List of chunks with metadata
        """
        # Extract book filename without extension for metadata
        book_name = os.path.basename(file_path)
        book_name = os.path.splitext(book_name)[0]
        
        # Load and process the book
        text = self.load_book(file_path)
        processed_text = self.preprocess_text(text)
        chunks = self.create_chunks(processed_text)
        
        # Add book metadata to each chunk
        for chunk in chunks:
            chunk["book_name"] = book_name
            chunk["source_file"] = file_path
        
        # Save to JSON if output path is provided
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(chunks, f, indent=2)
            print(f"Saved {len(chunks)} chunks to {output_path}")
        
        return chunks

if __name__ == "__main__":
    # Example usage
    chunker = BookChunker(chunk_size=1500, chunk_overlap=150)
    chunks = chunker.process_book(
        file_path="C:/Users/Divya/Downloads/health_o_meter/Eat, Drink, and Be Healthy_ The Harvard Medical School Guide to Healthy Eating.txt", 
        output_path="C:/Users/Divya/Downloads/health_o_meter/data/book_chunks.json"
    )
    print(f"Created {len(chunks)} chunks")