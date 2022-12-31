import gql from "graphql-tag";

export const REGISTER_FINGERPRINT = gql`
  mutation ($fingerprint: String!) {
    user: registerFingerprint(fingerprint: $fingerprint) {
      id
      fingerprint
    }
  }
`;

export const START_PARTY = gql`
  mutation ($partyName: String!) {
    party: startParty(partyName: $partyName) {
      id
      code
      name
      createdAt
      spotifyPlaylistId
    }
  }
`;

export const START_AUTH = gql`
  mutation ($userId: String!, $partyId: String!) {
    url: startAuth(userId: $userId, partyId: $partyId)
  }
`;

export const JOIN_PARTY = gql`
  mutation ($username: String!, $partyCode: String!, $userId: String!) {
    token: joinParty(
      username: $username
      partyCode: $partyCode
      userId: $userId
    )
  }
`;

export const LEAVE_PARTY = gql`
  mutation ($userId: String!) {
    party: leaveParty(userId: $userId)
  }
`;

export const ADD_TO_QUEUE = gql`
  mutation ($songId: String!) {
    addToQueue(songId: $songId)
  }
`;

export const UPVOTE_SONG = gql`
  mutation ($entryId: String!) {
    upvote(entryId: $entryId) {
      id
      name
      votes {
        id
        type
        member {
          id
          username
        }
      }
      addedAt
      addedBy {
        id
        username
      }
      spotifyId
      albumArtwork
      artist
    }
  }
`;

export const DOWNVOTE_SONG = gql`
  mutation ($entryId: String!) {
    downvote(entryId: $entryId) {
      id
      name
      votes {
        id
        type
        member {
          id
          username
        }
      }
      addedAt
      addedBy {
        id
        username
      }
      spotifyId
      albumArtwork
      artist
    }
  }
`;
