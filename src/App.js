import React, { useState, useEffect } from 'react';
import SearchResults from './SearchResults'; 
import Playlist from './Playlist';
import SearchBar from './SearchBar';
import { getAccessToken, redirectToSpotifyAuthorize, searchTracks, savePlaylist } from './Spotify';

function App() {
  // State for playlist name and tracks
  const [playlistName, setPlaylistName] = useState('My Favorite Jams');
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [accessToken, setAccessToken] = useState(null);

  // Load access token when component mounts
  useEffect(() => {
    async function fetchToken() {
      const token = await getAccessToken();
      if (token) {
        setAccessToken(token);
      }
    }
    fetchToken();
  }, []);

  // Add track to playlist
  function addTrack(track) {
    if (playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return; // prevent duplicates
    }
    setPlaylistTracks(prevTracks => [...prevTracks, track]);
  }

  // Remove track from playlist
  function removeTrack(track) {
    setPlaylistTracks(prevTracks => prevTracks.filter(savedTrack => savedTrack.id !== track.id));
  }

  // Update playlist name
  function updatePlaylistName(name) {
    setPlaylistName(name);
  }

  // Handle search request
  async function handleSearch(searchTerm) {
    try {
      const results = await searchTracks(searchTerm, accessToken);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }

  // Handle save playlist
function handleSavePlaylist() {
  if (!playlistTracks.length) return;

  const trackURIs = playlistTracks.map(track => track.uri);
  savePlaylist(playlistName, trackURIs, accessToken);

  // 🎯 Reset playlist after saving
  setPlaylistName('New Playlist');
  setPlaylistTracks([]);
}


return (
  <div>
    <h2>Jammming 🎵</h2>

    {!accessToken ? (
      <div className="login-container">
  <button className="spotify-button" onClick={redirectToSpotifyAuthorize}>
    Login with Spotify
  </button>
</div>

    ) : (
      <>
        <div className="container">
          <div className="section">
            <SearchBar onSearch={handleSearch} />
            <SearchResults searchResults={searchResults} onAdd={addTrack} />
          </div>

          <div className="section">
            <Playlist 
              playlistName={playlistName} 
              playlistTracks={playlistTracks} 
              onRemove={removeTrack} 
              onNameChange={updatePlaylistName} 
              onSave={handleSavePlaylist}
            />
          </div>
        </div>
      </>
    )}
  </div>
);
}

export default App;

