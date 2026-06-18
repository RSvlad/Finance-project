// Bounded Context: Identity
// Aggregate: Корисник (видети Context/domain-model.md)

export type Role = "Admin" | "Viewer";

export interface User {
  readonly id: string; // Firebase UID (познат тек после пријаве)
  readonly email: string; // doc ID у allowedUsers — видети ADR-012
  readonly role: Role;
}
