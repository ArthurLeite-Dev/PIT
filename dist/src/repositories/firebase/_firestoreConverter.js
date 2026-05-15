// Admin SDK não tem withConverter como o client SDK.
// Este helper centraliza "casts" seguros dos snapshots do Admin Firestore.
export function fromDoc(data) {
    return (data ?? {});
}
export function now() {
    return new Date();
}
