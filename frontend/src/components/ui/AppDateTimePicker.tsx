import { forwardRef } from 'react';
import { DateTimePicker, type DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import type { Dayjs } from 'dayjs';

export type AppDateTimePickerProps = Omit<DateTimePickerProps<Dayjs>, 'slotProps'> & {
  size?: 'small' | 'medium';
  required?: boolean;
  helperText?: React.ReactNode;
  error?: boolean;
  textFieldProps?: DateTimePickerProps<Dayjs>['slotProps'] extends infer S
    ? S extends { textField?: infer T }
      ? T
      : never
    : never;
};

/**
 * Project-wide date+time picker. Same visual language as {@link AppDatePicker},
 * with an extra rounded clock list for time selection.
 */
export const AppDateTimePicker = forwardRef<HTMLDivElement, AppDateTimePickerProps>(function AppDateTimePicker(
  {
    size = 'medium',
    required,
    helperText,
    error,
    textFieldProps,
    format = 'ddd, MMM D, YYYY · h:mm A',
    minutesStep = 5,
    ...rest
  },
  _ref,
) {
  return (
    <DateTimePicker
      {...rest}
      format={format}
      minutesStep={minutesStep}
      slotProps={{
        textField: {
          fullWidth: true,
          size,
          required,
          error,
          helperText,
          InputLabelProps: { shrink: true },
          ...textFieldProps,
        },
        popper: {
          sx: {
            '& .MuiPaper-root': {
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: (theme) => theme.shadows[16],
            },
          },
        },
        day: {
          sx: {
            borderRadius: 2,
            '&.Mui-selected': { fontWeight: 600 },
          },
        },
        digitalClockSectionItem: {
          sx: { borderRadius: 1.5 },
        },
      }}
    />
  );
});
