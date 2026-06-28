/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Member, Party, User } from '../models';
import { Loaders } from '../dataloaders';
import { ContainerInstance } from 'typedi';

export interface Context {
  user: User;
  member: Member;
  party: Party;
  requestId: string;
  container: ContainerInstance;
  loaders: Loaders;
}
