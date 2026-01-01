import { Redirect } from "expo-router";

export default function Index() {
  // TODO: Check if user is logged in
  // If logged in, redirect to (tabs)
  // If not logged in, redirect to login

  const isLoggedIn = false; // Replace with actual auth check

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
