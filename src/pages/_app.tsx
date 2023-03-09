import "@/src/styles/globals.css";
import type { AppProps } from "next/app";

import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";

import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";

const activeChainId = ChainId.Mumbai;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider activeChain={activeChainId}>
      <Navbar />
      <Component {...pageProps} />
      <Toaster />
    </ThirdwebProvider>
  );
}
