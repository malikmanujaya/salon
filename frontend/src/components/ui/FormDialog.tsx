import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  alpha,
} from '@mui/material';

export type FormDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: () => void | Promise<void>;
  loading?: boolean;
  /** Primary button type when used inside a parent form — use "button" to avoid nested form issues */
  submitType?: 'submit' | 'button';
  maxWidth?: 'xs' | 'sm' | 'md';
};

/**
 * Shared shell for create/edit flows (stacked fields in `children`).
 */
export function FormDialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onSubmit,
  loading,
  submitType = 'button',
  maxWidth = 'sm',
}: FormDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth={maxWidth} fullWidth scroll="body">
      <DialogTitle sx={{ pb: 0.5 }}>
        {title}
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, fontWeight: 400 }}>
            {subtitle}
          </Typography>
        ) : null}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>{children}</Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
          gap: 1,
        }}
      >
        <Button type="button" onClick={onClose} color="inherit" disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          type={submitType}
          variant="contained"
          color="primary"
          disabled={loading}
          onClick={submitType === 'button' ? () => void onSubmit?.() : undefined}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
