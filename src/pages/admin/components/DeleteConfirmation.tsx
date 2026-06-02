import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد الحذف',
  message = 'هل أنت متأكد من أنك تريد حذف هذا العنصر؟ هذا الإجراء لا يمكن التراجع عنه.',
  isLoading = false
}: DeleteConfirmationProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-gray-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            حذف
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            إلغاء
          </Button>
        </div>
      </div>
    </Modal>
  );
}
