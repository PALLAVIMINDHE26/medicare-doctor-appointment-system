import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Textarea from './Textarea';
import { useState } from 'react';

/**
 * A focused confirm dialog used for cancel/reject/approve/delete flows
 * throughout the app. Optionally collects a reason (e.g. cancellation
 * reason) before confirming.
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  requireReason = false,
  reasonLabel = 'Reason (optional)',
  loading = false,
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(requireReason ? reason : undefined);
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-slate-600">{message}</p>
      </div>

      {requireReason && (
        <div className="mt-4">
          <Textarea
            label={reasonLabel}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Let them know why..."
          />
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Go back
        </Button>
        <Button variant={variant} onClick={handleConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
