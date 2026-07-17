import {
  lookupPilotProgramByAccessCodeDetailed,
  type PilotProgramLookupResponse,
} from './pilotProgramService';
import type { PortalProgramAccessIntent } from './portalProgramAccessApi';

export type PortalClaimCodeContext = {
  participantId: string;
  childDisplayName: string;
  campProgramCode: string;
};

export type PortalProgramLookupResponse = PilotProgramLookupResponse & {
  claimCodeContext?: PortalClaimCodeContext;
};

/** Resolve program from family access code, program code, or per-student family claim code. */
export async function lookupPortalProgramByAccessCodeDetailed(
  rawCode: string,
  options: { intent?: PortalProgramAccessIntent; credential?: string } = {},
): Promise<PortalProgramLookupResponse> {
  return lookupPilotProgramByAccessCodeDetailed(rawCode, options);
}
