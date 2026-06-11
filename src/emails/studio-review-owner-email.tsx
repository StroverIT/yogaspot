import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components';

export type StudioReviewOwnerEmailProps = {
  preview: string;
  buyerLine: string;
  lines: string[];
};

export function StudioReviewOwnerEmail({ preview, buyerLine, lines }: StudioReviewOwnerEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ margin: '0 auto', padding: '24px 0 48px', maxWidth: '560px' }}>
          <Section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 600, color: '#111' }}>Ново ревю</Text>
            <Text style={{ fontSize: '14px', color: '#444', marginTop: '8px' }}>{buyerLine}</Text>
            {lines.map((line, i) => (
              <Text key={i} style={{ fontSize: '14px', color: '#444', margin: '6px 0' }}>
                {line}
              </Text>
            ))}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
