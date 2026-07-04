/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Member, Party, User } from '../models';
import { MemberService, TokenService } from '../services';
import { AccessToken } from '../types';
import { plainToClass } from 'class-transformer';
import { Container } from 'typedi';

const invalidState = {
  member: undefined,
  party: undefined,
  user: undefined,
};

export interface StateFromToken {
  user: User;
  member: Member;
  party: Party
}

export const validateTokenAndGetState: (token: string) => Promise<StateFromToken> = async token => {
  if (!token) {
    return invalidState;
  }
  try {
    const tokenService: TokenService = Container.get(TokenService);
    const memberService: MemberService = Container.get(MemberService);
    const { memberId } = tokenService.verify<AccessToken>(token);
    const member = await memberService.getByIdWithUserAndParty(memberId);
    if (!member) {
      return invalidState;
    }
    return {
      member: plainToClass(
        Member, member
      ),
      party: plainToClass(
        Party, member.party
      ),
      user: plainToClass(
        User, member.user
      ),
    };
  } catch {
    return invalidState;
  }
};
