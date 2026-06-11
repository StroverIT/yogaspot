import { Body, Container, Head, Html, Link, Preview, Section, Text } from '@react-email/components';

export type StudioSubscriptionBuyerEmailProps = {
  preview: string;
  headline: string;
  lines: string[];
  studioUrl?: string;
  priceDual?: string | null;
};

export function StudioSubscriptionBuyerEmail({
  preview,
  headline,
  lines,
  studioUrl,
  priceDual,
}: StudioSubscriptionBuyerEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ margin: '0 auto', padding: '24px 0 48px', maxWidth: '560px' }}>
          <Section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 600, color: '#111' }}>{headline}</Text>
            {lines.map((line, i) => (
              <Text key={i} style={{ fontSize: '14px', color: '#444', margin: '8px 0' }}>
                {line}
              </Text>
            ))}
            {priceDual ? (
              <Text style={{ fontSize: '14px', color: '#111', marginTop: '12px' }}>
                Цена: <strong>{priceDual}</strong>
              </Text>
            ) : null}
            {studioUrl ? (
              <Text style={{ marginTop: '16px' }}>
                <Link href={studioUrl} style={{ color: '#2563eb' }}>
                  Вижте разписанието на студиото
                </Link>
              </Text>
            ) : null}
            <Text style={{ fontSize: '14px', color: '#666', marginTop: '24px' }}>Благодарим ви!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
