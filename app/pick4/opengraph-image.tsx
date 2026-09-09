import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "NFL shield — Pick 4 Fantasy League";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logo = await readFile(join(process.cwd(), "public/nfl/league.png"), "base64");

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7faf9",
        borderBottom: "12px solid #0b706f",
        color: "#171717",
      }}
    >
      <img src={`data:image/png;base64,${logo}`} alt="" width={310} height={310} />
      <div
        style={{
          display: "flex",
          width: 1,
          height: 220,
          background: "#dbe5e1",
          margin: "0 64px",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: -4,
            lineHeight: 1.1,
          }}
        >
          Pick 4
        </div>
        <div style={{ display: "flex", fontSize: 48, letterSpacing: -1, marginTop: 12 }}>
          Fantasy League
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#0b706f", marginTop: 32 }}>
          Four picks. Every week.
        </div>
      </div>
    </div>,
    size,
  );
}
