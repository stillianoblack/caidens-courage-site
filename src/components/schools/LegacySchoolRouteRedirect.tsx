import { Navigate, useLocation } from 'react-router-dom';
import { LEGACY_SCHOOL_HASH_MAP, SCHOOLS_PATH } from '../../config/schoolsPaths';

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

/** /camp-courage redirects to the dedicated camps marketing page. */
export function LegacyCampCourageRedirect() {
  return <Navigate to="/camps" replace />;
}
