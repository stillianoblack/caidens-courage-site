import { readActivePilotProgram } from '../config/activePilotProgram';
import { readParentClaimContext } from '../config/parentClaimContext';
import { readActivePortalRole, type PortalRole } from '../config/portalContext';
import { resolveFamilyPortalIdentityCode } from './portalGamePaths';

export type MobilePortalLogoKey = 'favcon_C' | 'Facilitator_logo';

export type MobilePortalBranding = {
  logo: MobilePortalLogoKey;
  logoSrc: string;
  title: string;
  dropdownLabel: string;
};

const publicUrl = process.env.PUBLIC_URL ?? '';

function asset(path: string): string {
  return `${publicUrl}${path}`;
}

const MOBILE_PORTAL_LOGO_SRC: Record<MobilePortalLogoKey, string> = {
  favcon_C: asset('/images/icons/favcon_C.svg'),
  Facilitator_logo: asset('/images/icons/Facilitator_logo.svg'),
};

function resolveFamilyMobileDropdownLabel(): string {
  const program = readActivePilotProgram();
  const identityCode =
    resolveFamilyPortalIdentityCode(program) ||
    readParentClaimContext()?.lastName?.trim() ||
    'Family';
  return identityCode.toUpperCase();
}

function resolveFacilitatorMobileDropdownLabel(): string {
  const program = readActivePilotProgram();
  return (
    program?.programName?.trim() ||
    program?.groupName?.trim() ||
    'Focus Flame Pilot'
  );
}

export function getMobilePortalBranding(input?: {
  familyDisplayName?: string | null;
  role?: PortalRole | null;
}): MobilePortalBranding | null {
  const role = input?.role ?? readActivePortalRole();

  if (role === 'family') {
    return {
      logo: 'favcon_C',
      logoSrc: MOBILE_PORTAL_LOGO_SRC.favcon_C,
      title: "Caiden's Courage",
      dropdownLabel: resolveFamilyMobileDropdownLabel(),
    };
  }

  if (role === 'facilitator') {
    return {
      logo: 'Facilitator_logo',
      logoSrc: MOBILE_PORTAL_LOGO_SRC.Facilitator_logo,
      title: 'Focus Flame Academy',
      dropdownLabel: resolveFacilitatorMobileDropdownLabel(),
    };
  }

  return null;
}
