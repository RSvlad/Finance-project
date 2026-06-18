// Bounded Context: Identity
// Aggregate: Корисник (видети Context/domain-model.md)

export type Role = "Admin" | "Viewer";

export interface User {
  readonly id: string; // Firebase UID
  readonly email: string;
  readonly role: Role;
}
