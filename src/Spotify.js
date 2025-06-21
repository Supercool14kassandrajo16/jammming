// Spotify.js

// --- Configuration ---
const clientId = '9a8c11d1a028496494614b3399233a78';  
const redirectUri = 'http://127.0.0.1:3000/';

// --- PKCE Utility Functions ---

// 1. Generate random string for code verifier
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint8Array(length);
  window.crypto.getRandomValues(values);
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// 2. Hash code verifier using SHA256
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

// 3. Base64 encode and make URL safe
function base64encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// 4. Generate PKCE Code Challenge
async function generateCodeChallenge(codeVerifier) {
  const hashed = await sha256(codeVerifier);
  return base64encode(hashed);
}

// --- Redirect to Spotify Authorization ---

export async function redirectToSpotifyAuthorize() {
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store verifier for later token exchange
  localStorage.setItem('code_verifier', codeVerifier);

  const state = generateRandomString(16);
  const scope = 'playlist-modify-public playlist-modify-private';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    state: state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });

  // Redirect browser to Spotify Auth page
  window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// --- Exchange Authorization Code for Access Token ---

export async function getAccessToken() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) {
    return null;
  }

  const codeVerifier = localStorage.getItem('code_verifier');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body
  });

  const data = await response.json();
  const accessToken = data.access_token;
  localStorage.setItem('access_token', accessToken);
  return accessToken;
}

// ---Spotify Search---
export async function searchTracks(searchTerm, accessToken) {
  const encodedTerm = encodeURIComponent(searchTerm);
  const endpoint = `https://api.spotify.com/v1/search?q=${encodedTerm}&type=track&limit=10`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Spotify search failed: ${response.status}`);
  }

  const data = await response.json();

  // Transform data into simpler array
  return data.tracks.items.map(track => ({
    id: track.id,
    name: track.name,
    artist: track.artists[0].name,
    album: track.album.name,
    uri: track.uri
  }));
}

//---Save Playlist---
export async function savePlaylist(playlistName, trackUris, accessToken) {
  if (!playlistName || !trackUris.length) {
    return;
  }

  // 1️⃣ Get user ID
  const userResponse = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const userData = await userResponse.json();
  const userId = userData.id;

  // 2️⃣ Create new playlist
  const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: playlistName,
      description: 'Created with Jammming!',
      public: false
    })
  });
  const playlistData = await playlistResponse.json();
  const playlistId = playlistData.id;

  // 3️⃣ Add tracks to playlist
  await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uris: trackUris
    })
  });

  console.log('✅ Playlist successfully saved!');
}
