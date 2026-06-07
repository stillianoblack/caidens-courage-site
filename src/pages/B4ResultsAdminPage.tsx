import { Navigate } from 'react-router-dom';
import { FACILITATOR_B4_RESULTS_PATH } from '../config/courageRoutes';

/** Legacy standalone route — redirects into Facilitator Portal shell. */
export default function B4ResultsAdminPage() {
  return <Navigate to={FACILITATOR_B4_RESULTS_PATH} replace />;
}
