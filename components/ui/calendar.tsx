"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        ...defaultClassNames,
        root: cn("w-full", defaultClassNames.root),
        months: cn("flex flex-col items-center gap-3 sm:flex-row", defaultClassNames.months),
        month: cn("space-y-3 mx-auto", defaultClassNames.month),
        month_caption: cn("relative flex items-center justify-center px-9", defaultClassNames.month_caption),
        caption_label: cn("text-sm font-semibold", defaultClassNames.caption_label),
        nav: cn(
          "pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "pointer-events-auto h-7 w-7 cursor-pointer rounded-md border-border bg-background p-0 opacity-90 hover:opacity-100",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "pointer-events-auto h-7 w-7 cursor-pointer rounded-md border-border bg-background p-0 opacity-90 hover:opacity-100",
          defaultClassNames.button_next
        ),
        month_grid: cn("mx-auto w-auto border-collapse", defaultClassNames.month_grid),
        weekdays: cn("mb-1 flex justify-center", defaultClassNames.weekdays),
        weekday: cn("w-9 text-[0.72rem] font-medium text-muted-foreground", defaultClassNames.weekday),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        day: cn("relative h-9 w-9 p-0 text-center text-sm", defaultClassNames.day),
        day_button: cn(
          "h-9 w-9 cursor-pointer rounded-lg p-0 font-medium text-foreground transition-colors hover:bg-slate-100 aria-selected:opacity-100",
          defaultClassNames.day_button
        ),
        selected: cn(
          "bg-electric-blue !text-white font-semibold hover:bg-electric-blue/90 hover:!text-white",
          defaultClassNames.selected
        ),
        today: cn("font-semibold text-electric-blue aria-selected:!text-white", defaultClassNames.today),
        outside: cn("text-muted-foreground opacity-45", defaultClassNames.outside),
        disabled: cn("opacity-35", defaultClassNames.disabled),
        range_start: cn(
          "bg-electric-blue !text-white rounded-lg shadow-[0_1px_2px_rgba(61,129,247,0.25)]",
          defaultClassNames.range_start
        ),
        range_end: cn(
          "bg-electric-blue !text-white rounded-lg shadow-[0_1px_2px_rgba(61,129,247,0.25)]",
          defaultClassNames.range_end
        ),
        range_middle: cn(
          "bg-electric-blue/14 text-electric-blue font-semibold rounded-lg",
          defaultClassNames.range_middle
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className="h-4 w-4" {...iconProps} />
          ) : (
            <ChevronRightIcon className="h-4 w-4" {...iconProps} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar, type CalendarProps }
