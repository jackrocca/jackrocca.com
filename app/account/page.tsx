import { SiteAccount } from "@/components/site-account";
export const metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <SiteAccount />;
}
