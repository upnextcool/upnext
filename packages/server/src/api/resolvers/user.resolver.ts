/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Member, User } from '../models';
import { UserService } from '../services';
import { Arg, FieldResolver, Mutation, Resolver, ResolverInterface, Root } from 'type-graphql';
import { Service } from 'typedi';

@Service()
@Resolver(() => User)
export class UserResolver implements ResolverInterface<User> {

  constructor(private readonly _userService: UserService) {}

  @FieldResolver(() => Member)
  async member(@Root() user: User): Promise<Member> {
    return this._userService.getMemberFor(user);
  }

  @Mutation(() => User)
  async registerFingerprint(@Arg('fingerprint') fingerprint: string): Promise<User> {
    return this._userService.newUser(fingerprint);
  }
}
