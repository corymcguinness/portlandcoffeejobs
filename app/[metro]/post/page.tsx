import PostJobClient from "./post-client";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ metro: "portland-or" }];
}

export default function Page({
  params
}: {
  params: { metro: string };
}) {
  return <PostJobClient metro={params.metro} />;
}
