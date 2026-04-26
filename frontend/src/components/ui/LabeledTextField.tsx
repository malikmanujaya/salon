import { forwardRef } from 'react';
import { TextField, type TextFieldProps } from '@mui/material';

export type LabeledTextFieldProps = Omit<TextFieldProps, 'variant'> & {
  /** Shown above the field; forwarded to MUI `label`. */
  label: string;
  variant?: TextFieldProps['variant'];
};

/**
 * Opinionated outlined text field with label always sized for dense forms (adornments, placeholders).
 */
export const LabeledTextField = forwardRef<HTMLDivElement, LabeledTextFieldProps>(function LabeledTextField(
  { label, variant = 'outlined', InputLabelProps, ...rest },
  ref,
) {
  return (
    <TextField
      ref={ref}
      label={label}
      variant={variant}
      fullWidth
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      {...rest}
    />
  );
});
