import PostJobClient from "./post-client";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ metro: "portland-or" }];
}

export default async function Page({
  params
}: {
  params: Promise<{ metro: string }>;
}) {
  const { metro } = await params;
  return <PostJobClient metro={metro} />;
}
