/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Member, Party, PlaylistEntry, User, Vote } from '../models';
import DataLoader from 'dataloader';
import { getRepository } from 'typeorm';

/**
 * Per-request DataLoaders. Each GraphQL field resolver used to issue its own
 * `findOne` per parent row, so rendering a queue of N songs cost N queries for
 * votes, N for the adder, and so on (the classic N+1). A DataLoader collects
 * every `.load(id)` made during a single tick and resolves them with one
 * batched query, keyed by parent id.
 *
 * Loaders are created fresh per request (see the GraphQL context) so their
 * cache never leaks between users or goes stale within a request.
 */
export interface Loaders {
  votesByEntryId: DataLoader<string, Array<Vote>>;
  addedByEntryId: DataLoader<string, Member>;
  playlistByPartyId: DataLoader<string, Array<PlaylistEntry>>;
  membersByPartyId: DataLoader<string, Array<Member>>;
  userByMemberId: DataLoader<string, User>;
  memberByVoteId: DataLoader<string, Member>;
}

// Loads the given parents by id (with one relation) and returns the relation
// for each requested id in the original order, defaulting to an empty array.
const batchHasMany = <P extends { id: string }, C>(
  load: (ids: Array<string>) => Promise<Array<P>>,
  pick: (parent: P) => Array<C> | undefined
) => async (ids: ReadonlyArray<string>): Promise<Array<Array<C>>> => {
  const parents = await load([ ...ids ]);
  const byId = new Map(parents.map((p) => [ p.id, pick(p) ?? [] ]));
  return ids.map((id) => byId.get(id) ?? []);
};

// Same as above but for a single related entity (may be missing -> undefined,
// which preserves the previous `findOne` behaviour for non-nullable fields).
const batchHasOne = <P extends { id: string }, C>(
  load: (ids: Array<string>) => Promise<Array<P>>,
  pick: (parent: P) => C
) => async (ids: ReadonlyArray<string>): Promise<Array<C>> => {
  const parents = await load([ ...ids ]);
  const byId = new Map(parents.map((p) => [ p.id, pick(p) ]));
  return ids.map((id) => byId.get(id)) as Array<C>;
};

export const createLoaders = (): Loaders => ({
  addedByEntryId: new DataLoader<string, Member>(
    batchHasOne(
      (ids) => getRepository(PlaylistEntry).findByIds(ids, { relations: [ 'addedBy' ] }),
      (entry) => entry.addedBy
    )
  ),
  memberByVoteId: new DataLoader<string, Member>(
    batchHasOne(
      (ids) => getRepository(Vote).findByIds(ids, { relations: [ 'member' ] }),
      (vote) => vote.member
    )
  ),
  membersByPartyId: new DataLoader<string, Array<Member>>(
    batchHasMany(
      (ids) => getRepository(Party).findByIds(ids, { relations: [ 'members' ] }),
      (party) => party.members
    )
  ),
  playlistByPartyId: new DataLoader<string, Array<PlaylistEntry>>(
    batchHasMany(
      (ids) => getRepository(Party).findByIds(ids, { relations: [ 'playlist' ] }),
      (party) => party.playlist
    )
  ),
  userByMemberId: new DataLoader<string, User>(
    batchHasOne(
      (ids) => getRepository(Member).findByIds(ids, { relations: [ 'user' ] }),
      (member) => member.user
    )
  ),
  votesByEntryId: new DataLoader<string, Array<Vote>>(
    batchHasMany(
      (ids) => getRepository(PlaylistEntry).findByIds(ids, { relations: [ 'votes' ] }),
      (entry) => entry.votes
    )
  ),
});
