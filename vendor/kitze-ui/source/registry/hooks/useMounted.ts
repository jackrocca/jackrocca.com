"use client";

import { useSyncExternalStore } from "react";

const unsubscribe = () => {
  // Mount state never changes after hydration, so there is nothing to tear down.
};
const subscribe = () => unsubscribe;
export const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
