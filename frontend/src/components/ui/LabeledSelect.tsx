import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  type SelectProps,
} from '@mui/material';

export type LabeledSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type LabeledSelectProps = Omit<SelectProps<string>, 'label' | 'variant' | 'children'> & {
  label: string;
  options: LabeledSelectOption[];
  helperText?: string;
  error?: boolean;
  required?: boolean;
  id?: string;
};

export function LabeledSelect({
  label,
  options,
  helperText,
  error,
  required,
  id: idProp,
  fullWidth = true,
  ...selectProps
}: LabeledSelectProps) {
  const id = idProp ?? `select-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <FormControl fullWidth={fullWidth} error={error} required={required} variant="outlined" size={selectProps.size}>
      <InputLabel id={`${id}-label`} shrink>
        {label}
      </InputLabel>
      <Select<string>
        labelId={`${id}-label`}
        id={id}
        label={label}
        displayEmpty
        {...selectProps}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}

export type { SelectChangeEvent };
