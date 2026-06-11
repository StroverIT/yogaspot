import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components';

export type StudioSubscriptionOwnerEmailProps = {
  preview: string;
  buyerLine: string;
  lines: string[];
  priceDual?: string | null;
};

export function StudioSubscriptionOwnerEmail({
  preview,
  buyerLine,
  lines,
  priceDual,
}: StudioSubscriptionOwnerEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ margin: '0 auto', padding: '24px 0 48px', maxWidth: '560px' }}>
          <Section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 600, color: '#111' }}>Нов абонат</Text>
            <Text style={{ fontSize: '14px', color: '#444', marginTop: '8px' }}>{buyerLine}</Text>
            {lines.map((line, i) => (
              <Text key={i} style={{ fontSize: '14px', color: '#444', margin: '6px 0' }}>
                {line}
              </Text>
            ))}
            {priceDual ? (
              <Text style={{ fontSize: '14px', color: '#111', marginTop: '12px' }}>
                Цена: <strong>{priceDual}</strong>
              </Text>
            ) : null}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
