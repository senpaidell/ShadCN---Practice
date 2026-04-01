import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, CircleUser, Loader2, Package, Sheet, X } from "lucide-react";
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
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { lowStockItems } = useLowStockItems();
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
        enabled: debouncedSearchTerm.length > 0
    });

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

    const isSearchLoading = isFetching || (searchTerm.length > 0 && searchTerm !== debouncedSearchTerm);

    const closeSearch = () => {
        setIsDropdownOpen(false);
        setIsMobileSearchOpen(false);
        setSearchTerm("");
    };

    return (
        <div className="p-3 h-16 w-dvw flex flex-row gap-x-2 items-center relative z-50">

            {/* DESKTOP SEARCH BAR CONTAINER */}
            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 flex-col w-auto" ref={dropdownRef}>
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
                        {isSearchLoading ? <Loader2 className="w-4 h-4 animate-spin text-neutral-400" /> : <Search className="w-4 h-4 text-neutral-400" />}
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        {!isSearchLoading && debouncedSearchTerm ? `${totalResults} results` : ""}
                    </InputGroupAddon>
                </InputGroup>

                {/* DESKTOP SEARCH DROPDOWN */}
                {isDropdownOpen && searchTerm.length > 0 && (
                    <SearchResults
                        results={results}
                        isLoading={isSearchLoading}
                        searchTerm={searchTerm}
                        navigate={navigate}
                        closeSearch={closeSearch}
                    />
                )}
            </div>

            {/* RIGHT SIDE ICONS */}
            <div className="ml-auto flex items-center gap-x-4">

                {/* Mobile Search Trigger Icon */}
                <button
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="md:hidden p-1 rounded-[0.625rem] flex items-center justify-center transition-all duration-500 ease-in-out hover:bg-black hover:text-white"
                >
                    <Search size={26} />
                </button>

                <Link
                    to="/notifications"
                    className="p-1 rounded-[0.625rem] flex items-center justify-center transition-all duration-500 ease-in-out hover:bg-black hover:text-white"
                >
                    <Badge badgeContent={lowStockItems.length} color="primary">
                        <MailIcon sx={{ fontSize: 26 }} />
                    </Badge>
                </Link>

                <Link
                    to="/profile"
                    className="p-1 rounded-[0.625rem] flex items-center justify-center transition-all duration-500 ease-in-out hover:bg-black hover:text-white"
                >
                    <CircleUser size={26} />
                </Link>
            </div>

            {/* MOBILE SEARCH MODAL */}
            {isMobileSearchOpen && (
                <div className="fixed inset-0 bg-white z-[100] flex flex-col md:hidden">
                    {/* Mobile Search Input Header */}
                    <div className="p-4 flex items-center gap-3 border-b border-neutral-200">
                        {isSearchLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                        ) : (
                            <Search className="w-5 h-5 text-neutral-400" />
                        )}
                        <input
                            autoFocus
                            className="flex-1 outline-none text-base bg-transparent"
                            placeholder="Search tables and items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="text-sm text-neutral-500 whitespace-nowrap">
                            {!isSearchLoading && debouncedSearchTerm ? `${totalResults} results` : ""}
                        </span>
                        <button onClick={closeSearch} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                            <X size={20} className="text-neutral-500" />
                        </button>
                    </div>

                    {/* Mobile Search Results */}
                    <div className="flex-1 overflow-y-auto">
                        {searchTerm.length > 0 && (
                            <SearchResults
                                results={results}
                                isLoading={isSearchLoading}
                                searchTerm={searchTerm}
                                navigate={navigate}
                                closeSearch={closeSearch}
                                isMobile
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function SearchResults({ results, isLoading, searchTerm, navigate, closeSearch, isMobile = false }: any) {
    const totalResults = (results?.tables?.length || 0) + (results?.items?.length || 0);

    const containerClasses = isMobile
        ? "w-full bg-white flex flex-col"
        : "absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[60vh] overflow-y-auto";

    // LOADING SKELETON UI
    if (isLoading) {
        return (
            <div className={containerClasses}>
                {/* Tables Skeleton */}
                <div className="flex flex-col bg-white">
                    <span className="text-xs font-bold text-neutral-500 tracking-wider px-4 py-2 bg-neutral-50 border-b border-neutral-100">Tables</span>
                    {[...Array(2)].map((_, i) => (
                        <div key={`skel-table-${i}`} className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 last:border-0">
                            <div className="w-8 h-8 bg-neutral-200 rounded-md animate-pulse"></div>
                            <div className="w-24 h-4 bg-neutral-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>

                {/* Items Skeleton */}
                <div className="flex flex-col bg-white">
                    <span className="text-xs font-bold text-neutral-500 tracking-wider px-4 py-2 bg-neutral-50 border-t border-b border-neutral-100">Items</span>
                    {[...Array(4)].map((_, i) => (
                        <div key={`skel-item-${i}`} className="flex items-center justify-between px-4 py-3 border-b border-neutral-50 last:border-0">
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-8 h-8 bg-neutral-200 rounded-md animate-pulse"></div>
                                <div className="flex flex-row justify-between w-full items-center">
                                    <div className="flex flex-col gap-y-2">
                                        <div className="w-32 h-4 bg-neutral-200 rounded animate-pulse"></div>
                                        <div className="w-16 h-3 bg-neutral-200 rounded animate-pulse"></div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className="w-20 h-3 bg-neutral-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>

            {/* Empty State */}
            {!isLoading && totalResults === 0 && (
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
                                closeSearch();
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
                                navigate(`/table/${item.tableId?._id || item.tableId}`);
                                closeSearch();
                            }}
                            className="flex items-center justify-between px-4 py-3 hover:bg-neutral-100 cursor-pointer transition-colors border-b border-neutral-100 last:border-0"
                        >
                            <div className="flex items-center gap-3 w-full">
                                <div className="p-2 bg-neutral-100 rounded-md"><Package className="w-4 h-4 text-green-600" /></div>
                                <div className="flex flex-row justify-between w-full">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-neutral-900">{item.name}</span>
                                        <span className="text-xs text-neutral-500">Current Stock: {item.currentStock}</span>
                                    </div>
                                    <div className="hidden sm:block">
                                        <span className="text-xs text-neutral-500">Table: <span className="text-black font-medium">{item.tableId?.name || "Unknown"}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}