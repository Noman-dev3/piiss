import { ContactForm } from "@/components/ContactForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Image from "next/image";

const contactInfo = [
    {
        icon: <MapPin className="h-5 w-5 text-primary" />,
        title: "Address",
        lines: ["123 Education Lane, Learning District, Knowledge City 12345"],
    },
    {
        icon: <Phone className="h-5 w-5 text-primary" />,
        title: "Phone",
        lines: ["+1 (555) 123-4567", "+91 98765 43211"],
    },
    {
        icon: <Mail className="h-5 w-5 text-primary" />,
        title: "Email",
        lines: ["info@greenfieldschool.edu", "admissions@greenfieldschool.edu"],
    },
    {
        icon: <Clock className="h-5 w-5 text-primary" />,
        title: "Office Hours",
        lines: ["Monday - Friday: 8:00 AM - 5:00 PM", "Saturday: 9:00 AM - 2:00 PM"],
    },
]

export function ContactSection() {
    return (
        <section id="contact" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground">
                        Get in <span className="text-primary">Touch</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="bg-card p-8 md:p-12 rounded-2xl shadow-lg">
                    <div className="grid md:grid-cols-2 gap-12">
                        <ContactForm />

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    {contactInfo.map((item) => (
                                        <div key={item.title} className="flex items-start gap-4">
                                            <div className="bg-primary/10 p-3 rounded-full">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{item.title}</h4>
                                                {item.lines.map((line, i) => (
                                                     <p key={i} className="text-muted-foreground">{line}</p>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative h-64 rounded-xl overflow-hidden bg-muted">
                                 <Image 
                                    src="https://placehold.co/600x400.png"
                                    alt="Map"
                                    fill
                                    className="object-cover"
                                    data-ai-hint="map location"
                                 />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
