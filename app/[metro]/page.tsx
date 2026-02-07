import MetroClient from "./metro-client";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ metro: "portland-or" }];
}

export default function MetroPage({
  params,
  searchParams
}: {
  params: { metro: string };
  searchParams?: { paid?: string };
}) {
  return (
    <MetroClient
      metro={params.metro}
      paid={searchParams?.paid === "1"}
    />
  );
}
