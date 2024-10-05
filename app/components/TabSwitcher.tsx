import React, { useState } from "react";
import Tabs from "./Tabs";

export default function TabSwitcher() {
  const [selectedTab, setSelectedTab] = useState("网址导航");
  return (
    <>
      <div className="flex gap-4 mb-8">
        {Object.keys(Tabs).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`py-2 px-4 font-bold focus:outline-none transition-colors duration-300 ${selectedTab === tab
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-2 bg-white rounded-lg">
        <div
          className="transition-opacity duration-500 ease-in-out opacity-90"
          key={selectedTab}
        >
          {Tabs[selectedTab as keyof typeof Tabs]}
        </div>
      </div>
    </>
  )
}