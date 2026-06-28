/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Member, Party, PlaylistEntry } from '../models';
import { PartyService } from '../services';
import { Context } from '../types';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, ResolverInterface, Root } from 'type-graphql';
import { Service } from 'typedi';

@Service()
@Resolver(() => Party)
export class PartyResolver implements ResolverInterface<Party>{

  constructor(private readonly _partyService: PartyService) {}

  @Query(() => Party)
  async partyById(@Arg('id') id: string): Promise<Party> {
    return this._partyService.getById(id);
  }

  @Query(() => Party)
  async partyByCode(@Arg('code') code: string): Promise<Party> {
    return this._partyService.getByCode(code);
  }

  @FieldResolver(() => [ Member ])
  async members (@Root() party: Party, @Ctx() ctx: Context): Promise<Array<Member>> {
    return ctx?.loaders?.membersByPartyId?.load(party.id) ?? this._partyService.getMembersFor(party);
  }

  @FieldResolver(() => [ PlaylistEntry ])
  async playlist(@Root() party: Party, @Ctx() ctx: Context): Promise<Array<PlaylistEntry>> {
    return ctx?.loaders?.playlistByPartyId?.load(party.id) ?? this._partyService.getPlaylistFor(party);
  }

  @Mutation(() => Party)
  async startParty(@Arg('partyName') partyName: string): Promise<Party> {
    return this._partyService.createParty(partyName);
  }
}
