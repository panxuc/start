"use client";

import React from "react";
import ExtraScript from "./components/ExtraScript";
import Footer from "./components/Footer";
import SearchDiv from "./components/SearchDiv";
import TabSwitcher from "./components/TabSwitcher";
import Title from "./components/Title";

export default function Home() {
  return (
    <>

      <main className="flex min-h-screen flex-col items-center p-10">

        <Title />

        <SearchDiv />

        <TabSwitcher />

        <Footer />

        <ExtraScript />

      </main>

    </>
  );
}
