import { useCallback, useMemo, useState } from 'react';
import { Box, GlobalStyles, alpha, useTheme, type Theme } from '@mui/material';
import dayjs from 'dayjs';
import {
  Calendar,
  dayjsLocalizer,
  Views,
  type View,
  type SlotInfo,
} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { palette } from '@/theme/palette';
import type { BookingDetail } from '@/types/booking';

const localizer = dayjsLocalizer(dayjs);

type BookingEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: BookingDetail;
};

type Props = {
  bookings: BookingDetail[];
  onSelectBooking: (b: BookingDetail) => void;
  onSelectSlot?: (start: Date) => void;
  /** Initial visible date; defaults to today. */
  defaultDate?: Date;
};

/**
 * Polished react-big-calendar wrapper that matches the brand palette.
 * Uses dayjs (already a project dep) so we don't pull moment/date-fns.
 */
export function BookingsCalendar({
  bookings,
  onSelectBooking,
  onSelectSlot,
  defaultDate,
}: Props) {
  const theme = useTheme();

  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState<Date>(defaultDate ?? new Date());

  const events = useMemo<BookingEvent[]>(
    () =>
      bookings.map((b) => ({
        id: b.id,
        title: `${b.customer.fullName} · ${b.services.map((s) => s.service.name).join(', ') || 'Booking'}`,
        start: new Date(b.startTime),
        end: new Date(b.endTime),
        resource: b,
      })),
    [bookings],
  );

  const eventStyleGetter = useCallback(
    (event: BookingEvent) => {
      const tone = statusTone(event.resource.status, theme.palette);
      return {
        style: {
          backgroundColor: alpha(tone, 0.16),
          color: tone,
          borderLeft: `3px solid ${tone}`,
          border: 'none',
          borderRadius: 6,
          padding: '6px 8px',
          minHeight: 40,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.25,
          boxShadow: `0 1px 2px ${alpha(palette.purpleDeep, 0.08)}`,
        },
      };
    },
    [theme.palette],
  );

  const handleSelectSlot = useCallback(
    (info: SlotInfo) => {
      onSelectSlot?.(info.start as Date);
    },
    [onSelectSlot],
  );

  return (
    <>
      <GlobalStyles styles={calendarOverrides(theme.palette.primary.main)} />
      <Box
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
          bgcolor: 'background.paper',
          boxShadow: `0 1px 0 ${alpha(palette.purpleDeep, 0.04)} inset`,
          height: 'calc(100vh - 220px)',
          minHeight: 560,
          '& .rbc-calendar': { height: '100%' },
        }}
      >
        <Calendar<BookingEvent>
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          step={15}
          timeslots={4}
          popup
          selectable
          longPressThreshold={250}
          onSelectEvent={(e) => onSelectBooking(e.resource)}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          formats={calendarFormats}
          dayLayoutAlgorithm="no-overlap"
          scrollToTime={dayjs().hour(8).minute(0).second(0).toDate()}
        />
      </Box>
    </>
  );
}

function statusTone(status: string, p: Theme['palette']): string {
  switch (status) {
    case 'CONFIRMED':
      return p.success.main;
    case 'PENDING':
      return p.warning.main;
    case 'COMPLETED':
      return p.info.main;
    case 'CANCELLED':
    case 'NO_SHOW':
      return p.error.main;
    default:
      return p.primary.main;
  }
}

const calendarFormats = {
  timeGutterFormat: 'h A',
  eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${dayjs(start).format('h:mm A')} – ${dayjs(end).format('h:mm A')}`,
  selectRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${dayjs(start).format('h:mm A')} – ${dayjs(end).format('h:mm A')}`,
  dayFormat: 'ddd D',
  weekdayFormat: 'ddd',
  dayHeaderFormat: 'dddd, MMM D',
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${dayjs(start).format('MMM D')} – ${dayjs(end).format('MMM D, YYYY')}`,
  monthHeaderFormat: 'MMMM YYYY',
  agendaDateFormat: 'ddd MMM D',
  agendaTimeFormat: 'h:mm A',
  agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${dayjs(start).format('h:mm A')} – ${dayjs(end).format('h:mm A')}`,
};

