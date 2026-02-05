import PostJobClient from "./post-client";

export default async function Page({
  params
}: {
  params: Promise<{ metro: string }>;
}) {
  const { metro } = await params;
  return <PostJobClient metro={metro} />;
}
