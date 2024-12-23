"use client";

import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

const Search = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Create a default search param value
    const defaultSearchValue = searchParams ? searchParams.get("search") : "";
    const [search, setSearch] = React.useState(defaultSearchValue || "");

    React.useEffect(() => {
        if (searchParams) {
            setSearch(searchParams.get("search") || "");
        }
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchParams) {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.set("search", search);
            router.push(`${pathname}?${newSearchParams}`);
        }
    };

    return (
        <form className="flex w-full flex-row gap-4" onSubmit={handleSearch}>
            <Input
                type="text"
                placeholder="Search questions"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <button className="shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600">
                Search
            </button>
        </form>
    );
}

export default Search;