"use client";

import React from "react";
import Head from "next/head";
import Footer from "./components/Footer";
import SearchDiv from "./components/SearchDiv";
import TabSwitcher from "./components/TabSwitcher";
import Title from "./components/Title";

export default function Home() {
  return (
    <>

      {/* <Head>
        <script
          defer
          src="https://analytics.panxuc.com/script.js"
          data-website-id="a853dab6-8e8d-4c85-95c2-0d48bb54e7e7"
        ></script>
      </Head> */}

      <main className="flex min-h-screen flex-col items-center p-10">

        <Title />

        <SearchDiv />

        <TabSwitcher />

        <Footer />

      </main>

    </>
  );
}
