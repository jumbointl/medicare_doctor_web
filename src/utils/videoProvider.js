export function isGoogleMeetProvider(provider) {
  return ["google", "google_meet"].includes(String(provider || "").toLowerCase());
}

export function isAgoraProvider(provider) {
  return String(provider || "").toLowerCase() === "agora";
}