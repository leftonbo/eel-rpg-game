import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { registerToastController, ToastRequest, ToastType, ToastUtils } from '../utils/ToastUtils';

const TOAST_AUTO_HIDE_MS = 4000;

interface ToastProviderProps {
    children: ReactNode;
}

interface ToastEntry extends ToastRequest {
    id: number;
}

function getToastBgClass(type: ToastType): string {
    switch (type) {
        case ToastType.Success:
            return 'bg-success';
        case ToastType.Error:
            return 'bg-danger';
        case ToastType.Warning:
            return 'bg-warning';
        case ToastType.Info:
        default:
            return 'bg-info';
    }
}

function getToastIcon(type: ToastType): string {
    switch (type) {
        case ToastType.Success:
            return '✅';
        case ToastType.Error:
            return '❌';
        case ToastType.Warning:
            return '⚠️';
        case ToastType.Info:
        default:
            return 'ℹ️';
    }
}

export function ToastProvider({ children }: ToastProviderProps): React.ReactElement {
    const [toasts, setToasts] = useState<ToastEntry[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    useEffect(() => {
        registerToastController({
            showToast: (request) => {
                setToasts((current) => [
                    ...current,
                    {
                        ...request,
                        id: Date.now() + Math.floor(Math.random() * 1000),
                    },
                ]);
            },
        });

        return () => registerToastController(null);
    }, []);

    return (
        <>
            {children}
            <ToastContainer position="bottom-end" className="position-fixed p-3">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        show
                        autohide
                        delay={TOAST_AUTO_HIDE_MS}
                        onClose={() => removeToast(toast.id)}
                    >
                        <Toast.Header className={`${getToastBgClass(toast.type)} text-white`}>
                            <span className="me-2">{getToastIcon(toast.type)}</span>
                            <strong className="me-auto">
                                {toast.title || ToastUtils.getDefaultTitle(toast.type)}
                            </strong>
                        </Toast.Header>
                        <Toast.Body>{toast.message}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </>
    );
}
