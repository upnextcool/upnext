import gql from 'graphql-tag';

export const NEW_SONG_IN_QUEUE = gql`
  subscription newSongInQueue {
    newSongInQueue {
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

export const REMOVE_SONG_FROM_QUEUE = gql`
  subscription removeSongFromQueue {
    removeSongFromQueue {
      id
    }
  }
`;

export const QUEUE_UPVOTE = gql`
  subscription queueUpvote {
    queueUpvote {
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

export const QUEUE_DOWNVOTE = gql`
  subscription queueDownvote {
    queueDownvote {
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

export const PLAYER_PAUSED = gql`
  subscription playerPaused {
  playerPaused {
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

export const PLAYER_PLAYED = gql`
  subscription playerPlayed {
    playerPlayed {
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
