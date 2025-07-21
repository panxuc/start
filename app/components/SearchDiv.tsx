import { memo } from "react";
import SearchForm from "./SearchForm";

const searchConfigs = [
  {
    actionUrl: "https://www.google.com/search",
    inputName: "q",
    placeholder: "Google Search",
    label: "Google",
    api: "google"
  },
  {
    actionUrl: "https://www.baidu.com/s",
    inputName: "wd",
    placeholder: "百度一下",
    label: "Baidu", 
    api: "baidu"
  },
  {
    actionUrl: "https://www.bing.com/search",
    inputName: "q",
    placeholder: "Bing Search",
    label: "Bing",
    api: "bing"
  }
] as const;

const SearchDiv = memo(function SearchDiv() {
  return (
    <div className="w-full max-w-4xl mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {searchConfigs.map((config) => (
          <div key={config.api} className="relative">
            <SearchForm {...config} />
            <div className="absolute -top-2 left-4 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full">
              {config.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default SearchDiv;
