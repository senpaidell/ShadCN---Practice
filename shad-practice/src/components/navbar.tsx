import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, CircleUser, Loader2, Package, Sheet } from "lucide-react";
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import { useDebounce } from "@/hooks/useDebounce";
import { useLowStockItems } from "@/hooks/useLowStockItems";

import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";

export function NavBar() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { lowStockItems } = useLowStockItems();
    // Wait 300ms after the user stops typing before searching
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch Search Results
    const { data: results, isFetching } = useQuery({
        queryKey: ['globalSearch', debouncedSearchTerm],
        queryFn: async () => {
            if (!debouncedSearchTerm) return { tables: [], items: [] };

            const token = localStorage.getItem("token");
            const res = await fetch(`https://coshts-backend.vercel.app/api/search?q=${debouncedSearchTerm}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Search failed");
            return res.json();
        },
        // Only run the query if there is an actual search term
        enabled: debouncedSearchTerm.length > 0
    });

    // Close dropdown if user clicks outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const totalResults = (results?.tables?.length || 0) + (results?.items?.length || 0);

    return (
        <div className="p-3 h-16 w-dvw flex flex-row gap-x-2 items-center relative z-50">

            {/* SEARCH BAR CONTAINER */}
            <div className="searchBar absolute left-1/2 transform -translate-x-1/2 flex flex-col w-auto" ref={dropdownRef}>
                <InputGroup className="w-fit sm:w-[25dvw] h-fit relative">
                    <InputGroupInput
                        placeholder="Search tables and items..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                    />
                    <InputGroupAddon>
                        {isFetching ? <Loader2 className="w-4 h-4 animate-spin text-neutral-400" /> : <Search className="w-4 h-4 text-neutral-400" />}
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        {debouncedSearchTerm ? `${totalResults} results` : ""}
                    </InputGroupAddon>
                </InputGroup>

                {/* SEARCH DROPDOWN */}
                {/* SEARCH DROPDOWN - LIGHT MODE */}
                {isDropdownOpen && debouncedSearchTerm.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[60vh] overflow-y-auto">

                        {/* Empty State */}
                        {!isFetching && totalResults === 0 && (
                            <div className="p-4 text-center text-sm text-neutral-500">
                                No results found for "{searchTerm}"
                            </div>
                        )}

                        {/* Tables Results */}
                        {results?.tables && results.tables.length > 0 && (
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-neutral-500 tracking-wider px-4 py-2 bg-neutral-50">Tables</span>
                                {results.tables.map((table: any) => (
                                    <div
                                        key={table._id}
                                        onClick={() => {
                                            navigate(`/table/${table._id}`);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-100 cursor-pointer transition-colors border-b border-neutral-100 last:border-0"
                                    >
                                        <div className="p-2 bg-neutral-100 rounded-md"><Sheet className="w-4 h-4 text-blue-600" /></div>
                                        <span className="text-sm font-medium text-neutral-900">{table.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Items Results */}
                        {results?.items && results.items.length > 0 && (
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-neutral-500 tracking-wider px-4 py-2 bg-neutral-50 border-t border-neutral-200">Items</span>
                                {results.items.map((item: any) => (
                                    <div
                                        key={item._id}
                                        onClick={() => {
                                            navigate(`/table/${item.tableId}`);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="flex items-center justify-between px-4 py-3 hover:bg-neutral-100 cursor-pointer transition-colors border-b border-neutral-100 last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-neutral-100 rounded-md"><Package className="w-4 h-4 text-green-600" /></div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-neutral-900">{item.name}</span>
                                                <span className="text-xs text-neutral-500">In Stock: {item.inStock}</span>
                                                <span>•</span>
                                                {/* Display the populated table name */}
                                                <span>Table: {item.tableId?.name || "Unknown"}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT SIDE ICONS */}
            <div className="ml-auto flex items-center gap-x-6 text-neutral-300">
                <Link to="/notifications" className="hover:text-white transition-colors">
                    <Badge badgeContent={lowStockItems.length} color="primary">
                        <MailIcon sx={{ fontSize: 26 }} />
                    </Badge>
                </Link>

                <Link to="/profile" className="hover:text-white transition-colors">
                    <CircleUser size={26} />
                </Link>
            </div>
        </div>
    );
}