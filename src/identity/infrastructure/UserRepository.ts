// Infrastructure: читање whitelist-а (Firestore колекција `allowedUsers`)
// Видети ADR-004, ADR-008.

import { doc, getDoc } from "firebase/firestore";
import { db } from "@shared/infrastructure/firebase";
import type { User, Role } from "@identity/domain/User";

interface AllowedUserDoc {
  email: string;
  role: Role;
}

/**
 * Враћа User на основу Firebase UID, читајући whitelist документ.
 * Враћа null ако корисник није на whitelist-у (нема приступ систему).
 */
export async function loadUser(uid: string): Promise<User | null> {
  const ref = doc(db, "allowedUsers", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data() as AllowedUserDoc;
  return {
    id: uid,
    email: data.email,
    role: data.role,
  };
}
