import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Textarea from '../common/Textarea';

const CompleteModal = ({ appointment, isOpen, onClose, onConfirm, loading }) => {
  const [notes, setNotes] = useState('');

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  const handleSubmit = () => {
    onConfirm(notes);
    setNotes('');
  };

  if (!appointment) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Mark appointment as completed">
      <p className="text-sm text-slate-500">
        Consultation with <span className="font-medium text-slate-800">{appointment.patient.user.name}</span>
      </p>
      <div className="mt-4">
        <Textarea
          label="Consultation notes (optional)"
          placeholder="Diagnosis, prescription, follow-up instructions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
        />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button variant="success" onClick={handleSubmit} loading={loading}>Mark Completed</Button>
      </div>
    </Modal>
  );
};

export default CompleteModal;
