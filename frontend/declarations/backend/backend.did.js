export const idlFactory = ({ IDL }) => {
  const Homework = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'dueDate' : IDL.Int,
    'description' : IDL.Text,
    'assignedDate' : IDL.Int,
  });
  return IDL.Service({
    'addHomework' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Int, IDL.Int],
        [IDL.Nat],
        [],
      ),
    'deleteHomework' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'getAllHomework' : IDL.Func([], [IDL.Vec(Homework)], ['query']),
    'getHomework' : IDL.Func([IDL.Nat], [IDL.Opt(Homework)], ['query']),
    'updateHomework' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Int, IDL.Int],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
