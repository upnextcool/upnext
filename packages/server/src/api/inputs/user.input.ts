/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { User } from '../models';
import { InputType } from 'type-graphql';

@InputType()
export class UserInput implements Partial<User> {}
