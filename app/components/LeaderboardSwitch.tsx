"use client";

import React from "react";
import ReputationLeaderboard from "../ReputationLeaderboard";

type Props = {
  programId: string;
  activeDaoIdBase58: string;
  activeSeason?: number;
  endpoint?: string;
  meta?: any;
  resolvedTheme?: any;
  refreshNonce?: number;
};

export default function LeaderboardSwitch(props: Props) {
  return (
    <ReputationLeaderboard
      programId={props.programId}
      activeDaoIdBase58={props.activeDaoIdBase58}
      activeSeason={props.activeSeason}
      endpoint={props.endpoint}
      refreshNonce={props.refreshNonce}
    />
  );
}
