import React from 'react';
import { Form, Image, Badge } from 'react-bootstrap';

const MovieSelection = ({ 
  movies, 
  selectedMovie, 
  value, 
  onChange, 
  disabled 
}) => {
  // Fallback image
  const fallbackImage = "https://via.placeholder.com/120x180/e0e0e0/808080?text=No+Image";

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Chọn Phim</Form.Label>
        <Form.Select 
          name="movie_id" 
          value={value} 
          onChange={onChange}
          disabled={disabled}
        >
          <option value="">-- Chọn Phim --</option>
          {movies.map(movie => (
            <option key={movie.id} value={movie.id}>
              {movie.name} ({movie.duration} phút)
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      
      {selectedMovie && (
        <div className="mb-4">
          <div className="d-flex">
            <div className="me-3">
              <Image 
                src={selectedMovie.img || fallbackImage} 
                alt={selectedMovie.name}
                onError={(e) => { e.target.src = fallbackImage; }}
                style={{ width: '120px', height: '180px', objectFit: 'cover' }}
                thumbnail
              />
            </div>
            <div>
              <h5>{selectedMovie.name}</h5>
              <p className="mb-1">
                <span className="badge bg-secondary me-1">{selectedMovie.genre}</span>
                <span className="badge bg-info">{selectedMovie.label}</span>
              </p>
              <p className="mb-1"><small><strong>Thời lượng:</strong> {selectedMovie.duration} phút</small></p>
              <p className="small text-muted">{selectedMovie.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MovieSelection;