import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface InviteEmailProps {
  displayName: string
  email: string
  tempPin: string
  inviterName: string
  appUrl: string
}

export default function InviteEmail({
  displayName,
  email,
  tempPin,
  inviterName,
  appUrl,
}: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0f0f17', fontFamily: 'Inter, Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '480px', margin: '40px auto', padding: '0 24px' }}>
          <Section style={{ background: '#161620', borderRadius: '12px', padding: '40px 32px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 4px' }}>
              Barzini Publishing
            </Text>
            <Text style={{ color: '#ffffff', fontSize: '22px', fontWeight: 600, margin: '0 0 24px' }}>
              You&apos;ve been invited
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
              Hi {displayName}, {inviterName} has invited you to Barzini Publishing. Use the credentials below to sign in.
            </Text>
            <Hr style={{ borderColor: 'rgba(255,255,255,0.07)', margin: '0 0 24px' }} />
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
              Email
            </Text>
            <Text style={{ color: '#ffffff', fontSize: '15px', fontFamily: 'monospace', margin: '0 0 20px' }}>
              {email}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
              Temporary PIN
            </Text>
            <Section style={{ background: '#0f0f17', border: '1px solid rgba(61,219,189,0.25)', borderRadius: '8px', padding: '14px 18px', margin: '0 0 8px' }}>
              {/* No letter-spacing here — some mail clients (notably desktop Outlook) can
                  paste wide letter-spacing as literal extra spaces, which would break the PIN
                  on copy/paste. Isolated in its own box with nothing else so a tap-to-select
                  or triple-click grabs exactly these digits. */}
              <Text style={{ color: '#3DDBBD', fontSize: '32px', fontFamily: 'monospace', fontWeight: 500, margin: 0, textAlign: 'center' }}>
                {tempPin}
              </Text>
            </Section>
            <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: '0 0 24px' }}>
              Tap and hold (or triple-click) the PIN above to select and copy it.
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: '1.6', margin: '0 0 24px' }}>
              You&apos;ll be asked to create a new PIN when you first sign in. Keep this temporary PIN secure and do not share it.
            </Text>
            <Hr style={{ borderColor: 'rgba(255,255,255,0.07)', margin: '0 0 24px' }} />
            <Text style={{ margin: 0 }}>
              <a
                href={appUrl}
                style={{ display: 'inline-block', background: '#3DDBBD', color: '#0f1f1c', fontSize: '14px', fontWeight: 600, padding: '10px 24px', borderRadius: '8px', textDecoration: 'none' }}
              >
                Sign in to Barzini Publishing
              </a>
            </Text>
          </Section>
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textAlign: 'center', margin: '24px 0 0' }}>
            If you weren&apos;t expecting this invitation, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
