import { renderLlmsTxt } from "@/lib/ui-catalog-text";

export async function GET(request: Request) {
  const origin = libraryOrigin(request);
  return new Response(renderLlmsTxt(origin), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function libraryOrigin(request: Request) {
  const appUrl = process.env.APP_URL;
  if (appUrl) return new URL(appUrl).origin;
  return new URL(request.url).origin;
}
