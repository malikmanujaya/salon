import { FormDialog, type FormDialogProps } from './FormDialog';

export type CreateModalProps = Omit<FormDialogProps, 'title' | 'submitLabel'> & {
  title?: string;
  submitLabel?: string;
};

export function CreateModal({
  title = 'Create',
  submitLabel = 'Create',
  subtitle,
  ...rest
}: CreateModalProps) {
  return <FormDialog title={title} submitLabel={submitLabel} subtitle={subtitle} {...rest} />;
}
