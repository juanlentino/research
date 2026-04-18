import { notFound } from "next/navigation";
import { makePage } from "@keystatic/next/ui/app";
import config from "@/keystatic.config";

const cmsEnabled = process.env.ENABLE_CMS === "true";

export const dynamic = cmsEnabled ? "force-dynamic" : "force-static";

export function generateStaticParams() {
  return cmsEnabled ? [] : [{ params: [] }];
}

const CmsPage = makePage(config);

export default function Page(props: Parameters<typeof CmsPage>[0]) {
  if (!cmsEnabled) notFound();
  return <CmsPage {...props} />;
}
