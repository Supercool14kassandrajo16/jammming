import React from 'react';
import Tracklist from './Tracklist';

function Playlist({ playlistName, playlistTracks, onRemove, onNameChange, onSave }) {
  return (
    <div>
      <input 
        className="playlist-name-input"
        value={playlistName} 
        onChange={(e) => onNameChange(e.target.value)} 
      />
      <Tracklist 
        tracks={playlistTracks} 
        onRemove={onRemove} 
        isRemoval={true} 
      />
      <button onClick={onSave}>Save to Spotify</button>
    </div>
  );
}

export default Playlist;

