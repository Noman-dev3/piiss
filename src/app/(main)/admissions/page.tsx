import { AdmissionsForm } from '@/components/AdmissionsForm';

function PageHeader() {
  return (
    <div className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-bold">Admissions</h1>
        <p className="mt-2 text-lg text-primary-foreground/80">
          Join the PIISS family. Start your application process today.
        </p>
      </div>
    </div>
  );
}

export default function AdmissionsPage() {
  return (
    <>
      <PageHeader />
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <AdmissionsForm />
      </div>
    </>
  );
}
