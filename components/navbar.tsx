import React from "react";
import useScroll from "@/lib/hooks/use-scroll";
import Link from "next/link";
import Image from "next/image";
import WalletModal from "./wallet-modal";
import NavLinks from "./nav-links";
import { useAddress } from "@thirdweb-dev/react";

export default function Navbar() {
  const scrolled = useScroll(50);
  const address = useAddress();

  const [open, setOpen] = React.useState(false);
  return (
    <div
      className={`sticky top-0 w-full z-50 transition-all ${
        scrolled
          ? "border-b border-[#111] bg-black/50 backdrop-blur-xl"
          : "bg-black"
      }`}
    >
      <div className="mx-5 flex h-16 max-w-screen-xl items-center justify-between xl:mx-auto">
        <Link
          href="/"
          className="flex items-center font-display text-2xl text-white hover:text-white/80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
            />
          </svg>
          &nbsp;0xCommend
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
            {address ? (
              <span>
                {address.slice(0, 5)}...{address.slice(-4)}
              </span>
            ) : (
              <span>Connect Wallet</span>
            )}
          </button>
          <WalletModal open={open} setOpen={setOpen} />
        </div>
      </div>
    </div>
  );
}
