export type RewardPreset = {
  token: string;
  amount: string;
};

const WILDCARD_TOKEN = "WILDCARD";

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

export function isWildcardRewardPreset(reward: RewardPreset): boolean {
  return reward.token === WILDCARD_TOKEN;
}

export function countRewardMarkdownEntries(
  rewards: RewardPreset[],
  winnerCount: number
): number {
  return rewards
    .slice(0, Math.min(rewards.length, winnerCount))
    .filter((reward) => !isWildcardRewardPreset(reward)).length;
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
    .flatMap((reward, idx) =>
      isWildcardRewardPreset(reward)
        ? []
        : [`${reward.token}:${reward.amount}:${winners[idx].address}`]
    )
    .join(",");
}
