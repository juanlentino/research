import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "@/keystatic.config";

const cmsEnabled = process.env.ENABLE_CMS === "true";

export const dynamic = "force-static";

export function generateStaticParams() {
  return cmsEnabled ? [] : [{ params: ["_"] }];
}

const handlers = cmsEnabled
  ? makeRouteHandler({ config })
  : {
      GET: () => new Response("Not found", { status: 404 }),
      POST: () => new Response("Not found", { status: 404 }),
    };

export const { GET, POST } = handlers;
