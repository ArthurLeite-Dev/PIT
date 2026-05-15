// Admin SDK não tem withConverter como o client SDK.
// Este helper centraliza "casts" seguros dos snapshots do Admin Firestore.

export function fromDoc<T extends object>(data: FirebaseFirestore.DocumentData | undefined): T {
  return (data ?? {}) as T;
}

export function now(): Date {
  return new Date();
}
