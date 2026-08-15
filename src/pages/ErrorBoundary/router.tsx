import { useRouteError } from 'react-router';
import ErrorBoundaryBase from './base';

export default function RouterErrorBoundary() {
  const error = useRouteError() as Error;
  console.error(error.message);
  return <ErrorBoundaryBase error={error.message} errorInfo={error.stack} />;
}
