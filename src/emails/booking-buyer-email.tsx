import { Body, Container, Head, Html, Link, Preview, Section, Text } from '@react-email/components';

export type BookingBuyerEmailProps = {
  preview: string;
  headline: string;
  lines: string[];
  calendarUrl?: string;
  paymentMode: 'online' | 'offline';
};

export function BookingBuyerEmail({ preview, headline, lines, calendarUrl, paymentMode }: BookingBuyerEmailProps) {
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
            {paymentMode === 'offline' ? (
              <Text style={{ fontSize: '14px', color: '#444', marginTop: '12px' }}>
                Плащането се урежда директно със студиото (без онлайн такса).
              </Text>
            ) : null}
            {calendarUrl ? (
              <Text style={{ marginTop: '16px' }}>
                <Link href={calendarUrl} style={{ color: '#2563eb' }}>
                  Добави в Google Календар
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
