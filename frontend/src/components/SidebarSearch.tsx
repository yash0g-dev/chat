interface SidebarSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function SidebarSearch({
  search,
  onSearchChange,
}: SidebarSearchProps) {
  return (
    <div className="p-3">
      <input
        type="text"
        placeholder="Search conversations..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
      />
    </div>
  );
}
