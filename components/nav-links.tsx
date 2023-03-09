import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export default function NavLinks() {
  let [hoveredIndex, setHoveredIndex] = useState(null);

  return [
    ["Commend", "/commend"],
    ["Create Profile", "/create-profile"],
    ["Learn More", "https://www.twitter.com/chrisabdo"],
  ].map(([label, href], index) => (
    <Link
      key={label}
      href={href}
      className="relative  -mx-3 rounded-lg px-3 py-2 text-sm text-black transition-colors delay-150 hover:text-gray-900 hover:delay-[0ms]"
      //   @ts-ignore
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <AnimatePresence>
        {hoveredIndex === index && (
          <motion.span
            className="absolute inset-0 rounded-lg bg-[#111]"
            layoutId="hoverBackground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15, delay: 0.2 },
            }}
          />
        )}
      </AnimatePresence>
      <span className="relative z-10 text-white">{label}</span>
    </Link>
  ));
}
