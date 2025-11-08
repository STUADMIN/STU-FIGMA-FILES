import React from \"react\";

interface TenderDetailPageProps {
  params: { tenderId: string };
}

export default function TenderDetailPage({ params }: TenderDetailPageProps) {
  return (
    <main className=\"min-h-dvh p-6\">
      <div className=\"mx-auto max-w-4xl\">
        <h1 className=\"mb-2 text-2xl font-semibold\">Tender {params.tenderId}</h1>
        <p className=\"text-gray-600\">Details will appear here.</p>
      </div>
    </main>
  );
}
