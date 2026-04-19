import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SITE.name;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafaf9",
          color: "#171717",
          fontFamily: "serif",
          padding: "72px 88px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontFamily: "sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color: "#6b6b6b",
            fontWeight: 500,
          }}
        >
          research.juanlentino.com
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
              fontStyle: "italic",
              fontWeight: 500,
              color: "#171717",
              maxWidth: "92%",
            }}
          >
            Technical notes and defensive publications
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: "#4a4a4a",
              fontFamily: "sans-serif",
              maxWidth: "88%",
            }}
          >
            Music rights infrastructure · cryptographic provenance · AI-era metadata
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontSize: 22,
            fontFamily: "sans-serif",
            color: "#6b6b6b",
            borderTop: "1px solid #e7e5e4",
            paddingTop: 24,
          }}
        >
          <div>Juan Lentino</div>
          <div style={{ fontSize: 18, letterSpacing: "0.12em" }}>
            {`CC BY 4.0 · ORCID ${SITE.author.orcid}`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
