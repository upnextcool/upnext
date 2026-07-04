/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Member, Party, PlaylistEntry, Vote } from '../models';
import { PlaylistEntryService } from '../services';
import { Context } from '../types';
import { Ctx, FieldResolver, Resolver, ResolverInterface, Root } from 'type-graphql';
import { Service } from 'typedi';

@Service()
@Resolver(() => PlaylistEntry)
export class PlaylistEntryResolver implements ResolverInterface<PlaylistEntry> {

  constructor(private readonly _playlistEntryService: PlaylistEntryService) {}

  @FieldResolver(() => Member)
  async addedBy (@Root() playlistEntry: PlaylistEntry, @Ctx() ctx: Context): Promise<Member> {
    return playlistEntry.addedBy ??
      ctx?.loaders?.addedByEntryId?.load(playlistEntry.id) ??
      this._playlistEntryService.getAddedByFor(playlistEntry);
  }

  @FieldResolver(() => Party)
  async party (@Root() playlistEntry: PlaylistEntry): Promise<Party> {
    return playlistEntry.party ?? this._playlistEntryService.getPartyFor(playlistEntry);
  }

  @FieldResolver(() => [ Vote ])
  async votes (@Root() playlistEntry: PlaylistEntry, @Ctx() ctx: Context): Promise<Array<Vote>> {
    return playlistEntry.votes ??
      ctx?.loaders?.votesByEntryId?.load(playlistEntry.id) ??
      this._playlistEntryService.getVotesFor(playlistEntry);
  }
}
