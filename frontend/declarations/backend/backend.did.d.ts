import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Homework {
  'id' : bigint,
  'title' : string,
  'dueDate' : bigint,
  'description' : string,
}
export interface _SERVICE {
  'addHomework' : ActorMethod<[string, string, bigint], bigint>,
  'deleteHomework' : ActorMethod<[bigint], boolean>,
  'getAllHomework' : ActorMethod<[], Array<Homework>>,
  'getHomework' : ActorMethod<[bigint], [] | [Homework]>,
  'updateHomework' : ActorMethod<[bigint, string, string, bigint], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
