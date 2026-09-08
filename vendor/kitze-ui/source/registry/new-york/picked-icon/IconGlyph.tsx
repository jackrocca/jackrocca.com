"use client";

import { Icon, loadIcon } from "@iconify/react";
import type { IconifyIcon } from "@iconify/react";
import { useEffect, useState } from "react";

export const IconGlyph = ({
  name,
  data,
}: {
  name: string;
  data?: IconifyIcon | undefined;
}) => {
  const [loaded, setLoaded] = useState<{
    name: string;
    data: IconifyIcon | null;
  }>();
  useEffect(() => {
    if (data) {
      return;
    }
    let active = true;
    const load = async () => {
      try {
        const icon = await loadIcon(name);
        if (active) {
          setLoaded({ data: icon, name });
        }
      } catch {
        if (active) {
          setLoaded({ data: null, name });
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [name, data]);
  const icon = data ?? (loaded?.name === name ? loaded.data : undefined);
  if (icon === null) {
    return (
      <span title="Icon unavailable" aria-hidden="true">
        ?
      </span>
    );
  }
  if (!icon) {
    return (
      <span
        className="size-3 rounded-full bg-current opacity-20"
        aria-hidden="true"
      />
    );
  }
  return <Icon ssr icon={icon} width="100%" height="100%" aria-hidden="true" />;
};
