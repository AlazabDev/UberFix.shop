import * as React from "react"

import { cn } from "@/lib/utils"

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
  }
>(({ className, config, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn("flex aspect-video justify-center", className)}
        {...props}
      />
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartTooltip: React.FC = () => null

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  { className?: string }
>(({ className }, ref) => {
  useChart()

  if (!className) return null

  return <div ref={ref} className={className} />
})
ChartTooltipContent.displayName = "ChartTooltip"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
