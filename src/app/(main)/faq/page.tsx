
import { FAQAssistant } from '@/components/FAQAssistant';
import { getFaqs } from '@/lib/data-loader';

function PageHeader() {
  return (
    <div className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="mt-2 text-lg text-primary-foreground/80">
          Have a question? Ask our AI assistant or browse the common questions below.
        </p>
      </div>
    </div>
  );
}

export default async function FAQPage() {
  const faqs = await getFaqs();

  return (
    <>
      <PageHeader />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-8">
            <FAQAssistant pregeneratedFaqs={faqs} />
        </div>
      </div>
    </>
  );
}
