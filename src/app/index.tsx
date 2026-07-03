import { Redirect } from "expo-router";

export default function Index() {
  // Temporaire : sera remplacé en Task 11 par la vraie logique getSession()
  return <Redirect href="./login" />;
}