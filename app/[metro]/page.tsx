import MetroClient from "./metro-client";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ metro: "portland-or" }];
}

export default function MetroPage({
  params
}: {
  params: { metro: string };
}) {
  const { metro } = params;
  return <MetroClient metro={metro} />;
}
