import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function DataTableSkeleton() {
    return (
        <div className="rounded-md border border-neutral-800">
            <Table>
                <TableHeader className="bg-neutral-900">
                    <TableRow className="border-neutral-800">
                        {[...Array(4)].map((_, i) => (
                            <TableHead key={i}>
                                <Skeleton className="h-6 w-[100px] bg-neutral-800" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-neutral-800">
                            {[...Array(4)].map((_, j) => (
                                <TableCell key={j}>
                                    <Skeleton className="h-6 w-full bg-neutral-800/50" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}