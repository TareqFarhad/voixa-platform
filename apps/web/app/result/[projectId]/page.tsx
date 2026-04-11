import ResultClient from './result-client';

export function generateStaticParams() {
  return [{ projectId: 'demo' }];
}

export const dynamicParams = false;

export default function Page() {
  return <ResultClient />;
}
