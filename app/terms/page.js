import LegalPage from '@/components/legal/LegalPage'

export const metadata = {
  title: 'Terms of Use · Sonata',
  description: 'The terms and conditions for using Sonata.',
}

const sections = [
  {
    heading: '1. Acceptance of Terms',
    paragraphs: [
      'These Terms of Use (“Terms”) govern your access to and use of Sonata (“Sonata,” “we,” “us,” or “our”). By using Sonata, you agree to be bound by these Terms. If you do not agree, please do not use the service.',
    ],
  },
  {
    heading: '2. Description of Service',
    paragraphs: [
      'Sonata is an AI-assisted playlist builder that uses Google Gemini to generate track recommendations from your natural-language prompts and the Spotify Web API to search for matching tracks and create playlists on your Spotify account.',
    ],
  },
  {
    heading: '3. Eligibility & Spotify Account',
    paragraphs: [
      'To use Sonata, you must have a valid Spotify account and be at least 13 years of age (or the minimum age required to use Spotify in your country, whichever is greater). Your use of Spotify through Sonata is also subject to Spotify’s Terms of Service and Privacy Policy.',
    ],
  },
  {
    heading: '4. User Conduct',
    paragraphs: [
      'You agree not to: (a) scrape, reverse engineer, or attempt to derive the source code of Sonata; (b) abuse, overload, or otherwise interfere with our recommendation or playlist APIs; (c) submit prompts that violate applicable law, infringe the rights of others, or violate Spotify’s or Google’s content policies; or (d) use Sonata to impersonate any person or misrepresent your affiliation with anyone.',
    ],
  },
  {
    heading: '5. Intellectual Property',
    paragraphs: [
      'The Sonata name, interface, code, and design are owned by Sonata and protected by applicable intellectual property laws. Music, album artwork, and related content served through Sonata are the property of Spotify and the respective rights holders. The prompts you submit remain yours; by submitting them you grant us a limited license to process them in order to provide the service.',
    ],
  },
  {
    heading: '6. Third-Party Services',
    paragraphs: [
      'Sonata depends on third-party services, including Spotify and Google Gemini. Your use of features that rely on these services is also subject to their respective terms. Sonata is not responsible for outages, changes, or actions taken by these third parties, and we are not liable for any resulting impact on your use of the service.',
    ],
  },
  {
    heading: '7. Disclaimer of Warranties',
    paragraphs: [
      'Sonata is provided on an “as is” and “as available” basis, without warranties of any kind, express or implied. AI-generated recommendations may be inaccurate, incomplete, or unsuitable for any particular purpose, and you are responsible for reviewing recommendations before saving them to your account.',
    ],
  },
  {
    heading: '8. Limitation of Liability',
    paragraphs: [
      'To the maximum extent permitted by law, Sonata will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, arising from your use of the service.',
    ],
  },
  {
    heading: '9. Termination',
    paragraphs: [
      'You may stop using Sonata at any time and revoke its access from your Spotify account settings. We may suspend or terminate your access to Sonata if you violate these Terms or if we discontinue the service.',
    ],
  },
  {
    heading: '10. Changes to Terms',
    paragraphs: [
      'We may update these Terms from time to time. When we do, we will revise the effective date at the top of this page. Your continued use of Sonata after changes take effect constitutes acceptance of the updated Terms.',
    ],
  },
  {
    heading: '11. Governing Law',
    paragraphs: [
      'These Terms are governed by the laws applicable in your jurisdiction of residence, except where mandatory local law provides otherwise. Any disputes shall be resolved in the competent courts of that jurisdiction.',
    ],
  },
  {
    heading: '12. Contact',
    paragraphs: [
      <>
        Questions about these Terms can be sent to{' '}
        <a href="mailto:kurtismquant@gmail.com" className="text-spotify hover:underline">
          kurtismquant@gmail.com
        </a>
        .
      </>,
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      effectiveDate="May 14, 2026"
      sections={sections}
    />
  )
}
