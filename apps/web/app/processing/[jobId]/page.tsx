import ProcessingClient from './processing-client';

export function generateStaticParams() {
  return [{ jobId: 'demo' }];
}

export const dynamicParams = true;

export default function Page() {
  return <ProcessingClient />;
}
