import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";

export const description = "A simple pie chart"

const chartData = [
    {
        item: "Flour",
        percentage: 275,
        fill: "#0070F3"
    },
    {
        item: "Sugar",
        percentage: 200,
        fill: "#79FFE1"
    },
    {
        item: "Milk",
        percentage: 200,
        fill: "#F81CE5"
    },
    {
        item: "Butter",
        percentage: 173,
        fill: "#FFAA00"
    },
    {
        item: "Eggs",
        percentage: 90,
        fill: "#EDEDED"
    },
]

const chartConfig = {
    percentage: {
        label: "Percentage",
    },
} satisfies ChartConfig


export function PieChartComponent() {
    return (
        <>
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Remaining Items</CardTitle>
                    <CardDescription>January - June 2024</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pb-0">
                    <ChartContainer config={chartConfig} className="">
                        <PieChart>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Pie data={chartData} dataKey="percentage" nameKey="item" />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </>
    )
}