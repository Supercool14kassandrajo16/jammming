import React from 'react';
import Tracklist from './Tracklist';

function SearchResults({ searchResults, onAdd }) {
  return (
    <div>
      <h2>Search Results</h2>
      <Tracklist tracks={searchResults} onAdd={onAdd} />
    </div>
  );
}

export default SearchResults;


