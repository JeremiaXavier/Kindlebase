import ConfirmModal from '@/components/models/confirm';
import React, { createContext, useContext, useState } from 'react';

interface ConfirmModalProps {
    isOpen: boolean; // We will manage this internally
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

interface ConfirmContextType {
    showConfirmation: (options: Omit<ConfirmModalProps, 'isOpen'>) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalOptions, setModalOptions] = useState<Omit<ConfirmModalProps, 'isOpen'>>({
        message: '',
        onConfirm: () => { },
        onCancel: () => { },
    });

    const showConfirmation = (options: Omit<ConfirmModalProps, 'isOpen'>) => {
        setModalOptions(options);
        setIsOpen(true);
    };

    const handleConfirm = () => {
        modalOptions.onConfirm();
        setIsOpen(false);
    };

    const handleCancel = () => {
        modalOptions.onCancel();
        setIsOpen(false);
    };

    const contextValue = {
        showConfirmation,
    };

    return (
        <ConfirmContext.Provider value={contextValue}>
            {children}
            <ConfirmModal
                isOpen={isOpen}
                title={modalOptions.title}
                message={modalOptions.message}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
};

const useConfirmation = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirmation must be used within a ConfirmProvider');
    }
    return context.showConfirmation;
};

export { ConfirmProvider, useConfirmation }; //  named exports