import { Navigate, useSearchParams } from 'react-router-dom';
import { PORTAL_PATH } from '../config/courageRoutes';

/** Legacy claim URLs → portal claim deep link (preserves ?code=). */
export default function FamilyClaimRedirect() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code')?.trim();
  const next = code
    ? `${PORTAL_PATH}?code=${encodeURIComponent(code)}&audience=parents&claim=1`
    : `${PORTAL_PATH}?audience=parents&claim=1`;
  return <Navigate to={next} replace />;
}
