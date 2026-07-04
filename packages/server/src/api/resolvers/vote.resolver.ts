/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Member, PlaylistEntry, Vote } from '../models';
import { VoteService } from '../services';
import { FieldResolver, Resolver, ResolverInterface, Root } from 'type-graphql';
import { Service } from 'typedi';

@Service()
@Resolver(() => Vote)
export class VoteResolver implements ResolverInterface<Vote> {

  constructor(private readonly _voteService: VoteService) {}

  @FieldResolver(() => Member)
  async member (@Root() vote: Vote): Promise<Member> {
    return vote.member ?? this._voteService.getMemberFor(vote);
  }

  @FieldResolver(() => PlaylistEntry)
  async playlistEntry (@Root() vote: Vote): Promise<PlaylistEntry> {
    return vote.playlistEntry ?? this._voteService.getPlaylistEntryFor(vote);
  }
}
