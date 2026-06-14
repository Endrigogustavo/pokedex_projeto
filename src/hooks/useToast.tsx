import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';

type ToastType = 'success' | 'error' | 'info';

type ToastContextData = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

const COLORS: Record<ToastType, string> = {
  success: '#2E9E5B',
  error: '#C62828',
  info: '#1B1B1F',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');

  const showToast = useCallback((msg: string, kind: ToastType = 'info') => {
    setMessage(msg);
    setType(kind);
    setVisible(true);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: COLORS[type] }]}
        action={{ label: 'OK', onPress: () => setVisible(false), textColor: '#fff' }}
      >
        {message}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextData {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  snackbar: {
    margin: 16,
    borderRadius: 12,
  },
});
