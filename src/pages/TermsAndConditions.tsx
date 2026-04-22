import Navbar from "@/components/Navbar";
import ContactFooter from "@/components/ContactFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { Shield, AlertCircle, FileText, Users, Ban } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      <main className="py-16 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms & Conditions
          </h1>
          <p className="text-gray-600 text-lg">
            कृपया स्टाल बुकिंग से पहले सभी नियम ध्यानपूर्वक पढ़ें
          </p>
        </div>

        <div className="space-y-8">

          {/* Booking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText /> बुकिंग एवं भुगतान नियम
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed">
              <p>• 50% एडवांस पेमेंट QR कोड पर करना अनिवार्य है</p>
              <p>• Transaction ID / Screenshot अपलोड करना जरूरी है</p>
              <p>• शेष 50% राशि स्टाल लेने से पहले जमा करनी होगी</p>
              <p>• संस्था की स्वीकृति के बाद ही बुकिंग कन्फर्म मानी जाएगी</p>
            </CardContent>
          </Card>

          {/* Refund */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle /> रिफंड एवं कैंसिलेशन
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>• बुकिंग के बाद कोई पेमेंट वापस नहीं होगा</p>
              <p>• कन्फर्मेशन के बाद कोई बदलाव मान्य नहीं होगा</p>
            </CardContent>
          </Card>

          {/* Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield /> संस्था के अधिकार
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>• संस्था स्टाल बदल या रद्द कर सकती है</p>
              <p>• किसी भी विवाद में संस्था का निर्णय अंतिम होगा</p>
            </CardContent>
          </Card>

          {/* Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle /> जिम्मेदारी एवं सुरक्षा
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>• चोरी, आग, दुर्घटना की जिम्मेदारी आपकी होगी</p>
              <p>• CCTV और सिक्योरिटी उपलब्ध होगी लेकिन जिम्मेदारी आपकी रहेगी</p>
            </CardContent>
          </Card>

          {/* Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users /> स्टाल उपयोग नियम
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>• अधिकतम 2 सेल्समैन ही अनुमति होगी</p>
              <p>• रात 11 बजे के बाद रुकना मना है</p>
            </CardContent>
          </Card>

          {/* Restrictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Ban /> प्रतिबंधित गतिविधियाँ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>• शराब, सिगरेट और नशा पूरी तरह प्रतिबंधित है</p>
              <p>• गलत व्यवहार पर बुकिंग तुरंत रद्द कर दी जाएगी (No Refund)</p>
            </CardContent>
          </Card>

          {/* Declaration */}
          <Card>
            <CardHeader>
              <CardTitle>घोषणा</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>
                मैं यह घोषित करता/करती हूं कि मैंने सभी नियम पढ़ लिए हैं और उन्हें स्वीकार करता/करती हूं।
              </p>

              <div className="flex items-start gap-2">
                <Checkbox required />
                <span>I agree to all Terms & Conditions</span>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mt-10">
            <Link to="/book-stall">
              <Button size="lg" className="px-8 py-3 text-lg">
                Book a Stall
              </Button>
            </Link>
          </div>

          {/* Signature */}
          <div className="text-center mt-10 text-sm text-gray-600">
            <p className="font-semibold">प्रणम्य पोरवाल</p>
            <p>CEO - राष्ट्रीय विराट स्वदेशी हाट</p>
          </div>
        </div>
      </main>

      <ContactFooter />
    </div>
  );
}
