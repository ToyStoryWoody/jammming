import SearchBar from "../components/SearchBar/SearchBar";
import TrackList from "../components/TrackList/TrackList";

const clientID = 'bbe5139b0bfc496eb1d97de47e3c0455';
const redirectURI = 'http://enchanting-join.surge.sh/';

let accessToken;

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }
        if (window.location.href.match(/access_token=([^&]*)/) && window.location.href.match(/expires_in=([^&]*)/)) {
            accessToken = window.location.href.match(/access_token=([^&]*)/)[1];
            const expiresIn = window.location.href.match(/expires_in=([^&]*)/)[1];
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
        } else {
            window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`
        }
    },

    search(term) {
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, { headers: {Authorization: `Bearer ${accessToken}`}}).then(response => {
                return response.json();
            }
        ).then(jsonResponse => {
            if(jsonResponse.tracks.items.length === 0) {
                return [];
            } else {
                const tracks = jsonResponse.tracks.items.map(track => {
                    return {
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        album: track.album.name,
                        uri: track.uri
                    }
                });
                return tracks;
            }
        });
    },

    savePlaylist(name, trackURIs) {
        if (!name || !trackURIs || trackURIs.length === 0) return;
        const token = accessToken;
        const headers = { Authorization: `Bearer ${token}`};
        let userID;
        let playlistID;
        
        fetch('https://api.spotify.com/v1/me', {headers: headers}).then(response => response.json()).then(jsonResponse => userID = jsonResponse.id).then(
            () => {
                fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                    headers: headers, 
                    method: 'POST', 
                    body: JSON.stringify({name: name})}).then(response => response.json()).then(jsonResponse => playlistID = jsonResponse.id).then(
                        () => {
                            fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
                                method: 'POST',
                                headers: headers,
                                body: JSON.stringify({uris: trackURIs})
                            });
                        });
            }
        );

        
    }
}

export default Spotify;