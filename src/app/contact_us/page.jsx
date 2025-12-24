// contact_us
import ContactClient from "./ContactClient";

export const metadata = {
  title: "تواصل معنا | شيف العرب",
  description:
    "تواصل مع فريق شيف العرب عبر البريد الإلكتروني أو واتساب. يسعدنا استقبال الاقتراحات والاستفسارات والتعاون.",
  alternates: {
  canonical: "https://chefalarab.com/contact_us",
  url: "https://chefalarab.com/contact_us"

  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "تواصل معنا | شيف العرب",
    description:
      "تواصل مع شيف العرب عبر البريد الإلكتروني أو واتساب. يسعدنا استقبال رسائلك.",
    url: "https://www.chefalarab.com/contact_us",
    siteName: "شيف العرب",
    type: "website",
    locale: "ar_AR",
  },
  twitter: {
    card: "summary",
    title: "تواصل معنا | شيف العرب",
    description:
      "تواصل مع شيف العرب عبر البريد الإلكتروني أو واتساب.",
  },
};

export default function Page() {
  return <ContactClient />;
}
