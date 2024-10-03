import Bool "mo:base/Bool";

import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Debug "mo:base/Debug";

actor {
  // Define the Homework type
  type Homework = {
    id: Nat;
    title: Text;
    description: Text;
    assignedDate: Int;
    dueDate: Int;
  };

  // Initialize stable variable to store homework assignments
  stable var homeworkCounter : Nat = 0;
  stable var homeworks : [Homework] = [];

  // Add a new homework assignment
  public func addHomework(title: Text, description: Text, assignedDate: Int, dueDate: Int) : async Nat {
    let id = homeworkCounter;
    let homework : Homework = {
      id;
      title;
      description;
      assignedDate;
      dueDate;
    };
    homeworks := Array.append(homeworks, [homework]);
    homeworkCounter += 1;
    id
  };

  // Get all homework assignments
  public query func getAllHomework() : async [Homework] {
    homeworks
  };

  // Get a specific homework assignment by ID
  public query func getHomework(id: Nat) : async ?Homework {
    Array.find(homeworks, func (hw: Homework) : Bool { hw.id == id })
  };

  // Update a homework assignment
  public func updateHomework(id: Nat, title: Text, description: Text, assignedDate: Int, dueDate: Int) : async Bool {
    homeworks := Array.map(homeworks, func (hw: Homework) : Homework {
      if (hw.id == id) {
        return {
          id = hw.id;
          title = title;
          description = description;
          assignedDate = assignedDate;
          dueDate = dueDate;
        };
      };
      hw
    });
    true
  };

  // Delete a homework assignment
  public func deleteHomework(id: Nat) : async Bool {
    let initialLength = homeworks.size();
    homeworks := Array.filter(homeworks, func (hw: Homework) : Bool { hw.id != id });
    homeworks.size() != initialLength
  };
}
