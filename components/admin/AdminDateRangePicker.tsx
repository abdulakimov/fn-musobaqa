"use client"

import * as React from "react"
import { format, isSameDay, startOfMonth, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const DATE_QUERY_FORMAT = "yyyy-MM-dd"
const DATE_LABEL_FORMAT = "dd.MM.yyyy"

interface AdminDateRangePickerProps {
  dateFrom?: string
  dateTo?: string
  onChange: (next: { dateFrom?: string; dateTo?: string }) => void
  className?: string
}

function parseQueryDate(value?: string): Date | undefined {
  if (!value) return undefined
  const [yearRaw, monthRaw, dayRaw] = value.split("-")
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return undefined
  }
  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }
  return parsed
}

function toQueryDate(value: Date | undefined): string | undefined {
  return value ? format(value, DATE_QUERY_FORMAT) : undefined
}

function formatTriggerLabel(dateFrom?: Date, dateTo?: Date): string {
  if (dateFrom && dateTo) {
    return `${format(dateFrom, DATE_LABEL_FORMAT)} - ${format(dateTo, DATE_LABEL_FORMAT)}`
  }
  if (dateFrom) {
    return `dan ${format(dateFrom, DATE_LABEL_FORMAT)}`
  }
  if (dateTo) {
    return `gacha ${format(dateTo, DATE_LABEL_FORMAT)}`
  }
  return "Sana oralig'i"
}

export function AdminDateRangePicker({
  dateFrom,
  dateTo,
  onChange,
  className,
}: AdminDateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const parsedFrom = React.useMemo(() => parseQueryDate(dateFrom), [dateFrom])
  const parsedTo = React.useMemo(() => parseQueryDate(dateTo), [dateTo])
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(undefined)
  const [visibleMonth, setVisibleMonth] = React.useState<Date>(parsedFrom ?? parsedTo ?? new Date())
  const [awaitingRangeEnd, setAwaitingRangeEnd] = React.useState(false)

  const selectedFromQuery = React.useMemo<DateRange | undefined>(() => {
    if (!parsedFrom && !parsedTo) return undefined
    return { from: parsedFrom, to: parsedTo }
  }, [parsedFrom, parsedTo])

  const selectedRange = open ? draftRange : selectedFromQuery

  React.useEffect(() => {
    if (!open) return
    setDraftRange(selectedFromQuery)
    setVisibleMonth((selectedFromQuery?.from ?? selectedFromQuery?.to ?? new Date()))
    setAwaitingRangeEnd(false)
  }, [open, selectedFromQuery])

  const applyRange = React.useCallback(
    (nextFrom?: Date, nextTo?: Date, closeAfterApply = false) => {
      onChange({
        dateFrom: toQueryDate(nextFrom),
        dateTo: toQueryDate(nextTo),
      })
      if (closeAfterApply) {
        setOpen(false)
      }
    },
    [onChange]
  )

  const today = React.useMemo(() => new Date(), [])

  const presets = React.useMemo(
    () => [
      {
        key: "today",
        label: "Bugun",
        onClick: () => {
          setDraftRange({ from: today, to: today })
          setVisibleMonth(today)
          applyRange(today, today, true)
        },
      },
      {
        key: "last-7",
        label: "Oxirgi 7 kun",
        onClick: () => {
          const from = subDays(today, 6)
          setDraftRange({ from, to: today })
          setVisibleMonth(from)
          applyRange(from, today, true)
        },
      },
      {
        key: "this-month",
        label: "Shu oy",
        onClick: () => {
          const from = startOfMonth(today)
          setDraftRange({ from, to: today })
          setVisibleMonth(from)
          applyRange(from, today, true)
        },
      },
    ],
    [applyRange, today]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-9 w-full cursor-pointer justify-between rounded-xl border-input px-3 text-sm font-normal",
              className
            )}
          />
        }
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{formatTriggerLabel(parsedFrom, parsedTo)}</span>
        </span>
        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent
        align="center"
        sideOffset={8}
        className="w-[min(95vw,22rem)] min-w-[20rem] p-0"
      >
        <div className="border-b border-border px-2 py-2">
          <div className="grid grid-cols-3 gap-1.5">
            {presets.map((preset) => (
              <Button
                key={preset.key}
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 cursor-pointer justify-center rounded-lg px-2.5 text-[13px] leading-5 whitespace-nowrap"
                onClick={preset.onClick}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <Calendar
          mode="range"
          min={0}
          selected={selectedRange}
          month={visibleMonth}
          onMonthChange={setVisibleMonth}
          defaultMonth={parsedFrom ?? parsedTo ?? today}
          numberOfMonths={1}
          onSelect={(range) => {
            if (!range) {
              setDraftRange(undefined)
              setAwaitingRangeEnd(false)
              return
            }

            const isSingleDayPick =
              Boolean(range.from && range.to) && isSameDay(range.from as Date, range.to as Date)

            if (isSingleDayPick && !awaitingRangeEnd) {
              setDraftRange({ from: range.from, to: undefined })
              setAwaitingRangeEnd(true)
              return
            }

            setDraftRange(range)
            if (range.from && range.to) {
              setAwaitingRangeEnd(false)
              applyRange(range.from, range.to, true)
            }
          }}
        />

        <div className="border-t border-border px-2 py-2">
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 cursor-pointer rounded-lg px-3 text-[13px] leading-5"
              onClick={() => {
                setDraftRange(undefined)
                applyRange(undefined, undefined, true)
              }}
            >
              Tozalash
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
