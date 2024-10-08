import React from "react";
import Categories from './Categories';

export default function Navigator() {
  const [selectedCategory, setSelectedCategory] = React.useState("清华");
  return (
    <>
      <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
        {Object.keys(Categories).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${selectedCategory === category
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center items-center gap-4 w-full">
        {selectedCategory &&
          Categories[selectedCategory as keyof typeof Categories].map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border border-gray-300 rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              <p className="text-xl mb-2">{site.name}</p>
              {/* <p className="text-xs text-gray-600">{site.desc}</p> */}
            </a>
          ))}
      </div>
    </>
  )
}
