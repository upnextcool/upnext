/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Member, Party, PlaylistEntry, PlaylistHistory } from '../models';
import { PartyStateOutput } from './output';
import { AuthService, FullArtist, PartyService, UpNextService } from '../services';
import {
  Album,
  FeaturedPlaylists,
  Playlist as PlaylistObject,
  RecommendationsResponse,
  SearchResultAll,
  Track
} from '../spotify';
import { Context } from '../types';
import { PlayerEventPayload, QueueEventPayload, Topic } from '../pubsub/pubsub';
import GraphQLJSON from 'graphql-type-json';
import {
  Arg,
  Authorized,
  Ctx,
  Mutation,
  PubSub,
  Query,
  Resolver,
  ResolverFilterData,
  Subscription,
  PubSubEngine,
  Root
} from 'type-graphql';
import { Service } from 'typedi';

// Only deliver events to subscribers that belong to the party the event
// happened in. The subscription context comes from the websocket onConnect
// handler, which validates the member token.
const samePartyFilter = ({
  payload,
  context,
}: ResolverFilterData<{ partyId: string }, unknown, Context>): boolean =>
  !!context?.party && payload.partyId === context.party.id;

@Service()
@Resolver()
export class UpNextResolver {

  constructor(
    private readonly _upNextService: UpNextService,
    private readonly _authService: AuthService,
    private readonly _partyService: PartyService
  ) {
  }


  @Mutation(() => String)
  async startAuth(
    @Arg('userId') userId: string,
    @Arg('partyId') partyId: string
  ): Promise<string> {
    return this._authService.startAuthGetRedirectUrl(
      userId,
      partyId
    );
  }

  @Query(
    () => Party,
    { nullable: true }
  )
  async checkForMembership(@Arg('userId') userId: string): Promise<Party | null> {
    return this._upNextService.checkForMembership(userId);
  }

  @Query(() => Boolean)
  @Authorized()
  async validToken(@Ctx() context: Context): Promise<boolean> {
    return !!context.member;
  }

  @Query(() => [ Member ])
  @Authorized()
  async members(@Ctx() context: Context): Promise<Array<Member>> {
    return this._partyService.getMembersFor(context.party);
  }

  @Query(() => [ PlaylistHistory ])
  @Authorized()
  async history(@Ctx() context: Context): Promise<Array<PlaylistHistory>> {
    return this._partyService.getHistoryFor(context.party);
  }

  @Query(() => Party)
  @Authorized()
  async party(@Ctx() context: Context): Promise<Party> {
    return this._partyService.getById(context.party.id);
  }

  @Query(() => GraphQLJSON)
  @Authorized()
  async spotifyRecommendations(@Ctx() context: Context): Promise<{
    recommendedPlaylists: FeaturedPlaylists;
    recommendedTracks: RecommendationsResponse;
  }> {
    return this._upNextService.getRecommendations(context.party);
  }

  @Query(
    () => PartyStateOutput, { nullable: true }
  )
  @Authorized()
  async partyState(@Ctx() context: Context): Promise<PartyStateOutput | null> {
    return this._upNextService.getPartyState(context.party);
  }

  @Mutation(() => String)
  async joinParty(
    @Arg('partyCode') partyCode: string,
    @Arg('username') username: string,
    @Arg('userId') userId: string
  ): Promise<string> {
    return this._upNextService.joinParty(
      partyCode,
      username,
      userId
    );
  }

  @Mutation(() => String)
  async leaveParty(@Arg('userId') userId: string): Promise<string> {
    await this._upNextService.leaveParty(userId);
    return userId;
  }

  @Query(() => GraphQLJSON)
  @Authorized()
  async spotifySong(
    @Ctx() context: Context,
    @Arg('songId') songId: string,
  ): Promise<Track> {
    return this._upNextService.getSpotifySong(
      context.party,
      songId
    );
  }

  @Query(() => GraphQLJSON)
  @Authorized()
  async spotifyPlaylist(
    @Ctx() context: Context,
    @Arg('playlistId') playlistId: string,
  ): Promise<PlaylistObject> {
    return this._upNextService.getSpotifyPlaylist(
      context.party,
      playlistId
    );
  }

