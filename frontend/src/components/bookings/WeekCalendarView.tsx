import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';

import { palette } from '@/theme/palette';
import type { BookingDetail } from '@/types/booking';
import { addDays } from '@/lib/datetimeLocal';

const START_HOUR = 0;
const END_HOUR = 23;
const PX_PER_HOUR = 56;
const TIME_COL_WIDTH = 64;
const HEADER_HEIGHT = 56;

type Props = {
  weekStartMonday: Date;
  bookings: BookingDetail[];
  onSelectBooking: (b: BookingDetail) => void;
  onSelectSlot?: (day: Date, hour: number) => void;
};

function sameLocalDay(a: Date, day: Date): boolean {
  return (
    a.getFullYear() === day.getFullYear() &&
    a.getMonth() === day.getMonth() &&
    a.getDate() === day.getDate()
  );
}

function minutesSinceDayStart(d: Date, day: Date): number {
  if (!sameLocalDay(d, day)) return 0;
  return d.getHours() * 60 + d.getMinutes();
}

/** Format an integer hour (0–23) as a short, locale-friendly label like "9 AM" or "21:00". */
function formatHourLabel(h: number): string {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d
    .toLocaleTimeString(undefined, { hour: 'numeric' })
    .replace(/\s/g, ' ')
    .trim();
}

const TOTAL_HOURS = END_HOUR - START_HOUR + 1;
const GRID_HEIGHT = TOTAL_HOURS * PX_PER_HOUR;

function layoutForDay(day: Date, bookings: BookingDetail[]) {
  const dayStartMin = START_HOUR * 60;
  const dayEndMin = (END_HOUR + 1) * 60;
  const totalMin = dayEndMin - dayStartMin;

  const items = bookings
    .filter((b) => sameLocalDay(new Date(b.startTime), day))
    .map((b) => {
      const s = new Date(b.startTime);
      const e = new Date(b.endTime);
      const startMin = Math.max(minutesSinceDayStart(s, day), dayStartMin);
      const endMin = Math.min(minutesSinceDayStart(e, day), dayEndMin);
      const dur = Math.max(endMin - startMin, 15);
      const top = ((startMin - dayStartMin) / totalMin) * GRID_HEIGHT;
      const h = (dur / totalMin) * GRID_HEIGHT;
      return { b, top, h: Math.max(h, 26) };
    });

  return { items };
}

export function WeekCalendarView({ weekStartMonday, bookings, onSelectBooking, onSelectSlot }: Props) {
  const theme = useTheme();
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStartMonday, i)),
    [weekStartMonday],
  );

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  /** Auto-scroll once on mount: bring 8 AM (or "now" if it falls in the visible week) into view. */
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const todayInWeek = days.some((d) => sameLocalDay(now, d));
    const focusHour = todayInWeek ? Math.max(START_HOUR, now.getHours() - 1) : 8;
    const top = (focusHour - START_HOUR) * PX_PER_HOUR;
    el.scrollTop = Math.max(top - 24, 0);
    // Run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayMinutes =
    now.getHours() * 60 + now.getMinutes() - START_HOUR * 60;
  const nowOffsetPx = (todayMinutes / (TOTAL_HOURS * 60)) * GRID_HEIGHT;

  return (
    <Box
      ref={scrollerRef}
      sx={{
        borderRadius: 3,
        border: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
        overflow: 'auto',
        bgcolor: 'background.paper',
        maxHeight: 'calc(100vh - 240px)',
        minHeight: 480,
        position: 'relative',
        boxShadow: `0 1px 0 ${alpha(palette.purpleDeep, 0.04)} inset`,
      }}
    >
      <Box sx={{ display: 'flex', minWidth: 880, position: 'relative' }}>
        {/* Time column */}
        <Box
          sx={{
            width: TIME_COL_WIDTH,
            flexShrink: 0,
            position: 'sticky',
            left: 0,
            zIndex: 3,
            bgcolor: 'background.paper',
            borderRight: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
          }}
        >
          {/* Spacer to align with day header */}
          <Box
            sx={{
              height: HEADER_HEIGHT,
              borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              zIndex: 4,
            }}
          />
          {Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i).map((h) => (
            <Box
              key={h}
              sx={{
                height: PX_PER_HOUR,
                position: 'relative',
                pr: 1.25,
                textAlign: 'right',
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: 8,
                  px: 0.5,
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  bgcolor: 'background.paper',
                }}
              >
                {formatHourLabel(h)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Day columns */}
        <Box sx={{ flex: 1, display: 'flex', minWidth: 0 }}>
          {days.map((day) => {
            const isToday = sameLocalDay(now, day);
            const { items } = layoutForDay(day, bookings);
            return (
              <Box
                key={day.toISOString()}
                sx={{
                  flex: 1,
                  minWidth: 120,
                  borderRight: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
                  '&:last-of-type': { borderRight: 'none' },
                  bgcolor: isToday ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    px: 1,
                    height: HEADER_HEIGHT,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    bgcolor: isToday
                      ? alpha(theme.palette.primary.main, 0.06)
                      : alpha(palette.purple, 0.03),
                    backdropFilter: 'saturate(180%) blur(2px)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      letterSpacing: 1.2,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: isToday ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {day.toLocaleDateString(undefined, { weekday: 'short' })}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {isToday ? (
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={800}>
                          {day.getDate()}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="subtitle1" fontWeight={700}>
                        {day.getDate()}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ position: 'relative', height: GRID_HEIGHT }}>
                  {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                    <Box
                      key={i}
                      sx={{
                        height: PX_PER_HOUR,
                        position: 'relative',
                        borderBottom: (t) =>
                          `1px solid ${alpha(t.palette.divider, 0.55)}`,
                        cursor: onSelectSlot ? 'pointer' : 'default',
                        transition: 'background-color 120ms ease',
                        '&:hover': onSelectSlot
                          ? { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                          : undefined,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: '50%',
                          borderTop: (t) => `1px dashed ${alpha(t.palette.divider, 0.5)}`,
                          pointerEvents: 'none',
                        },
                      }}
                      onClick={() => onSelectSlot?.(day, START_HOUR + i)}
                    />
                  ))}

                  {isToday && nowOffsetPx >= 0 && nowOffsetPx <= GRID_HEIGHT ? (
                    <Box
                      aria-hidden
                      sx={{
                        position: 'absolute',
                        top: nowOffsetPx,
                        left: 0,
                        right: 0,
                        height: 0,
                        borderTop: `2px solid ${theme.palette.error.main}`,
                        zIndex: 2,
                        pointerEvents: 'none',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: -5,
                          top: -5,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: theme.palette.error.main,
                        },
                      }}
                    />
                  ) : null}

                  {items.map(({ b, top, h }) => (
                    <Box
                      key={b.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBooking(b);
                      }}
                      sx={{
                        position: 'absolute',
                        left: 6,
                        right: 6,
                        top,
                        height: h,
                        borderRadius: 1.5,
                        px: 1,
                        py: 0.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                        boxShadow: `0 1px 2px ${alpha(theme.palette.primary.main, 0.15)}`,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        zIndex: 1,
                        transition: 'transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 3,
                          bgcolor: theme.palette.primary.main,
                          borderTopLeftRadius: 'inherit',
                          borderBottomLeftRadius: 'inherit',
                        },
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                          boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Typography variant="caption" fontWeight={700} noWrap display="block" sx={{ pl: 0.75 }}>
                        {b.customer.fullName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        display="block"
                        sx={{ pl: 0.75 }}
                      >
                        {new Date(b.startTime).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                        {' – '}
                        {new Date(b.endTime).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
