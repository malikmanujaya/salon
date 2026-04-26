import { Autocomplete, type AutocompleteProps, TextField, type TextFieldProps } from '@mui/material';

export type SearchableOption = {
  value: string;
  label: string;
};

export type SearchableDropdownProps = Omit<
  AutocompleteProps<SearchableOption, false, false, false>,
  'renderInput' | 'options'
> & {
  label: string;
  options: SearchableOption[];
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  textFieldProps?: Partial<TextFieldProps>;
};

/**
 * Searchable single-select built on MUI Autocomplete + outlined field.
 */
export function SearchableDropdown({
  label,
  options,
  placeholder,
  error,
  helperText,
  required,
  textFieldProps,
  ...autoProps
}: SearchableDropdownProps) {
  return (
    <Autocomplete<SearchableOption, false, false, false>
      options={options}
      getOptionLabel={(o) => o?.label ?? ''}
      isOptionEqualToValue={(a, b) => a?.value === b?.value}
      {...autoProps}
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
          InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
        />
      )}
    />
  );
}
