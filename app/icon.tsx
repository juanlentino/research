import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b0c",
          color: "#eeece8",
          fontFamily: "serif",
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          fontStyle: "italic",
        }}
      >
        R
      </div>
    ),
    size,
  );
}
