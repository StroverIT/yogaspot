import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components';

export type BookingOwnerEmailProps = {
  preview: string;
  buyerLine: string;
  lines: string[];
  paymentMode: 'online' | 'offline';
  /** Same end total as in buyer mail (EUR · BGN); online = Stripe total only, no extra tax lines. */
  endPriceDual?: string | null;
};

export function BookingOwnerEmail({ preview, buyerLine, lines, paymentMode, endPriceDual }: BookingOwnerEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ margin: '0 auto', padding: '24px 0 48px', maxWidth: '560px' }}>
          <Section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 600, color: '#111' }}>Нова резервация</Text>
            <Text style={{ fontSize: '14px', color: '#444', marginTop: '8px' }}>{buyerLine}</Text>
            {lines.map((line, i) => (
              <Text key={i} style={{ fontSize: '14px', color: '#444', margin: '6px 0' }}>
                {line}
              </Text>
            ))}
            {endPriceDual ? (
              <Text style={{ fontSize: '14px', color: '#111', marginTop: '12px' }}>
                Крайна сума
                {paymentMode === 'offline' ? ' (клиентът плаща на място в студиото)' : ''}:{' '}
                <strong>{endPriceDual}</strong>
              </Text>
            ) : paymentMode === 'offline' ? (
              <Text style={{ fontSize: '14px', color: '#444', marginTop: '12px' }}>
                Записване без онлайн плащане - уговорете сумата и плащането директно с клиента на място.
              </Text>
            ) : (
              <Text style={{ fontSize: '14px', color: '#444', marginTop: '12px' }}>
                Онлайн плащане - детайлите са в потвърждението към клиента.
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
