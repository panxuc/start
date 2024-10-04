interface SearchFormProps {
  actionUrl: string;
  inputName: string;
  placeholder: string;
  buttonLabel: string;
}

export default function SearchForm({ actionUrl, inputName, placeholder, buttonLabel }: SearchFormProps) {
  return (
    <form action={actionUrl} method="get" target="_blank" className="flex items-center gap-2">
      <input
        type="text"
        name={inputName}
        placeholder={placeholder}
        className="px-4 py-2 border border-gray-300 rounded-lg"
      />
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
        {buttonLabel}
      </button>
    </form>
  );
}
