import { SearchBar } from "../crm/shared/search-bar";

export default function SearchBarExample() {
  return (
    <div className="p-6 space-y-4">
      <SearchBar
        placeholder="Search leads..."
        onSearch={(query) => console.log("Search query:", query)}
      />
      <SearchBar
        placeholder="Search properties..."
        onSearch={(query) => console.log("Search query:", query)}
      />
      <SearchBar
        placeholder="Search contacts..."
        onSearch={(query) => console.log("Search query:", query)}
        className="max-w-md"
      />
    </div>
  );
}