/**
 * Brand-aware overrides for react-big-calendar's default CSS.
 * Keeps the library's structure but warms it up to match the salon theme.
 */
function calendarOverrides(primary: string) {
  const soft = alpha(primary, 0.08);
  const softer = alpha(primary, 0.04);
  return {
    '.rbc-toolbar': {
      padding: '12px 16px',
      gap: 8,
      borderBottom: `1px solid ${alpha(palette.purpleDeep, 0.08)}`,
      background: `linear-gradient(180deg, ${alpha(palette.ivory, 0.7)} 0%, ${alpha(palette.white, 1)} 100%)`,
    },
    '.rbc-toolbar .rbc-toolbar-label': {
      fontFamily: '"Playfair Display", serif',
      fontSize: 18,
      fontWeight: 700,
      color: palette.purpleDeep,
    },
    '.rbc-toolbar button': {
      borderRadius: 8,
      border: `1px solid ${alpha(palette.purpleDeep, 0.15)}`,
      color: palette.purpleDeep,
      background: 'transparent',
      padding: '6px 12px',
      fontWeight: 600,
      transition: 'all 120ms ease',
    },
    '.rbc-toolbar button:hover, .rbc-toolbar button:focus': {
      background: soft,
      borderColor: alpha(primary, 0.4),
      color: primary,
    },
    '.rbc-toolbar button.rbc-active': {
      background: primary,
      borderColor: primary,
      color: '#fff',
      boxShadow: `0 4px 14px ${alpha(primary, 0.3)}`,
    },
    '.rbc-toolbar button.rbc-active:hover': {
      background: primary,
      color: '#fff',
    },

    '.rbc-header': {
      padding: '10px 6px',
      fontWeight: 700,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      fontSize: 11,
      color: alpha(palette.purpleDeep, 0.7),
      borderBottom: `1px solid ${alpha(palette.purpleDeep, 0.08)}`,
      background: softer,
    },
    '.rbc-time-header.rbc-overflowing': {
      borderRight: 'none',
    },
    '.rbc-time-view, .rbc-month-view, .rbc-agenda-view': {
      border: 'none',
    },
    '.rbc-time-content': { borderTop: `1px solid ${alpha(palette.purpleDeep, 0.08)}` },
    '.rbc-time-slot': { color: alpha(palette.purpleDeep, 0.5) },
    '.rbc-timeslot-group': {
      borderBottom: `1px solid ${alpha(palette.purpleDeep, 0.06)}`,
    },
    '.rbc-day-slot .rbc-time-slot': {
      borderTop: `1px dashed ${alpha(palette.purpleDeep, 0.05)}`,
    },
    '.rbc-today': { backgroundColor: softer },
    '.rbc-current-time-indicator': {
      backgroundColor: primary,
      height: 2,
    },

    '.rbc-event, .rbc-day-slot .rbc-background-event': {
      outline: 'none',
    },
    '.rbc-day-slot .rbc-event': {
      minHeight: 40,
      display: 'flex',
      alignItems: 'center',
    },
    '.rbc-event-label': {
      minWidth: 72,
      fontWeight: 700,
    },
    '.rbc-event-content': {
      whiteSpace: 'normal',
      lineHeight: 1.25,
    },
    '.rbc-event:focus, .rbc-event.rbc-selected': {
      outline: `2px solid ${alpha(primary, 0.6)}`,
      outlineOffset: 1,
    },

    '.rbc-show-more': {
      color: primary,
      fontWeight: 600,
    },

    '.rbc-off-range-bg': {
      backgroundColor: alpha(palette.ivory, 0.6),
    },
    '.rbc-month-row + .rbc-month-row, .rbc-day-bg + .rbc-day-bg, .rbc-header + .rbc-header': {
      borderColor: alpha(palette.purpleDeep, 0.06),
    },
  } as const;
}
