// Session View Constants

export const SEND_COLOR = "#ff9500";
export const MASTER_COLOR = "#00d9ff";

export const SEND_TRACKS = [
  { id: "send-1", name: "Send 1", label: "FX Return" },
  { id: "send-2", name: "Send 2", label: "FX Return" },
] as const;

export type SendTrackId = (typeof SEND_TRACKS)[number]["id"];

// Helper to get send track info by ID
export function getSendTrackInfo(sendId: string) {
  const send = SEND_TRACKS.find((s) => s.id === sendId);
  if (!send) return null;

  return {
    name: send.name,
    color: SEND_COLOR,
    type: "send" as const,
    label: send.label,
  };
}
