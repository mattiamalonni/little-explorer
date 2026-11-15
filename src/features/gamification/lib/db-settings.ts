import type { GameSetting as GameSettingRecord } from "@/generated/prisma/client";
import { normalizeGameSetting, settingKey, type GameSetting, type GameSettings } from "@/features/gamification/lib/game-settings";
import type { World } from "@/features/gamification/lib/progress";

export type GameSettingData = {
  selected: string[];
  roundLength: number;
  limit: number | null;
};

export function gameSettingFromRecord(record: GameSettingRecord): GameSetting {
  return normalizeGameSetting({
    selected: record.selected.length > 0 ? record.selected : null,
    roundLength: record.roundLength,
    limit: record.limit,
  });
}

export function gameSettingsFromRecords(records: readonly GameSettingRecord[]): GameSettings {
  const settings: GameSettings = {};
  for (const record of records) {
    settings[settingKey(record.world as World, record.gameId)] = gameSettingFromRecord(record);
  }
  return settings;
}

export function gameSettingToRecordData(setting: GameSetting): GameSettingData {
  return {
    selected: setting.selected ?? [],
    roundLength: setting.roundLength,
    limit: setting.limit,
  };
}
