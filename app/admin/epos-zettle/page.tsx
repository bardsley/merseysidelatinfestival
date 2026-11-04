import type { Metadata } from 'next';
import Layout from '@components/layout/layout';
import { Container } from '@components/layout/container';
import Navigation from '@components/admin/navigation';
import ZettleTill from '@components/admin/till-zettle';

export const metadata: Metadata = {
  title: 'Zettle backup till',
  robots: { index: false, follow: false },
};

// Deliberately unlisted: open /admin/epos-zettle directly when the backup is needed.
export default function ZettleTillPage() {
  return (
    <Layout>
      <section className="flex-1 relative transition duration-150 ease-out body-font overflow-hidden bg-none text-white">
        <Container width="large" padding="tight" className="flex-1 pb-2" size="top">
          <Navigation pages={[
            { name: 'Admin', href: '/admin', current: false },
            { name: 'Zettle backup till', href: '/admin/epos-zettle', current: true },
          ]} />
        </Container>
        <Container width="large" padding="tight" className="flex-1 pb-2" size="none">
          <ZettleTill />
        </Container>
      </section>
    </Layout>
  );
}
