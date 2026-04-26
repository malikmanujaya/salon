import { FormDialog, type FormDialogProps } from './FormDialog';

export type EditModalProps = Omit<FormDialogProps, 'title' | 'submitLabel'> & {
  title?: string;
  submitLabel?: string;
};

export function EditModal({
  title = 'Edit',
  submitLabel = 'Save changes',
  subtitle,
  ...rest
}: EditModalProps) {
  return <FormDialog title={title} submitLabel={submitLabel} subtitle={subtitle} {...rest} />;
}
