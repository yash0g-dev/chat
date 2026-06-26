"use client";

import { Provider } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "@/store/authSlice";
import { store } from "@/store/store";

const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    store.dispatch(checkAuth());
  }, []);

  return <>{children}</>;
};

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  );
}
