export interface Feedback {
  id: string;
  page_path: string;
  selected_text: string;
  comment: string;
  display_name: string;
  created_at: string;
}

export interface NewFeedback {
  page_path: string;
  selected_text: string;
  comment: string;
  display_name?: string;
}

const endpoint = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url: `${url}/rest/v1/feedbacks`, key };
};

export async function getFeedbacks(): Promise<Feedback[]> {
  const config = endpoint();
  if (!config) throw new Error("Feedback storage is not configured yet.");
  const all: Feedback[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const response = await fetch(
      `${config.url}?select=id,page_path,selected_text,comment,display_name,created_at&order=created_at.desc&limit=${pageSize}&offset=${offset}`,
      { headers: { apikey: config.key }, cache: "no-store" },
    );
    if (!response.ok) throw new Error("Could not load feedback right now.");
    const page = (await response.json()) as Feedback[];
    all.push(...page);
    if (page.length < pageSize) return all;
  }
}

export async function createFeedback(feedback: NewFeedback): Promise<void> {
  const config = endpoint();
  if (!config) throw new Error("Feedback storage is not configured yet.");
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      apikey: config.key,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(feedback),
  });
  if (!response.ok) throw new Error("Could not save feedback right now.");
}
