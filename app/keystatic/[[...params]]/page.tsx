import { notFound } from "next/navigation";
import { makePage } from "@keystatic/next/ui/app";
import config from "@/keystatic.config";

const cmsEnabled = process.env.ENABLE_CMS === "true";

// Next's config parser requires a literal. When CMS is disabled (every
// production build) we export a static 404; when CMS is enabled, `next dev`
// runs and this export is ignored.
export const dynamic = "force-static";

export function generateStaticParams() {
  return cmsEnabled ? [] : [{ params: [] }];
}

const CmsPage = makePage(config);

export default function Page(props: Record<string, unknown>) {
  if (!cmsEnabled) notFound();
  return <CmsPage {...props} />;
}
