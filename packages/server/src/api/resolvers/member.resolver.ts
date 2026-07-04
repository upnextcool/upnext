/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Member, Party, PlaylistEntry, User, Vote } from '../models';
import { MemberService } from '../services';
import { Context } from '../types';
import { Ctx, FieldResolver, Resolver, ResolverInterface, Root } from 'type-graphql';
import { Service } from 'typedi';

@Service()
@Resolver(() => Member)
export class MemberResolver implements ResolverInterface<Member>{

  constructor(private readonly _memberService: MemberService) {}

  @FieldResolver(() => User)
  async user (@Root() member: Member, @Ctx() ctx: Context): Promise<User> {
    return member.user ??
      ctx?.loaders?.userByMemberId?.load(member.id) ??
      this._memberService.getUserFor(member);
  }

  @FieldResolver(() => Party)
  async party (@Root() member: Member): Promise<Party> {
    return member.party ?? this._memberService.getPartyFor(member);
  }

  @FieldResolver(() => [ Vote ])
  async votes (@Root() member: Member): Promise<Array<Vote>> {
    return member.votes ?? this._memberService.getVotesFor(member);
  }

  @FieldResolver(() => [ PlaylistEntry ])
  async playlistEntries (@Root() member: Member): Promise<Array<PlaylistEntry>> {
    return member.playlistEntries ?? this._memberService.getPlaylistEntriesFor(member);
  }
}
