
// פונקציה להמרת VAPID key לפורמט הנכון
export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// VAPID key אמיתי - זה key demo שעובד, בסביבת ייצור צריך להחליף
export const VAPID_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI8YlOU2jKqbNI10oIBABwNLR5n_qrCKJI4ZEtZ7FKZ_PD_WiKoaFa5cHE';
