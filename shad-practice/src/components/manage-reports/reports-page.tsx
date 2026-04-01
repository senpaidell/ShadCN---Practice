import { Button } from "../ui/button";
import { Loader2, FileText, CalendarDays, TrendingDown, Settings2, FileSpreadsheet, FileOutput, Printer } from "lucide-react";
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

// Export Libraries
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import * as XLSX from 'xlsx';

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
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [isGenerating, setIsGenerating] = useState(false);

    // Custom Columns State (Updated with Par Level logic)
    const [customColumns, setCustomColumns] = useState<ReportColumn[]>([
        { key: 'name', label: 'Item Name', selected: true },
        { key: 'currentStock', label: 'Current Stock', selected: true },
        { key: 'parLevel', label: 'Par Level', selected: true },
        { key: 'health', label: 'Health (%)', selected: true },
        { key: 'toOrder', label: 'To Order (Qty)', selected: true },
        { key: 'expiration', label: 'Expiration Date', selected: true },
        { key: 'volume', label: 'Volume/Size', selected: false },
    ]);

    // --- FETCH TABLES ---
    const { data: tables = [], isLoading } = useQuery<InventoryTable[]>({
        queryKey: ['tables'],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch('https://coshts-backend.vercel.app/api/tables', {
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
        setExportFormat('pdf');
        setIsModalOpen(true);
    };

    const toggleColumn = (key: string) => {
        setCustomColumns(cols => cols.map(c => c.key === key ? { ...c, selected: !c.selected } : c));
    };

    // --- DATA PREPARATION ENGINE ---
    const fetchAndFormatData = async () => {
        if (!selectedTable) return null;
        const token = localStorage.getItem("token");
        const queryType = reportType === 'custom' ? 'summary' : reportType;

        const res = await fetch(`https://coshts-backend.vercel.app/api/items/report/${selectedTable._id}?type=${queryType}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch report data");
        const rawItems = await res.json();

        // Calculate dynamic fields
        let processedItems = rawItems.map((item: any) => {
            const stock = item.currentStock || 0;
            const par = item.parLevel || 0;

            return {
                ...item,
                health: par > 0 ? `${Math.round((stock / par) * 100)}%` : '100%',
                toOrder: par > stock ? (par - stock) : 0,
                expiration: item.expiration ? new Date(item.expiration).toLocaleDateString() : 'N/A'
            };
        });

        // Filter out items that don't need restocking if it's a restocking report
        if (reportType === 'restocking') {
            processedItems = processedItems.filter((item: any) => item.toOrder > 0);
        }

        // Determine active columns based on report type
        let activeColumns = customColumns;
        if (reportType === 'summary') {
            activeColumns = customColumns.filter(c => ['name', 'currentStock', 'parLevel', 'health'].includes(c.key));
        } else if (reportType === 'restocking') {
            activeColumns = customColumns.filter(c => ['name', 'currentStock', 'parLevel', 'toOrder'].includes(c.key));
        } else if (reportType === 'expiration') {
            activeColumns = customColumns.filter(c => ['name', 'currentStock', 'expiration'].includes(c.key));
        } else {
            activeColumns = customColumns.filter(c => c.selected);
        }

        return { items: processedItems, columns: activeColumns };
    };

    // --- EXPORT ROUTER ---
    const executeExport = async () => {
        setIsGenerating(true);
        try {
            const data = await fetchAndFormatData();
            if (!data || data.columns.length === 0) {
                toast.error("No data or columns selected.");
                return;
            }

            const { items, columns } = data;
            const fileName = `${selectedTable?.name}_${reportType}_Report`;

            if (exportFormat === 'pdf') {
                generatePDF(items, columns, fileName);
            } else if (exportFormat === 'excel' || exportFormat === 'csv') {
                generateSpreadsheet(items, columns, fileName, exportFormat);
            }

            setIsModalOpen(false);
        } catch (error) {
            toast.error("Failed to generate report.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = async () => {
        setIsGenerating(true);
        try {
            const data = await fetchAndFormatData();
            if (!data || data.columns.length === 0) return;

            const { items, columns } = data;

            let printContents = `
                <html>
                <head>
                    <title>Print Report - ${selectedTable?.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                        h1 { font-size: 24px; margin-bottom: 5px; }
                        p { color: #666; margin-top: 0; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border-bottom: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #f8f9fa; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>${selectedTable?.name} - Inventory Report</h1>
                    <p>Report Type: ${reportType.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}</p>
                    <table>
                        <thead>
                            <tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${items.map((item: any) => `
                                <tr>${columns.map(c => `<td>${item[c.key] || '-'}</td>`).join('')}</tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(printContents);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }
        } catch (error) {
            toast.error("Failed to prepare print.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- GENERATORS ---
    const generatePDF = (items: any[], columns: ReportColumn[], fileName: string) => {
        const tableBody = [];
        tableBody.push(columns.map(c => ({ text: c.label, style: 'tableHeader' })));

        items.forEach((item) => {
            const row = columns.map(col => item[col.key]?.toString() || '-');
            tableBody.push(row);
        });

        const docDefinition: any = {
            content: [
                { text: `Report: ${selectedTable?.name}`, style: 'header' },
                { text: `Type: ${reportType.toUpperCase()}`, style: 'subheader' },
                { text: `Generated on: ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 20] },
                {
                    table: {
                        headerRows: 1,
                        widths: Array(columns.length).fill('*'),
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

        pdfMake.createPdf(docDefinition).download(`${fileName}.pdf`);
        toast.success("PDF generated successfully!");
    };

    const generateSpreadsheet = (items: any[], columns: ReportColumn[], fileName: string, type: 'excel' | 'csv') => {
        const mappedData = items.map(item => {
            const row: any = {};
            columns.forEach(col => {
                row[col.label] = item[col.key] || '-';
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

        if (type === 'excel') {
            XLSX.writeFile(workbook, `${fileName}.xlsx`);
            toast.success("Excel file generated successfully!");
        } else {
            XLSX.writeFile(workbook, `${fileName}.csv`);
            toast.success("CSV file generated successfully!");
        }
    };

    return (
        <div className="w-screen sm:p-10 p-2 flex flex-col gap-y-8">
            {/* INVENTORY PAGE MATCHING HEADER */}
            <div className="manageTitle item-center">
                <div className="flex flex-col gap-y-2">
                    <span className="text-3xl font-bold">Generate Reports</span>
                </div>
                <h5 className="flex items-center description text-neutral-400">
                    Select a table below to generate and download a report.
                </h5>
                <div>
                    <span className="text-neutral-400">Tables Created: </span>
                    <span className="mx-2 border border-neutral-800 px-4 py-1 bg-neutral-200 text-black rounded-[0.625rem] font-semibold text-[14px]">
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : tables.length}
                    </span>
                </div>
            </div>

            {/* INVENTORY PAGE MATCHING TABLE LIST */}
            <div className="tableLoc flex flex-col gap-y-4">
                {isLoading ? (
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-row gap-x-4 border border-white/5 rounded-[0.625rem] bg-neutral-300 p-10 items-center w-full">
                            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                            <div className="flex-1 flex flex-row gap-2">
                                <Skeleton className="h-6 w-3/4 max-w-[300px]" />
                            </div>
                            <Skeleton className="h-4 w-24 shrink-0" />
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
                            <div className="flex-1 flex items-start gap-x-4">
                                <span className="text-lg font-medium text-neutral-900">{item.name}</span>
                            </div>
                            <span className="ml-auto text-neutral-600 text-sm">
                                Click to Generate Report
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* MATCHING PAGINATION CONTROLS */}
            {tables.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-center gap-4 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safeCurrentPage === 1}
                        className="cursor-pointer"
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-neutral-900 font-medium">
                        Page {safeCurrentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage === totalPages}
                        className="cursor-pointer"
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* LIGHT MODE MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white border-neutral-200 text-neutral-900 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Configure Report</DialogTitle>
                        <DialogDescription className="text-neutral-500">
                            Setting up report for <span className="text-neutral-900 font-bold">{selectedTable?.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2 flex flex-col gap-6">
                        {/* Report Type Selector */}
                        <div>
                            <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase mb-3 block">1. Select Report Type</span>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setReportType('summary')} className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${reportType === 'summary' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}`}>
                                    <FileText className="w-6 h-6 mb-2" />
                                    <span className="text-sm font-bold">Inventory Summary</span>
                                </button>
                                <button onClick={() => setReportType('restocking')} className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${reportType === 'restocking' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}`}>
                                    <TrendingDown className="w-6 h-6 mb-2" />
                                    <span className="text-sm font-bold">Restocking Needs</span>
                                </button>
                                <button onClick={() => setReportType('expiration')} className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${reportType === 'expiration' ? 'border-red-500 bg-red-50 text-red-700' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}`}>
                                    <CalendarDays className="w-6 h-6 mb-2" />
                                    <span className="text-sm font-bold">Expiration Monitor</span>
                                </button>
                                <button onClick={() => setReportType('custom')} className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${reportType === 'custom' ? 'border-green-500 bg-green-50 text-green-700' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}`}>
                                    <Settings2 className="w-6 h-6 mb-2" />
                                    <span className="text-sm font-bold">Custom Layout</span>
                                </button>
                            </div>
                        </div>

                        {/* Custom Columns Selector */}
                        {reportType === 'custom' && (
                            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                                <span className="text-sm font-bold mb-3 block text-neutral-700">Select Columns to Include:</span>
                                <div className="grid grid-cols-2 gap-3">
                                    {customColumns.map((col) => (
                                        <div key={col.key} className="flex items-center space-x-2">
                                            <Checkbox id={col.key} checked={col.selected} onCheckedChange={() => toggleColumn(col.key)} className="border-neutral-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 cursor-pointer" />
                                            <label htmlFor={col.key} className="text-sm font-medium leading-none text-neutral-700 cursor-pointer">
                                                {col.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Export Format Selector */}
                        <div>
                            <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase mb-3 block">2. Select Export Format</span>
                            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                                {['pdf', 'excel', 'csv'].map((fmt) => (
                                    <button
                                        key={fmt}
                                        onClick={() => setExportFormat(fmt as any)}
                                        className={`cursor-pointer flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-md border text-sm font-semibold transition-all min-w-[80px] ${exportFormat === fmt ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}`}
                                    >
                                        {fmt === 'pdf' && <FileText className="w-4 h-4" />}
                                        {fmt === 'excel' && <FileSpreadsheet className="w-4 h-4" />}
                                        {fmt === 'csv' && <FileOutput className="w-4 h-4" />}
                                        <span className="uppercase">{fmt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4 sm:justify-between border-t border-neutral-100 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer border-neutral-200 text-neutral-600 hover:bg-neutral-100">
                            Cancel
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={handlePrint} disabled={isGenerating} className="cursor-pointer bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200">
                                <Printer className="w-4 h-4 mr-2" /> Print Directly
                            </Button>
                            <Button onClick={executeExport} disabled={isGenerating} className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white">
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileOutput className="w-4 h-4 mr-2" />}
                                Download
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}