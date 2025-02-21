// components/ui/Dialog.tsx

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DialogTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
};

// Named exports for both Dialog and DialogTrigger
export { Dialog, DialogTrigger };

