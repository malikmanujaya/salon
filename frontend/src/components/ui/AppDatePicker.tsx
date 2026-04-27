import { forwardRef } from 'react';
import { DatePicker, type DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';

export type AppDatePickerProps = Omit<DatePickerProps<Dayjs>, 'slotProps'> & {
  /**
   * Whether to render the picker compact (matches `size="small"` text fields).
   * Defaults to `false` so it lines up with `LabeledTextField`.
   */
  size?: 'small' | 'medium';
  /** Show the picker as a required field (asterisk + native validation). */
  required?: boolean;
  /** Helper text rendered below the field. */
  helperText?: React.ReactNode;
  /** Force the field into an error state. */
  error?: boolean;
  /** Override / extend the textfield slot props. */
  textFieldProps?: DatePickerProps<Dayjs>['slotProps'] extends infer S
    ? S extends { textField?: infer T }
      ? T
      : never
    : never;
};

/**
 * Project-wide date picker with the modern MUI X look + sensible defaults.
 *
 * - Always full width so it slots into form stacks like other inputs.
 * - Friendly default format (`Mon, Apr 28, 2026`).
 * - Rounded popper, rounded selected day, soft shadow.
 */
export const AppDatePicker = forwardRef<HTMLDivElement, AppDatePickerProps>(function AppDatePicker(
  { size = 'medium', required, helperText, error, textFieldProps, format = 'ddd, MMM D, YYYY', ...rest },
  _ref,
) {
  return (
    <DatePicker
      {...rest}
      format={format}
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
      }}
    />
  );
});
