export interface ExpoPushMessage {
  to: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

export interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

export async function sendExpoPush(
  messages: ExpoPushMessage[]
): Promise<ExpoPushTicket[]> {
  const resp = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(messages),
  });
  if (!resp.ok) {
    throw new Error(`Expo Push API error: ${resp.status}`);
  }
  const json = await resp.json();
  return json.data as ExpoPushTicket[];
}
