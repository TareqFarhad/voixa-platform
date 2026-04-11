import ProcessingClient from './processing-client';

export function generateStaticParams() {
  return [{ jobId: 'demo' }];
}

export const dynamicParams = false;

export default function Page() {
  return <ProcessingClient />;
}
