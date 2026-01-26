import { Bar, BarChart, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart"

export const description = "A stacked bar chart with a legend"
export const iframeHeight = "600px"
export const containerClassName =
  "[&>div]:w-full [&>div]:max-w-md flex items-center justify-center min-h-svh"


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
        percentage: 187,
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

export function ToolTipCosh() {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Most Used Items
                    </CardTitle>
                    <CardDescription>
                        January - June 2024
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <ChartContainer config={chartConfig} className="">
                        <BarChart accessibilityLayer data={chartData}>
                            <XAxis dataKey="item" />
                            <Bar dataKey="percentage" stackId="a" fill="#0070F3" radius={[4, 4, 0, 0]} />
                            <ChartTooltip content={<ChartTooltipContent />} cursor={false} defaultIndex={1} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </>
    )
}