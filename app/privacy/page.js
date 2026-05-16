import LegalPage from '@/components/legal/LegalPage'

export const metadata = {
  title: 'Privacy Policy · Sonata',
  description: 'How Sonata collects, uses, and protects your information.',
}

const sections = [
  {
    heading: '1. Introduction',
    paragraphs: [
      'This Privacy Policy describes how Sonata (“Sonata,” “we,” “us,” or “our”) collects, uses, and protects information when you use our AI-assisted playlist builder. By using Sonata, you agree to the practices described in this policy.',
    ],
  },
  {
    heading: '2. Information We Collect',
    paragraphs: [
      'When you sign in with Spotify, we collect your Spotify profile information, including your display name, email address, profile image, and Spotify user ID. We also receive OAuth access and refresh tokens that allow Sonata to act on your behalf within the scopes you authorize.',
      'We additionally store the prompts you submit, the AI-generated recommendations returned for those prompts, and any playlists you choose to save.',
    ],
  },
  {
    heading: '3. How We Use Your Information',
    paragraphs: [
      'We use the information we collect to authenticate you with Spotify, generate personalized track recommendations through Google Gemini, create and modify playlists on your Spotify account at your request, and provide you with access to your prompt history within Sonata.',
    ],
  },
  {
    heading: '4. Third-Party Services',
    paragraphs: [
      'Sonata relies on the following third-party services to operate:',
      <>
        <span className="text-white font-medium">Spotify</span> — authentication and access to
        playlist and search APIs. Your use of Spotify features is also governed by Spotify’s
        Privacy Policy.
      </>,
      <>
        <span className="text-white font-medium">Google Gemini</span> — the prompts you submit are
        sent to Google’s Gemini API to generate recommendations. Your prompts are processed under
        Google’s applicable terms and privacy policy.
      </>,
      <>
        <span className="text-white font-medium">MongoDB Atlas</span> — managed database hosting
        for your account, prompts, and saved playlists.
      </>,
      <>
        <span className="text-white font-medium">Vercel</span> — application hosting and delivery.
      </>,
    ],
  },
  {
    heading: '5. Data Storage & Security',
    paragraphs: [
      'Spotify access and refresh tokens are encrypted at rest. All data is transmitted over HTTPS, and our database is hosted on MongoDB Atlas with managed security controls. No method of transmission or storage is perfectly secure, but we take reasonable steps to protect your information.',
    ],
  },
  {
    heading: '6. Data Retention',
    paragraphs: [
      'We retain your account information, prompts, and saved playlist records for as long as your Sonata account remains active. You may request deletion of your account and associated data at any time by contacting us.',
    ],
  },
  {
    heading: '7. Your Rights',
    paragraphs: [
      'You have the right to access, correct, or delete the personal information we hold about you, and to revoke Sonata’s access to your Spotify account at any time through your Spotify account settings. To exercise any of these rights, contact us using the details below.',
    ],
  },
  {
    heading: '8. Cookies & Session Storage',
    paragraphs: [
      'Sonata uses only essential session cookies provided by NextAuth.js to keep you signed in. We do not use advertising or analytics cookies.',
    ],
  },
  {
    heading: '9. Children’s Privacy',
    paragraphs: [
      'Sonata is not directed at children under the age of 13, and we do not knowingly collect personal information from anyone under 13. If you believe a child has provided us with personal information, please contact us so we can remove it.',
    ],
  },
  {
    heading: '10. Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. When we do, we will revise the effective date at the top of this page. Material changes will be communicated through the service or via email where appropriate.',
    ],
  },
  {
    heading: '11. Contact Us',
    paragraphs: [
      <>
        If you have questions about this Privacy Policy or wish to exercise any of your rights,
        contact us at{' '}
        <a href="mailto:kurtismquant@gmail.com" className="text-spotify hover:underline">
          kurtismquant@gmail.com
        </a>
        .
      </>,
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      effectiveDate="May 14, 2026"
      sections={sections}
    />
  )
}
