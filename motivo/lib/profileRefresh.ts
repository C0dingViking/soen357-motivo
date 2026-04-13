type Listener = () => void;

const listeners = new Set<Listener>();

export const subscribeProfileRefresh = (listener: Listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const notifyProfileRefresh = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error('Profile refresh listener failed:', error);
    }
  });
};
