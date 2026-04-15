import Navbar from "@/components/Navbar";
import ContactFooter from "@/components/ContactFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { CheckCircle, AlertCircle, Shield, FileText, Clock, MapPin } from "lucide-react";

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
            <Navbar />
            <main className="py-20 md:py-28">
                <div className="container max-w-6xl mx-auto px-4">
                    {/* Hero Section */}
                    <div className="text-center mb-20">
                        <Badge className="text-sm px-4 py-1 bg-primary/10 text-primary mb-6">
                            Official Terms & Conditions
                        </Badge>
                        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent mb-6 leading-tight">
                            Terms & Conditions
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            Please read these terms carefully before booking your stall. By proceeding with booking, you agree to be legally bound by all the following terms.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                        {/* Quick Stats */}
                        <Card className="lg:col-span-1 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                    <Shield className="w-8 h-8 text-primary" />
                                    Important
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="text-sm font-medium">Non-refundable payments</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-destructive" />
                                        <span className="text-sm font-medium">No modifications after confirmation</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        <span className="text-sm font-medium">Subject to organizer approval</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Last Updated */}
                        <Card className="lg:col-span-1 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-muted-foreground" />
                                    Last Updated
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">{new Date().getFullYear()}</div>
                                <p className="text-sm text-muted-foreground mt-1">These terms may be updated</p>
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <Card className="lg:col-span-1 shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle>Quick Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link to="/" className="flex items-center gap-2 text-sm hover:text-primary transition-colors w-full p-2 rounded-md hover:bg-accent">
                                    <span>🏠 Home</span>
                                </Link>
                                <Link to="/#booking" className="flex items-center gap-2 text-sm hover:text-primary transition-colors w-full p-2 rounded-md hover:bg-accent">
                                    <span>📦 Book Stall</span>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Terms Sections */}
                    <div className="max-w-5xl mx-auto space-y-12">
                        <section>
                            <Card className="shadow-elevated border-0 overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 pb-8 pt-12">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-foreground">1. Booking Process</h2>
                                            <CardDescription className="text-lg text-muted-foreground">Confirmation & Allocation</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-12 pt-0">
                                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                        Stall booking requests are subject to availability and organizer approval. Form submission does not guarantee allocation.
                                    </p>
                                    <ul className="space-y-3 text-foreground/90">
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-sm mt-0.5 flex-shrink-0">1</span>
                                            <span>Bookings confirmed within 24-48 hours via email/SMS</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-sm mt-0.5 flex-shrink-0">2</span>
                                            <span>Specific stall numbers allocated at organizer discretion</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-sm mt-0.5 flex-shrink-0">3</span>
                                            <span>Payment verification required before final confirmation</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </section>

                        <section>
                            <Card className="shadow-elevated border-0 overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-destructive/5 to-destructive/10 pb-8 pt-12">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center">
                                            <AlertCircle className="w-8 h-8 text-destructive" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-foreground">2. Payment Policy</h2>
                                            <CardDescription className="text-lg text-muted-foreground">Strict & Non-Negotiable</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-12 pt-0">
                                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                                        <div>
                                            <h3 className="font-semibold text-xl mb-4">Accepted Methods</h3>
                                            <div className="space-y-2">
                                                <Badge variant="secondary" className="w-fit px-4 py-1">UPI</Badge>
                                                <Badge variant="secondary" className="w-fit px-4 py-1">NEFT/RTGS</Badge>
                                                <Badge variant="secondary" className="w-fit px-4 py-1">Bank Transfer</Badge>
                                            </div>
                                        </div>
                                        <div className="pt-2 md:pt-0 md:border-l border-border pl-0 md:pl-8">
                                            <h3 className="font-semibold text-xl mb-4 text-destructive">Key Rules</h3>
                                            <ul className="space-y-2 text-sm text-destructive/80">
                                                <li>• Payments are <strong>100% non-refundable</strong></li>
                                                <li>• No modifications after payment verification</li>
                                                <li>• Transaction ID verification mandatory</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        <section>
                            <Card className="shadow-elevated border-0 overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-secondary/5 to-muted/5 pb-8 pt-12">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
                                            <MapPin className="w-8 h-8 text-secondary" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-foreground">3. Vendor Obligations</h2>
                                            <CardDescription className="text-lg text-muted-foreground">Event Compliance</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-12 pt-0 grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4">Setup Requirements</h3>
                                        <ul className="space-y-2 text-sm">
                                            <li>• Comply with all safety regulations</li>
                                            <li>• Exact stall dimensions only</li>
                                            <li>• No subletting permitted</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4">Self Responsibility</h3>
                                        <ul className="space-y-2 text-sm">
                                            <li>• Electricity & water arrangement</li>
                                            <li>• Waste management</li>
                                            <li>• Goods security</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        <section>
                            <Card className="shadow-elevated border-0 overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-warning/5 to-warning/10 pb-8 pt-12">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center">
                                            <AlertCircle className="w-8 h-8 text-warning" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-foreground">4. Force Majeure & Liability</h2>
                                            <CardDescription className="text-lg text-muted-foreground">Limited Liability Disclaimer</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-12 pt-0">
                                    <div className="grid gap-6 text-center">
                                        <p className="text-lg font-semibold text-warning text-center mb-8 max-w-2xl mx-auto leading-relaxed">
                                            Organizers not liable for event cancellation due to force majeure. No refunds issued. Vendors participate at own risk.
                                        </p>
                                        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                            <div className="p-6 rounded-2xl bg-warning/5 border border-warning/20">
                                                <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
                                                <h4 className="font-semibold mb-2">Event Cancellation</h4>
                                                <p className="text-sm text-muted-foreground">No refunds for force majeure</p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-muted/20 border">
                                                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                                <h4 className="font-semibold mb-2">Vendor Liability</h4>
                                                <p className="text-sm text-muted-foreground">Goods loss/theft not covered</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Footer Section */}
                        <div className="pt-20 pb-16 border-t border-border text-center">
                            <Separator className="max-w-md mx-auto mb-8" />
                            <div className="space-y-4">
                                <p className="text-lg font-semibold">By booking, you confirm acceptance of all terms</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                                    <Link to="/booking" className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full sm:w-auto font-semibold shadow-lg">
                                            ← Back to Booking
                                        </Button>
                                    </Link>
                                    {/* <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                                        Print Terms
                                    </Button> */}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Last updated: <span className="font-mono">{new Date().getFullYear()}</span> | Swadeshi Mela Organizers
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <ContactFooter />
        </div>
    );
};

export default TermsAndConditions;
