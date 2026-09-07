type KnowledgeArticleJsonLdProps = {
  title: string;
  description: string;
  path: string;
  sectionName: string;
  sectionPath: string;
};

export default function KnowledgeArticleJsonLd({
  title,
  description,
  path,
  sectionName,
  sectionPath,
}: KnowledgeArticleJsonLdProps) {
  const baseUrl = "https://www.sondi.bg";
  const articleUrl = `${baseUrl}${path}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${articleUrl}#article`,
        headline: title,
        description,
        url: articleUrl,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": articleUrl,
        },
        inLanguage: "bg-BG",
        publisher: {
          "@id": "https://www.sondi.bg/#organization",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articleUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Начало",
            item: `${baseUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Знания",
            item: `${baseUrl}/knowledge`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: sectionName,
            item: `${baseUrl}${sectionPath}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: title,
            item: articleUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\u003c"),
      }}
    />
  );
}
