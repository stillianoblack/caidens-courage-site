import { Navigate, useLocation } from 'react-router-dom';
import { LEGACY_SCHOOL_HASH_MAP, SCHOOLS_PATH, SCHOOLS_PILOT_HASH } from '../../config/schoolsPaths';

type LegacySchoolRouteRedirectProps = {
  /** Default hash when the legacy path has no hash (e.g. /camp-courage). */
  defaultHash?: string;
};

export default function LegacySchoolRouteRedirect({ defaultHash }: LegacySchoolRouteRedirectProps) {
  const { hash } = useLocation();
  const raw = hash.replace('#', '');
  const mapped = raw ? LEGACY_SCHOOL_HASH_MAP[raw] ?? raw : defaultHash ?? '';
  const target = mapped ? `${SCHOOLS_PATH}#${mapped}` : SCHOOLS_PATH;
  return <Navigate to={target} replace />;
}

/** /camp-courage with no hash lands on the pilot section. */
export function LegacyCampCourageRedirect() {
  return <LegacySchoolRouteRedirect defaultHash={SCHOOLS_PILOT_HASH} />;
}
