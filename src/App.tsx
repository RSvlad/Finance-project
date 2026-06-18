import { useAuth } from "@identity/application/AuthContext";

export default function App() {
  const { user, loading, signIn, signOutUser } = useAuth();

  if (loading) {
    return <p>Учитавање...</p>;
  }

  if (!user) {
    return <button onClick={signIn}>Пријави се</button>;
  }

  return (
    <div>
      <p>
        Пријављен: {user.email} ({user.role})
      </p>
      <button onClick={signOutUser}>Одјави се</button>
    </div>
  );
}
