import gql from 'graphql-tag';

export const CONFIG = gql`
  query {
    config {
      version
    }
  }
`;

export const SPOTIFY_RECOMMENDATIONS = gql`
  query {
    recommendations: spotifyRecommendations
  }
`;

export const SPOTIFY_PLAYLIST = gql`
  query ($playlistId: String!) {
    playlist: spotifyPlaylist(playlistId: $playlistId)
  }
`;

export const SPOTIFY_ALBUM = gql`
  query ($albumId: String!) {
    album: spotifyAlbum(albumId: $albumId)
  }
`;

export const SPOTIFY_ARTIST = gql`
  query ($artistId: String!) {
    artist: spotifyArtist(artistId: $artistId)
  }
`;

export const SPOTIFY_SONG = gql`
  query ($songId: String!) {
    song: spotifySong(songId: $songId)
  }
`;

export const PARTY = gql`
  query {
    party {
      id
      code
      name
      createdAt
      spotifyPlaylistId
      members {
        id
        username
        score
      }
      playlist {
        id
        name
        artist
      }
    }
  }
`;

export const HISTORY = gql`
  query {
    history {
      id
      albumArtwork
      name
      artist
      playedAt
      spotifyId
    }
  }
`;

export const QUEUE = gql`
  query {
    queue {
      id
      albumArtwork
      artist
      addedAt
      addedBy {
        id
        username
      }
      name
      party {
        id
        name
      }
      spotifyId
      votes {
        id
        member {
          id
        }
        type
      }
    }
  }
`;

export const SPOTIFY_SEARCH = gql`
  query ($query: String!) {
    spotifySearch(query: $query)
  }
`;

export const VALID_TOKEN = gql`
  query {
    validToken
  }
`;

export const GET_PARTY_STATE = gql`
  query {
    partyState {
      artist
      artwork
      duration
      name
      playing
      progress
      spotifyId
      palette {
        vibrant
        lightVibrant
        darkVibrant
      }
    }
  }
`;

export const USERS_AT_PARTY = gql`
  query {
    members {
      id
      joinedAt
      score
      username
      votes {
        id
        type
        playlistEntry {
          id
          name
          artist
          albumArtwork
          spotifyId
        }
      }
    }
  }
`;

export const PARTY_BY_CODE = gql`
  query ($code: String!) {
    partyByCode(code: $code) {
      code
      name
    }
  }
`;

export const CHECK_FOR_MEMBERSHIP = gql`
  query ($userId: String!) {
    checkForMembership(userId: $userId) {
      code
    }
  }
`;
