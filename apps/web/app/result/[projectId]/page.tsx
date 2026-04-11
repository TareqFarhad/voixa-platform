import ResultClient from './result-client';

export function generateStaticParams() {
  return [{ projectId: 'demo' }];
}

export const dynamicParams = true;

export default function Page() {
  return <ResultClient />;
}
