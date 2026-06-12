import { Body, Container, Head, Html, Link, Preview, Section, Text } from '@react-email/components';

export type FitsysSyncRequestEmailProps = {
  preview: string;
  studioName: string;
  studioId: string;
  fitsysUrl: string;
  ownerName: string;
  ownerEmail: string;
  isUpdate: boolean;
};

export function FitsysSyncRequestEmail({
  preview,
  studioName,
  studioId,
  fitsysUrl,
  ownerName,
  ownerEmail,
  isUpdate,
}: FitsysSyncRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ margin: '0 auto', padding: '24px 0 48px', maxWidth: '560px' }}>
          <Section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 600, color: '#111' }}>Заявка за синхронизация със fitsys</Text>
            <Text style={{ fontSize: '14px', color: '#444', marginTop: '8px' }}>
              {isUpdate ? 'Обновен линк към fitsys календар.' : 'Нова заявка за синхронизация на график от fitsys.'}
            </Text>
            <Text style={{ fontSize: '14px', color: '#444', margin: '6px 0' }}>
              Студио: {studioName} ({studioId})
            </Text>
            <Text style={{ fontSize: '14px', color: '#444', margin: '6px 0' }}>
              Собственик: {ownerName || '-'}
              {ownerEmail ? ` · ${ownerEmail}` : ''}
            </Text>
            <Text style={{ fontSize: '14px', color: '#444', margin: '6px 0' }}>
              fitsys линк:{' '}
              <Link href={fitsysUrl} style={{ color: '#2563eb' }}>
                {fitsysUrl}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
