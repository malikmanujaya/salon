import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from '@mui/material';

export type DeleteConfirmModalProps = {
  open: boolean;
  title?: string;
  /** e.g. booking name */
  entityLabel?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function DeleteConfirmModal({
  open,
  title = 'Delete this item?',
  entityLabel,
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  loading,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          {entityLabel ? (
            <>
              You are about to remove <strong>{entityLabel}</strong>. {description}
            </>
          ) : (
            description
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button onClick={() => void onConfirm()} color="error" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={22} color="inherit" /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
