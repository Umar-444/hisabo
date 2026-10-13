// VAPID Configuration for Web Push Protocol
// Production keys can be configured via environment variables VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY
export const VAPID_CONFIG = {
  publicKey:
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U",
  privateKey:
    process.env.VAPID_PRIVATE_KEY ||
    "UUxI43scMhiE_ce2PpsA239q93Tf2XwNmsbHId8zH5Y",
  subject: process.env.VAPID_SUBJECT || "mailto:support@hisabo.com",
};

/**
 * Utility to convert base64url string to Uint8Array for pushManager.subscribe
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
