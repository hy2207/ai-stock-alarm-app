import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { LandingPage } from "./components/LandingPage";

export default async function Home() {
  const userId = await getCurrentUserId();
  return <LandingPage authenticated={userId != null} />;
}