  @Query(() => GraphQLJSON)
  @Authorized()
  async spotifyAlbum(
    @Ctx() context: Context,
    @Arg('albumId') albumId: string,
  ): Promise<Album> {
    return this._upNextService.getSpotifyAlbum(
      context.party,
      albumId
    );
  }

  @Query(() => GraphQLJSON)
  @Authorized()
  async spotifyArtist(
    @Ctx() context: Context,
    @Arg('artistId') artistId: string,
  ): Promise<FullArtist> {
    return this._upNextService.getSpotifyArtist(
      context.party,
      artistId
    );
  }

  @Query(() => GraphQLJSON)
  @Authorized()
  async spotifySearch(
    @Ctx() context: Context,
    @Arg('query') query: string,
  ): Promise<SearchResultAll> {
    return this._upNextService.searchSpotify(
      context.party,
      query
    );
  }

  @Query(() => [ PlaylistEntry ])
  @Authorized()
  async queue(@Ctx() context: Context): Promise<Array<PlaylistEntry>> {
    return this._partyService.getPlaylistFor(context.party);
  }

  @Mutation(() => String)
  @Authorized()
  async addToQueue(
    @Ctx() context: Context,
    @Arg('songId') songId: string,
    @PubSub() pubSub: PubSubEngine
  ): Promise<string> {
    const entry = await this._upNextService.addToPlaylist(
      context.party,
      context.member,
      songId
    );

    await pubSub.publish(Topic.QUEUE_NEW_SONG, {
      entry,
      partyId: context.party.id,
    });

    return songId;
  }

  @Mutation(() => PlaylistEntry)
  @Authorized()
  async upvote(
    @Ctx() context: Context,
    @Arg('entryId') entryId: string,
    @PubSub() pubSub: PubSubEngine
  ): Promise<PlaylistEntry> {
    const entry = await this._upNextService.upvote(
      context.member,
      entryId
    );
    await pubSub.publish(Topic.QUEUE_UPVOTE, {
      entry,
      partyId: context.party.id,
    });

    return entry;
  }

  @Mutation(() => PlaylistEntry)
  @Authorized()
  async downvote(
    @Ctx() context: Context,
    @Arg('entryId') entryId: string,
    @PubSub() pubSub: PubSubEngine
  ): Promise<PlaylistEntry> {
    const entry = await this._upNextService.downvote(
      context.member,
      entryId
    );

    await pubSub.publish(Topic.QUEUE_DOWNVOTE, {
      entry,
      partyId: context.party.id,
    });

    return entry;
  }

  // Subscriptions
  @Subscription(() => PlaylistEntry, {
    filter: samePartyFilter,
    topics: Topic.QUEUE_NEW_SONG
  })
  newSongInQueue(
    @Root() payload: QueueEventPayload,
  ): PlaylistEntry {
    return payload.entry;
  }

  @Subscription(() => PlaylistEntry, {
    filter: samePartyFilter,
    topics: Topic.QUEUE_REMOVE_SONG
  })
  removeSongFromQueue(
    @Root() payload: QueueEventPayload,
  ): PlaylistEntry {
    return payload.entry;
  }


  @Subscription(() => PlaylistEntry, {
    filter: samePartyFilter,
    topics: Topic.QUEUE_UPVOTE
  })
  queueUpvote(
    @Root() payload: QueueEventPayload,
  ): PlaylistEntry {
    return payload.entry;
  }

  @Subscription(() => PlaylistEntry, {
    filter: samePartyFilter,
    topics: Topic.QUEUE_DOWNVOTE
  })
  queueDownvote(
    @Root() payload: QueueEventPayload,
  ): PlaylistEntry {
    return payload.entry;
  }

  @Subscription(() => PartyStateOutput, {
    filter: samePartyFilter,
    topics: Topic.PLAYER_PAUSED
  })
  playerPaused(
    @Root() payload: PlayerEventPayload,
  ): PartyStateOutput {
    return payload.state;
  }

  @Subscription(() => PartyStateOutput, {
    filter: samePartyFilter,
    topics: Topic.PLAYER_PLAYED
  })
  playerPlayed(
    @Root() payload: PlayerEventPayload,
  ): PartyStateOutput {
    return payload.state;
  }
}
