import MetroClient from "./metro-client";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ metro: "portland-or" }];
}

export default async function MetroPage({
  params
}: {
  params: Promise<{ metro: string }>;
}) {
  const { metro } = await params;
  return <MetroClient metro={metro} />;
}
