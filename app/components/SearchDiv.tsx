import SearchForm from "./SearchForm";

export default function SearchDiv() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
      <SearchForm
        actionUrl="https://www.google.com/search"
        inputName="q"
        placeholder="Google Search"
        buttonLabel="Google"
        api="google"
      />
      <SearchForm
        actionUrl="https://www.baidu.com/s"
        inputName="wd"
        placeholder="百度一下"
        buttonLabel="Baidu"
        api="baidu"
      />
      <SearchForm
        actionUrl="https://www.bing.com/search"
        inputName="q"
        placeholder="Bing Search"
        buttonLabel="Bing"
        api="bing"
      />
    </div>
  );
}
