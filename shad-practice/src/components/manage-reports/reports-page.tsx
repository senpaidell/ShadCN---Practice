import { Button } from "../ui/button";
import { Sheet, Loader2, FileText, CalendarDays, TrendingDown, Settings2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";

// PDFMake Imports
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
// Initialize fonts for pdfmake
(pdfMake as any).vfs = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;

interface InventoryTable {
    _id: string;
    name: string;
    createdAt: string;
}

interface ReportColumn {
    key: string;
    label: string;
    selected: boolean;
}

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-neutral-300/50 ${className}`} />;
}

export default function GeneratePage() {
    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // --- MODAL & REPORT STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<InventoryTable | null>(null);
    const [reportType, setReportType] = useState<'summary' | 'expiration' | 'restocking' | 'custom'>('summary');
    const [isGenerating, setIsGenerating] = useState(false);

    // Custom Columns State
    const [customColumns, setCustomColumns] = useState<ReportColumn[]>([
        { key: 'name', label: 'Item Name', selected: true },
        { key: 'volume', label: 'Volume', selected: true },
        { key: 'inStock', label: 'In Stock', selected: true },
        { key: 'newStock', label: 'New Stock', selected: false },
        { key: 'balance', label: 'Balance (%)', selected: true },
        { key: 'expiration', label: 'Expiration Date', selected: true },
    ]);

    // --- FETCH TABLES ---
    const { data: tables = [], isLoading } = useQuery<InventoryTable[]>({
        queryKey: ['tables'],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch('http://localhost:5000/api/tables', {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        }
    });

    const totalPages = Math.ceil(tables.length / ITEMS_PER_PAGE);
    const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const currentTables = tables.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // --- HANDLERS ---
    const openReportModal = (table: InventoryTable) => {
        setSelectedTable(table);
        setReportType('summary');
        setIsModalOpen(true);
    };

    const toggleColumn = (key: string) => {
        setCustomColumns(cols => cols.map(c => c.key === key ? { ...c, selected: !c.selected } : c));
    };

    // --- PDF GENERATION LOGIC ---
    const generatePDF = async () => {
        if (!selectedTable) return;
        setIsGenerating(true);

        try {
            const token = localStorage.getItem("token");
            // Determine which type to send to the backend
            const queryType = reportType === 'custom' ? 'summary' : reportType;

            const res = await fetch(`http://localhost:5000/api/items/report/${selectedTable._id}?type=${queryType}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch report data");
            const items = await res.json();

            // Determine which columns to show
            let activeColumns = customColumns;
            if (reportType !== 'custom') {
                // Default columns for standard reports
                activeColumns = customColumns.filter(c => ['name', 'inStock', 'balance', 'expiration'].includes(c.key));
            } else {
                activeColumns = customColumns.filter(c => c.selected);
            }

            if (activeColumns.length === 0) {
                toast.error("Please select at least one column for the custom report.");
                setIsGenerating(false);
                return;
            }

            // Map data to PDF format
            const tableBody = [];
            // Header Row
            tableBody.push(activeColumns.map(c => ({ text: c.label, style: 'tableHeader' })));

            // Data Rows
            items.forEach((item: any) => {
                const row = activeColumns.map(col => {
                    let val = item[col.key];
                    if (col.key === 'expiration' && val) val = new Date(val).toLocaleDateString();
                    if (col.key === 'balance' && val !== undefined) val = `${val}%`;
                    return val?.toString() || '-';
                });
                tableBody.push(row);
            });

            // Document Definition
            const docDefinition: any = {
                content: [
                    { text: `Report: ${selectedTable.name}`, style: 'header' },
                    { text: `Type: ${reportType.toUpperCase()}`, style: 'subheader' },
                    { text: `Generated on: ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 20] },
                    {
                        table: {
                            headerRows: 1,
                            widths: Array(activeColumns.length).fill('*'), // Distribute width evenly
                            body: tableBody
                        },
                        layout: 'lightHorizontalLines'
                    }
                ],
                styles: {
                    header: { fontSize: 22, bold: true, margin: [0, 0, 0, 5] },
                    subheader: { fontSize: 14, color: '#666666', margin: [0, 0, 0, 5] },
                    tableHeader: { bold: true, fontSize: 12, color: 'black', fillColor: '#eeeeee' }
                }
            };

            // Generate and download
            pdfMake.createPdf(docDefinition).download(`${selectedTable.name}_${reportType}_Report.pdf`);
            toast.success("Report generated successfully!");
            setIsModalOpen(false);

        } catch (error) {
            toast.error("Failed to generate report.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-screen sm:p-10 p-2 flex flex-col gap-y-8">
            <div className="manageTitle item-center">
                <div className="flex flex-col gap-y-2">
                    <span className="text-3xl font-bold">Generate Reports</span>
                </div>
                <h5 className="flex items-center description text-neutral-400">
                    Select a table below to generate and download a PDF report.
                </h5>
            </div>

            <div className="tableLoc flex flex-col gap-y-4">
                {isLoading ? (
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-row gap-x-4 border border-white/5 rounded-[0.625rem] bg-neutral-300 p-10 items-center w-full">
                            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                            <div className="flex-1"><Skeleton className="h-6 w-3/4 max-w-[300px]" /></div>
                        </div>
                    ))
                ) : tables.length === 0 ? (
                    <div className="text-neutral-500 text-center py-10 border border-dashed border-neutral-800 rounded-lg">
                        No inventory tables available.
                    </div>
                ) : (
                    currentTables.map((item, index) => (
                        <div
                            key={item._id}
                            onClick={() => openReportModal(item)}
                            className="group cursor-pointer hover:brightness-125 transition duration-200 ease-in-out flex flex-row gap-x-4 border border-neutral-800 rounded-[0.625rem] bg-neutral-300 p-10 items-center"
                        >
                            <div className="text-sm text-neutral-900">{startIndex + index + 1}.</div>
                            <Sheet className="w-6 h-6 text-neutral-300" />
                            <div className="flex-1 flex items-start gap-x-4">
                                <span className="text-lg font-medium text-neutral-900">{item.name}</span>
                            </div>
                            <span className="ml-auto text-neutral-600 text-sm">
                                Click to generate report
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination... (Identical to your inventoryPage) */}
            {tables.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-center gap-4 mt-4">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1}>Previous</Button>
                    <span className="text-sm text-neutral-900 font-medium">Page {safeCurrentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages}>Next</Button>
                </div>
            )}

            {/* REPORT GENERATION MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px] bg-neutral-900 border-neutral-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Generate PDF Report</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Configure the report for <span className="text-white font-bold">{selectedTable?.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Option 1 */}
                            <button
                                onClick={() => setReportType('summary')}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${reportType === 'summary' ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700'}`}
                            >
                                <FileText className={`w-6 h-6 mb-2 ${reportType === 'summary' ? 'text-blue-500' : 'text-neutral-400'}`} />
                                <span className="text-sm font-medium">Inventory Summary</span>
                            </button>

                            {/* Option 2 */}
                            <button
                                onClick={() => setReportType('expiration')}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${reportType === 'expiration' ? 'border-red-500 bg-red-500/10' : 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700'}`}
                            >
                                <CalendarDays className={`w-6 h-6 mb-2 ${reportType === 'expiration' ? 'text-red-500' : 'text-neutral-400'}`} />
                                <span className="text-sm font-medium">Expiration Monitor</span>
                            </button>

                            {/* Option 3 */}
                            <button
                                onClick={() => setReportType('restocking')}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${reportType === 'restocking' ? 'border-yellow-500 bg-yellow-500/10' : 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700'}`}
                            >
                                <TrendingDown className={`w-6 h-6 mb-2 ${reportType === 'restocking' ? 'text-yellow-500' : 'text-neutral-400'}`} />
                                <span className="text-sm font-medium">Restocking Report</span>
                            </button>

                            {/* Option 4 */}
                            <button
                                onClick={() => setReportType('custom')}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${reportType === 'custom' ? 'border-green-500 bg-green-500/10' : 'border-neutral-700 bg-neutral-800 hover:bg-neutral-700'}`}
                            >
                                <Settings2 className={`w-6 h-6 mb-2 ${reportType === 'custom' ? 'text-green-500' : 'text-neutral-400'}`} />
                                <span className="text-sm font-medium">Custom Report</span>
                            </button>
                        </div>

                        {/* Custom Columns Selector */}
                        {reportType === 'custom' && (
                            <div className="mt-4 p-4 rounded-lg bg-neutral-800 border border-neutral-700">
                                <span className="text-sm font-semibold mb-3 block">Select Columns to Include:</span>
                                <div className="grid grid-cols-2 gap-3">
                                    {customColumns.map((col) => (
                                        <div key={col.key} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={col.key}
                                                checked={col.selected}
                                                onCheckedChange={() => toggleColumn(col.key)}
                                            />
                                            <label htmlFor={col.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {col.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={generatePDF} disabled={isGenerating}>
                            {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Download PDF"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}