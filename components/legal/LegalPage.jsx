import Link from "next/link";
import Footer from "@/components/landing/Footer";

// Shared layout for static policy pages (Privacy, Terms).
// `sections` is an array of { heading, paragraphs }, where `paragraphs` is a
// list of React nodes rendered as standard body paragraphs.
export default function LegalPage({ title, effectiveDate, sections }) {
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
          {title}
        </h1>
        <p className="text-neutral-500 text-sm mb-12">
          Effective {effectiveDate}
        </p>

        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold text-white mt-10 mb-3">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph, i) => (
              <p key={i} className="text-neutral-300 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <Footer />
    </main>
  );
}
