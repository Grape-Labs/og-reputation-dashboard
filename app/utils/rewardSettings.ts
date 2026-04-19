export type RewardPreset = {
  token: string;
  amount: string;
};

export type RewardSettings = {
  presetText: string;
};

const LS_KEY = "grape_reward_settings_v1";

const DEFAULT_SETTINGS: RewardSettings = {
  presetText: "",
};

export function parseRewardPresetText(input: string): RewardPreset[] {
  return String(input || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry) => {
      const [tokenRaw, ...amountParts] = entry.split(":");
      const token = String(tokenRaw || "").trim().toUpperCase();
      const amount = amountParts.join(":").trim();

      if (!token || !amount) return [];

      return [{ token, amount }];
    });
}

export function readRewardSettings(): RewardSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<RewardSettings>;
    return {
      presetText: String(parsed.presetText || ""),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeRewardSettings(next: RewardSettings) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    LS_KEY,
    JSON.stringify({
      presetText: String(next.presetText || ""),
    })
  );

  window.dispatchEvent(new CustomEvent("grape:reward-settings"));
}

export function buildRewardMarkdown(
  rewards: RewardPreset[],
  winners: Array<{ address: string }>
): string {
  const matched = Math.min(rewards.length, winners.length);
  if (matched === 0) return "";

  return rewards
    .slice(0, matched)
    .map((reward, idx) => `${reward.token}:${reward.amount}:${winners[idx].address}`)
    .join(",");
}
