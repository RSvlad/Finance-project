// Application: AuthContext — повезује Firebase Auth сесију са домен моделом User.
// Корисник без whitelist уноса нема приступ (null role → приступ одбијен у UI).

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "@shared/infrastructure/firebase";
import { loadUser } from "@identity/infrastructure/UserRepository";
import type { User } from "@identity/domain/User";

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const loaded = await loadUser(firebaseUser.uid);
      setUser(loaded);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signIn() {
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  async function signOutUser() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth мора бити позван унутар AuthProvider-а");
  }
  return context;
}
