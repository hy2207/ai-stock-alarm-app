import { prisma } from "@/lib/prisma";
import type { SignalScores } from "./computeSignals";

export interface EvidenceSnapshotInput {
  recId: string;
  signals: SignalScores;
}

export interface PersistSnapshotsResultOk {
  ok: true;
  count: number;
}

export interface PersistSnapshotsResultError {
  ok: false;
  count: number;
  error: string;
}

export type PersistSnapshotsResult =
  | PersistSnapshotsResultOk
  | PersistSnapshotsResultError;

export async function persistEvidenceSnapshots(
  snapshots: EvidenceSnapshotInput[],
): Promise<PersistSnapshotsResult> {
  if (snapshots.length === 0) {
    return { ok: false, count: 0, error: "No snapshot data provided" };
  }

  const data = snapshots.map((s) => ({
    recId: s.recId,
    newsSignalScore: s.signals.newsSignalScore,
    volumeSignalScore: s.signals.volumeSignalScore,
    communitySignalScore: s.signals.communitySignalScore,
    patternTag: s.signals.patternTag,
  }));

  try {
    await prisma.evidenceSnapshot.createMany({ data });
    return { ok: true, count: data.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { ok: false, count: 0, error: message };
  }
}
