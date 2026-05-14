import Link from 'next/link'
import Footer from '@/components/landing/Footer'

export const metadata = {
  title: 'Terms of Use · Sonata',
  description: 'The terms and conditions for using Sonata.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link
          href="/"
          className="inline-block text-neutral-500 hover:text-white text-sm transition-colors mb-10"
        >
          ← Back to home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
          Terms of Use
        </h1>
        <p className="text-neutral-500 text-sm mb-12">Effective May 14, 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">1. Acceptance of Terms</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of Sonata
            (&ldquo;Sonata,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By
            using Sonata, you agree to be bound by these Terms. If you do not agree, please do not
            use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">
            2. Description of Service
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            Sonata is an AI-assisted playlist builder that uses Google Gemini to generate track
            recommendations from your natural-language prompts and the Spotify Web API to search
            for matching tracks and create playlists on your Spotify account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">
            3. Eligibility &amp; Spotify Account
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            To use Sonata, you must have a valid Spotify account and be at least 13 years of age
            (or the minimum age required to use Spotify in your country, whichever is greater).
            Your use of Spotify through Sonata is also subject to Spotify&rsquo;s Terms of Service
            and Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">4. User Conduct</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            You agree not to: (a) scrape, reverse engineer, or attempt to derive the source code
            of Sonata; (b) abuse, overload, or otherwise interfere with our recommendation or
            playlist APIs; (c) submit prompts that violate applicable law, infringe the rights of
            others, or violate Spotify&rsquo;s or Google&rsquo;s content policies; or (d) use
            Sonata to impersonate any person or misrepresent your affiliation with anyone.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">5. Intellectual Property</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            The Sonata name, interface, code, and design are owned by Sonata and protected by
            applicable intellectual property laws. Music, album artwork, and related content
            served through Sonata are the property of Spotify and the respective rights holders.
            The prompts you submit remain yours; by submitting them you grant us a limited license
            to process them in order to provide the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">6. Third-Party Services</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            Sonata depends on third-party services, including Spotify and Google Gemini. Your use
            of features that rely on these services is also subject to their respective terms.
            Sonata is not responsible for outages, changes, or actions taken by these third
            parties, and we are not liable for any resulting impact on your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">
            7. Disclaimer of Warranties
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            Sonata is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis,
            without warranties of any kind, express or implied. AI-generated recommendations may
            be inaccurate, incomplete, or unsuitable for any particular purpose, and you are
            responsible for reviewing recommendations before saving them to your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">
            8. Limitation of Liability
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            To the maximum extent permitted by law, Sonata will not be liable for any indirect,
            incidental, special, consequential, or punitive damages, or any loss of profits or
            revenues, whether incurred directly or indirectly, arising from your use of the
            service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">9. Termination</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            You may stop using Sonata at any time and revoke its access from your Spotify account
            settings. We may suspend or terminate your access to Sonata if you violate these
            Terms or if we discontinue the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">10. Changes to Terms</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            We may update these Terms from time to time. When we do, we will revise the effective
            date at the top of this page. Your continued use of Sonata after changes take effect
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">11. Governing Law</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            These Terms are governed by the laws applicable in your jurisdiction of residence,
            except where mandatory local law provides otherwise. Any disputes shall be resolved in
            the competent courts of that jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">12. Contact</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            Questions about these Terms can be sent to{' '}
            <a
              href="mailto:kurtismquant@gmail.com"
              className="text-spotify hover:underline"
            >
              kurtismquant@gmail.com
            </a>
            .
          </p>
        </section>
      </div>

      <Footer />
    </main>
  )
}
