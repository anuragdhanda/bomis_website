import { Link } from "wouter";
import { ArrowLeft, ShieldCheck, Scale } from "lucide-react";

type LegalPageProps = {
  kind: "privacy" | "terms";
};

const schoolName = "Bright Open Minds International School, Rajound";

export default function Legal({ kind }: LegalPageProps) {
  const isPrivacy = kind === "privacy";

  return (
    <article className="bg-background">
      <section className="bg-secondary text-secondary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-white/75 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-4">
            {isPrivacy ? <ShieldCheck className="h-10 w-10 text-primary" /> : <Scale className="h-10 w-10 text-primary" />}
            <div>
              <p className="text-primary font-semibold uppercase tracking-[0.2em] text-xs mb-2">
                {schoolName}
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-white">
                {isPrivacy ? "Privacy Policy" : "Terms of Service"}
              </h1>
            </div>
          </div>
          <p className="text-white/75 mt-6 max-w-2xl">
            {isPrivacy
              ? "How we collect, use, protect, and respond to information shared through this website."
              : "The terms that apply when you browse and use the Bright Open Minds school website."}
          </p>
          <p className="text-white/55 text-sm mt-4">Last updated: August 7, 2026</p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl py-14 md:py-20">
        {isPrivacy ? <PrivacyContent /> : <TermsContent />}

        <div className="mt-12 rounded-2xl bg-muted p-6 md:p-8">
          <h2 className="text-xl font-bold text-foreground mb-2">Questions about this policy?</h2>
          <p className="text-muted-foreground">
            Contact our school office at{" "}
            <a className="text-primary font-medium hover:underline" href="mailto:info.rajound@brightopenminds.com">
              info.rajound@brightopenminds.com
            </a>{" "}
            or call{" "}
            <a className="text-primary font-medium hover:underline" href="tel:+919653424964">
              +91 96534 24964
            </a>
            .
          </p>
        </div>
      </div>
    </article>
  );
}

function PrivacyContent() {
  return (
    <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
      <p className="lead">
        Bright Open Minds International School, Rajound respects the privacy of students, parents, guardians, staff, and visitors. This policy explains how information is handled when you use our website, contact forms, admission enquiries, gallery, or student portal demo.
      </p>
      <h2>Information we receive</h2>
      <p>We may receive information that you choose to provide, such as your name, phone number, email address, student details, enquiry message, and admission-related information. We also receive basic technical information needed to keep the website secure and working, such as browser, device, and request details.</p>
      <h2>How we use information</h2>
      <ul>
        <li>To respond to contact, admission, and campus visit enquiries.</li>
        <li>To provide information about academics, facilities, events, and school services.</li>
        <li>To maintain, secure, troubleshoot, and improve this website.</li>
        <li>To protect students, families, staff, and the school from misuse or fraud.</li>
      </ul>
      <h2>Sharing and service providers</h2>
      <p>We do not sell personal information. Information may be shared with trusted service providers only when needed to operate the website, store files, deliver email, or protect our systems. We may also disclose information where required by applicable law or to protect the safety and rights of our community.</p>
      <h2>Student and child information</h2>
      <p>Please share student information only when you are a parent, guardian, or authorised representative. We ask families not to submit sensitive information through general website forms unless it is specifically requested for an admission or school-service purpose.</p>
      <h2>Retention and security</h2>
      <p>We retain information only for as long as reasonably needed for the purpose it was collected, school administration, legal requirements, or dispute resolution. We use access controls and reasonable technical safeguards, but no internet transmission or storage system can be guaranteed completely secure.</p>
      <h2>Your choices</h2>
      <p>You may ask us to review, correct, or delete information you submitted through this website, subject to records we must keep for legal or school-administration reasons. Use the contact details below to make a request.</p>
      <h2>Updates</h2>
      <p>We may update this policy when our services, legal obligations, or website features change. The latest version will always be posted on this page.</p>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
      <p className="lead">
        By using this website, you agree to use it responsibly and in accordance with these terms. If you do not agree, please do not use the website.
      </p>
      <h2>Website purpose</h2>
      <p>This website provides general information about {schoolName}, including academics, admissions, facilities, faculty, events, and ways to contact the school. Information is provided for communication and guidance and may change as school schedules and services are updated.</p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Use the website lawfully and only for genuine school-information or enquiry purposes.</li>
        <li>Do not submit false, misleading, abusive, or unlawful content.</li>
        <li>Do not attempt to disrupt, scan, scrape, reverse engineer, or gain unauthorised access to the website or its systems.</li>
        <li>Do not upload another person’s personal information without proper authority.</li>
      </ul>
      <h2>Enquiries and admissions</h2>
      <p>Submitting an enquiry does not guarantee admission, a seat, a campus visit, or any other school service. Admissions remain subject to the school’s eligibility requirements, availability, documentation, and decision-making process. We may contact you using the details supplied in an enquiry.</p>
      <h2>Content and intellectual property</h2>
      <p>School names, logos, photographs, text, designs, and other content on this website belong to the school or its licensors unless stated otherwise. You may view the website for personal, non-commercial use, but you may not reproduce, modify, or republish its content without written permission.</p>
      <h2>Third-party links and services</h2>
      <p>The website may link to maps, social networks, or other third-party services. Those services operate under their own terms and privacy policies. We are not responsible for their availability, content, or practices.</p>
      <h2>Availability and accuracy</h2>
      <p>We work to keep the website accurate and available, but we do not promise that every page, image, schedule, or service will always be complete, current, uninterrupted, or error-free. We may update, suspend, or remove features without notice.</p>
      <h2>Limitation of liability</h2>
      <p>To the extent permitted by applicable law, the school is not liable for indirect or consequential loss arising from reliance on website content, interruption of access, or use of third-party services. Nothing in these terms limits rights or protections that cannot legally be excluded.</p>
      <h2>Changes and governing terms</h2>
      <p>We may update these terms by publishing a revised version on this page. Continued use after an update means you accept the revised terms. These terms are subject to applicable laws and the jurisdiction of the school’s registered location in Haryana, India.</p>
    </div>
  );
}