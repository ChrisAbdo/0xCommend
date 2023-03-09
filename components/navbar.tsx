import React from "react";
import useScroll from "@/lib/hooks/use-scroll";
import Link from "next/link";
import Image from "next/image";
import WalletModal from "./wallet-modal";
import NavLinks from "./nav-links";

export default function Navbar() {
  const scrolled = useScroll(50);
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className={`sticky top-0 w-full bg-white z-50 transition-all ${
        scrolled
          ? "border-b border-gray-200 bg-white/50 backdrop-blur-xl"
          : "bg-white"
      }`}
    >
      <div className="mx-5 flex h-16 max-w-screen-xl items-center justify-between xl:mx-auto">
        <Link href="/" className="flex items-center font-display text-2xl">
          <p>0xCommend</p>
        </Link>

        <div className="space-x-4 hidden lg:flex">
          {/* @ts-ignore */}
          <NavLinks />
        </div>

        <div>
          <button
            type="button"
            className="rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => setOpen(true)}
          >
            Connect Wallet
          </button>
          <WalletModal open={open} setOpen={setOpen} />
        </div>
      </div>
    </div>
  );
}
