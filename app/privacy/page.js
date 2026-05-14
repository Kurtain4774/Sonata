import Link from 'next/link'
import Footer from '@/components/landing/Footer'

export const metadata = {
  title: 'Privacy Policy · Sonata',
  description: 'How Sonata collects, uses, and protects your information.',
}

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-neutral-500 text-sm mb-12">Effective May 14, 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">1. Introduction</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            This Privacy Policy describes how Sonata (&ldquo;Sonata,&rdquo; &ldquo;we,&rdquo;
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and protects information when
            you use our AI-assisted playlist builder. By using Sonata, you agree to the practices
            described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">
            2. Information We Collect
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            When you sign in with Spotify, we collect your Spotify profile information, including
            your display name, email address, profile image, and Spotify user ID. We also receive
            OAuth access and refresh tokens that allow Sonata to act on your behalf within the
            scopes you authorize.
          </p>
          <p className="text-neutral-300 leading-relaxed mb-4">
            We additionally store the prompts you submit, the AI-generated recommendations
            returned for those prompts, and any playlists you choose to save.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">
            3. How We Use Your Information
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            We use the information we collect to authenticate you with Spotify, generate
            personalized track recommendations through Google Gemini, create and modify playlists
            on your Spotify account at your request, and provide you with access to your prompt
            history within Sonata.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">4. Third-Party Services</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            Sonata relies on the following third-party services to operate:
          </p>
          <p className="text-neutral-300 leading-relaxed mb-4">
            <span className="text-white font-medium">Spotify</span> &mdash; authentication and
            access to playlist and search APIs. Your use of Spotify features is also governed by
            Spotify&rsquo;s Privacy Policy.
          </p>
          <p className="text-neutral-300 leading-relaxed mb-4">
            <span className="text-white font-medium">Google Gemini</span> &mdash; the prompts you
            submit are sent to Google&rsquo;s Gemini API to generate recommendations. Your prompts
            are processed under Google&rsquo;s applicable terms and privacy policy.
          </p>
          <p className="text-neutral-300 leading-relaxed mb-4">
            <span className="text-white font-medium">MongoDB Atlas</span> &mdash; managed database
            hosting for your account, prompts, and saved playlists.
          </p>
          <p className="text-neutral-300 leading-relaxed mb-4">
            <span className="text-white font-medium">Vercel</span> &mdash; application hosting and
            delivery.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">
            5. Data Storage &amp; Security
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            Spotify access and refresh tokens are encrypted at rest. All data is transmitted over
            HTTPS, and our database is hosted on MongoDB Atlas with managed security controls. No
            method of transmission or storage is perfectly secure, but we take reasonable steps to
            protect your information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">6. Data Retention</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            We retain your account information, prompts, and saved playlist records for as long as
            your Sonata account remains active. You may request deletion of your account and
            associated data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">7. Your Rights</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            You have the right to access, correct, or delete the personal information we hold
            about you, and to revoke Sonata&rsquo;s access to your Spotify account at any time
            through your Spotify account settings. To exercise any of these rights, contact us
            using the details below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">
            8. Cookies &amp; Session Storage
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            Sonata uses only essential session cookies provided by NextAuth.js to keep you signed
            in. We do not use advertising or analytics cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">9. Children&rsquo;s Privacy</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            Sonata is not directed at children under the age of 13, and we do not knowingly
            collect personal information from anyone under 13. If you believe a child has provided
            us with personal information, please contact us so we can remove it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">
            10. Changes to This Policy
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. When we do, we will revise the
            effective date at the top of this page. Material changes will be communicated through
            the service or via email where appropriate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-10 mb-3">11. Contact Us</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">
            If you have questions about this Privacy Policy or wish to exercise any of your
            rights, contact us at{' '}
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
