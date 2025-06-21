import React, { useState } from 'react';

function SearchBar({ onSearch }) {
   const [searchTerm, setSearchTerm] = useState('');
     function handleSubmit(e) {
    e.preventDefault();
    onSearch(searchTerm);
  }
  return (
    <div>
      <h2>SearchBar</h2>
        <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Enter song, artist, album..." 
        />
        <button type="submit">Search</button>
        </form>
    </div>
  );
}

export default SearchBar;
