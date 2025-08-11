
import { ContactForm } from "@/components/ContactForm";
import { getSiteSettings } from "@/lib/data-loader";
import { Mail, Phone, MapPin } from "lucide-react";

function PageHeader() {
  return (
    <div className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="mt-2 text-lg text-primary-foreground/80">
          We're here to help. Reach out to us with any questions or inquiries.
        </p>
      </div>
    </div>
  );
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const adminEmail = process.env.ADMIN_EMAIL || 'info@piiss.edu';
  
  return (
    <>
        <PageHeader />
        <div className="container mx-auto max-w-7xl px-4 py-16">
            <div className="grid md:grid-cols-2 gap-16 items-start">
                <div>
                    <h2 className="text-3xl font-bold text-primary mb-4">Contact Information</h2>
                    <p className="text-muted-foreground mb-8">
                        Find our contact details below. For specific inquiries, please use the contact form, and the appropriate department will get back to you.
                    </p>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-accent/10 p-3 rounded-full">
                                <MapPin className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Address</h3>
                                <p className="text-muted-foreground">{settings.address}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="bg-accent/10 p-3 rounded-full">
                                <Phone className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Phone</h3>
                                <p className="text-muted-foreground">{settings.phone}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="bg-accent/10 p-3 rounded-full">
                                <Mail className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Email</h3>
                                <p className="text-muted-foreground">{adminEmail}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <ContactForm />
                </div>
            </div>
        </div>
    </>
  );
}
