import json
import numpy as np
import os
from typing import List, Dict, Any, Union, Tuple
import faiss
import pickle
from pathlib import Path
from sentence_transformers import SentenceTransformer

class VectorStore:
    """
    Manages the creation, storage and retrieval of text embeddings for health and nutrition information.
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", dimension: int = 384,
                 index_path: str = None, vectors_path: str = None, metadata_path: str = None):
        """
        Initialize the vector store.
        
        Args:
            model_name: Name of the SentenceTransformer model to use
            dimension: Dimension of embeddings produced by the model
            index_path: Path to load/save the FAISS index
            vectors_path: Path to load/save the vectors as numpy array
            metadata_path: Path to load/save the metadata
        """
        self.model_name = model_name
        self.dimension = dimension
        self.index_path = index_path
        self.vectors_path = vectors_path
        self.metadata_path = metadata_path
        
        # Initialize the model for embedding generation
        try:
            self.model = SentenceTransformer(model_name)
        except Exception as e:
            print(f"Error loading embedding model: {e}")
            print("Proceeding without embedding capability. Load embeddings from disk or initialize model later.")
            self.model = None
        
        # Initialize FAISS index
        self.index = faiss.IndexFlatL2(dimension)
        self.vectors = None
        self.metadata = []
        
        # Load existing data if paths are provided and files exist
        if all([index_path, vectors_path, metadata_path]) and \
           all([os.path.exists(p) for p in [index_path, vectors_path, metadata_path]]):
            self.load()
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """
        Generate an embedding vector for a text string.
        
        Args:
            text: Input text to embed
            
        Returns:
            Numpy array containing the embedding vector
        """
        if self.model is None:
            raise ValueError("Embedding model not initialized")
        
        # Generate embedding and normalize
        embedding = self.model.encode(text)
        return embedding.reshape(1, -1).astype('float32')
    
    def add_texts(self, texts: List[str], metadatas: List[Dict[str, Any]] = None) -> List[int]:
        """
        Add multiple texts to the vector store.
        
        Args:
            texts: List of text strings to embed and store
            metadatas: List of metadata dictionaries for each text
            
        Returns:
            List of indices for the added vectors
        """
        if not texts:
            return []
        
        if metadatas is None:
            metadatas = [{} for _ in texts]
        
        # Generate embeddings for all texts
        embeddings = np.vstack([self.generate_embedding(text) for text in texts])
        
        # Get current count to return as starting index
        current_count = self.index.ntotal
        
        # Add to index
        self.index.add(embeddings)
        
        # Store vectors if we are tracking them
        if self.vectors is None:
            self.vectors = embeddings
        else:
            self.vectors = np.vstack([self.vectors, embeddings])
        
        # Store metadata
        for i, metadata in enumerate(metadatas):
            metadata['text'] = texts[i]
            metadata['id'] = current_count + i
            self.metadata.append(metadata)
        
        return list(range(current_count, current_count + len(texts)))
    
    def similarity_search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """
        Search for texts similar to the query.
        
        Args:
            query: Query text
            k: Number of results to return
            
        Returns:
            List of dictionaries containing similar texts and their metadata
        """
        if self.index.ntotal == 0:
            return []
        
        # Generate query embedding
        query_embedding = self.generate_embedding(query)
        
        # Search index
        distances, indices = self.index.search(query_embedding, k)
        
        # Format results
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.metadata):  # Safety check
                result = self.metadata[idx].copy()
                result['distance'] = float(distances[0][i])
                results.append(result)
        
        return results
    
    def add_from_chunks(self, chunks: List[Dict[str, Any]]) -> List[int]:
        """
        Add chunks from a chunked book to the vector store.
        
        Args:
            chunks: List of chunk dictionaries with 'content' and other metadata
            
        Returns:
            List of indices for the added vectors
        """
        texts = [chunk['content'] for chunk in chunks]
        return self.add_texts(texts, metadatas=chunks)
    
    def load_chunks_from_file(self, file_path: str) -> List[int]:
        """
        Load chunks from a JSON file and add them to the vector store.
        
        Args:
            file_path: Path to JSON file containing chunks
            
        Returns:
            List of indices for the added vectors
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            chunks = json.load(f)
        
        return self.add_from_chunks(chunks)
    
    def save(self, index_path: str = None, vectors_path: str = None, metadata_path: str = None):
        """
        Save the vector store to disk.
        
        Args:
            index_path: Path to save the FAISS index
            vectors_path: Path to save the vectors as numpy array
            metadata_path: Path to save the metadata
        """
        # Use provided paths or instance paths
        index_path = index_path or self.index_path
        vectors_path = vectors_path or self.vectors_path
        metadata_path = metadata_path or self.metadata_path
        
        if not all([index_path, vectors_path, metadata_path]):
            raise ValueError("All paths must be specified for saving")
        
        # Create directories if they don't exist
        for path in [index_path, vectors_path, metadata_path]:
            os.makedirs(os.path.dirname(path), exist_ok=True)
        
        # Save FAISS index
        faiss.write_index(self.index, index_path)
        
        # Save vectors
        if self.vectors is not None:
            np.save(vectors_path, self.vectors)
        
        # Save metadata
        with open(metadata_path, 'wb') as f:
            pickle.dump(self.metadata, f)
        
        print(f"Vector store saved with {self.index.ntotal} entries")
    
    def load(self, index_path: str = None, vectors_path: str = None, metadata_path: str = None):
        """
        Load the vector store from disk.
        
        Args:
            index_path: Path to load the FAISS index
            vectors_path: Path to load the vectors as numpy array
            metadata_path: Path to load the metadata
        """
        # Use provided paths or instance paths
        index_path = index_path or self.index_path
        vectors_path = vectors_path or self.vectors_path
        metadata_path = metadata_path or self.metadata_path
        
        if not all([index_path, vectors_path, metadata_path]):
            raise ValueError("All paths must be specified for loading")
        
        # Check if files exist
        if not all([os.path.exists(p) for p in [index_path, vectors_path, metadata_path]]):
            missing = [p for p in [index_path, vectors_path, metadata_path] if not os.path.exists(p)]
            raise FileNotFoundError(f"Missing files: {missing}")
        
        # Load FAISS index
        self.index = faiss.read_index(index_path)
        
        # Load vectors
        self.vectors = np.load(vectors_path)
        
        # Load metadata
        with open(metadata_path, 'rb') as f:
            self.metadata = pickle.load(f)
        
        print(f"Vector store loaded with {self.index.ntotal} entries")

if __name__ == "__main__":
    # Example usage
    vector_store = VectorStore(
        index_path="data/faiss_index.idx",
        vectors_path="data/vectors.npy",
        metadata_path="data/metadata.pkl"
    )
    
    # Load chunks and create embeddings
    vector_store.load_chunks_from_file("C:/Users/Divya/Downloads/health_o_meter/data/book_chunks.json")
    
    # Save to disk
    vector_store.save()
    
    # Perform a search
    results = vector_store.similarity_search("nutrition requirements for diabetes")
    for result in results:
        print(f"Score: {1 - result['distance']:.4f} | {result['content'][:100]}...")