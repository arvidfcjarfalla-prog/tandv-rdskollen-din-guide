import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";
import { StickyCtaBar } from "./StickyCtaBar";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Layout() {
  const location = useLocation();
  const showStickyBar = location.pathname === "/";

  usePageTitle();

  return (
    <>
      <Nav />
      <main className="pt-[60px]">
        <Outlet />
      </main>
      {showStickyBar && <StickyCtaBar />}
    </>
  );
}
