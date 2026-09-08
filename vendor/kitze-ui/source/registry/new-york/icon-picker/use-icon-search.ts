"use client";

import { useEffect, useState } from "react";

import type { IconSearch } from "@/registry/new-york/icon-picker/icon-search";

export const useIconSearch = (
  query: string,
  prefixes: string[],
  search: IconSearch
) => {
  const key = prefixes.join(",");
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    icons: string[];
    error: boolean;
  }>();
  const requestKey = `${key}:${query}:${retry}`;
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const icons = await search({
          prefixes: key.split(","),
          query: query.trim(),
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setResult({ error: false, icons, key: requestKey });
        }
      } catch {
        if (!controller.signal.aborted) {
          setResult({ error: true, icons: [], key: requestKey });
        }
      }
    };
    const timer = setTimeout(() => {
      void run();
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, key, search, requestKey]);
  return {
    error: result?.key === requestKey && result.error,
    handleRetry: () => setRetry((value) => value + 1),
    icons: result?.key === requestKey ? result.icons : [],
    loading: result?.key !== requestKey,
  };
};
