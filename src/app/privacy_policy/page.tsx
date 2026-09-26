import type { Metadata } from "next";
import PrivacyPolicyClient from "./PrivacyPolicyClient";

const SITE_URL = "https://chefalarab.com";
const PAGE_URL = `${SITE_URL}/privacy_policy`;

export const metadata: Metadata = {
title: "سياسة الخصوصية | شيف العرب",

description:
"تعرف على سياسة الخصوصية في شيف العرب وكيفية التعامل مع البيانات وملفات تعريف الارتباط والإعلانات والأمان والروابط الخارجية وخصوصية الأطفال وطلبات البيانات.",

alternates: {
canonical: PAGE_URL,
},

robots: {
index: true,
follow: true,
googleBot: {
index: true,
follow: true,
"max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
},
},

openGraph: {
title: "سياسة الخصوصية | شيف العرب",


description:
  "سياسة الخصوصية في شيف العرب: تعرف على البيانات التي قد يتم جمعها، وملفات تعريف الارتباط، والإعلانات، والأمان، وخصوصية الأطفال وطرق التواصل.",

url: PAGE_URL,

siteName: "شيف العرب",

type: "website",

locale: "ar_AR",

images: [
  {
    url: `${SITE_URL}/og-image.jpg`,
    width: 1200,
    height: 630,
    alt: "سياسة الخصوصية | شيف العرب",
  },
],


},

twitter: {
card: "summary_large_image",


title: "سياسة الخصوصية | شيف العرب",

description:
  "تعرف على كيفية التعامل مع البيانات والكوكيز والإعلانات والأمان وخصوصية الأطفال في موقع شيف العرب.",

images: [`${SITE_URL}/og-image.jpg`],


},
};

const privacySchema = {
"@context": "https://schema.org",

"@graph": [
{
"@type": "WebPage",


  "@id": `${PAGE_URL}#webpage`,

  url: PAGE_URL,

  name: "سياسة الخصوصية | شيف العرب",

  description:
    "سياسة الخصوصية الخاصة بموقع شيف العرب، بما يشمل البيانات وملفات تعريف الارتباط والإعلانات والأمان والروابط الخارجية وخصوصية الأطفال.",

  inLanguage: "ar",

  isPartOf: {
    "@type": "WebSite",

    "@id": `${SITE_URL}#website`,

    url: SITE_URL,

    name: "شيف العرب",
  },

  breadcrumb: {
    "@id": `${PAGE_URL}#breadcrumb`,
  },

  dateModified: "2026-09-17",

  publisher: {
    "@type": "Organization",

    name: "شيف العرب",

    url: SITE_URL,
  },
},

{
  "@type": "BreadcrumbList",

  "@id": `${PAGE_URL}#breadcrumb`,

  itemListElement: [
    {
      "@type": "ListItem",

      position: 1,

      name: "الرئيسية",

      item: SITE_URL,
    },

    {
      "@type": "ListItem",

      position: 2,

      name: "سياسة الخصوصية",

      item: PAGE_URL,
    },
  ],
},

{
  "@type": "WebSite",

  "@id": `${SITE_URL}#website`,

  url: SITE_URL,

  name: "شيف العرب",

  inLanguage: "ar",
},


],
};

export default function PrivacyPolicyPage() {
return (
<>
<script
type="application/ld+json"
dangerouslySetInnerHTML={{
__html: JSON.stringify(privacySchema),
}}
/>


  <PrivacyPolicyClient />
</>


);
}
