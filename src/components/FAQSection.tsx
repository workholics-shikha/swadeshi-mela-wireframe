import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "What is Swadeshi Mela?", a: "Swadeshi Mela is a large-scale cultural and trade fair promoting Indian-made products, handicrafts, food, and innovation. It brings together artisans, entrepreneurs, and buyers." },
  { q: "How do I book a stall?", a: "Click the 'Book a Stall' button, fill in the multi-step booking form with your details, select your preferred stall category, and complete the payment process." },
  { q: "What are the stall sizes available?", a: "We offer 6×6 ft, 9×9 ft, and 12×12 ft stalls depending on the category. Custom sizes may be available on request." },
  { q: "Is GST registration mandatory?", a: "No, GST registration is optional. However, vendors with GST can avail input tax credit benefits." },
  { q: "Can I book multiple stalls?", a: "Yes, you can book multiple stalls. Simply adjust the quantity in the booking form." },
  { q: "What payment methods are accepted?", a: "We accept UPI, NEFT/RTGS, bank transfers, and demand drafts. Online payment confirmation is instant." },
  { q: "Is there parking at the venue?", a: "Yes, Pragati Maidan has ample parking. The venue is also accessible via Delhi Metro (Pragati Maidan station)." },
  { q: "What is the cancellation policy?", a: "Full refund up to 30 days before the event. 50% refund between 15-30 days. No refund within 15 days of the event." },
];

const FAQSection = () => (
  <section id="faq" className="py-20 bg-background">
    <div className="container max-w-3xl">
      <div className="text-center mb-12">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">FAQ</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
          Frequently Asked Questions
        </h2>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl shadow-card border-none px-6">
            <AccordionTrigger className="font-display text-base font-semibold text-foreground hover:no-underline py-5">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
