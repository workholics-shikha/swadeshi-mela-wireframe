import StallBookingForm from "@/components/StallBookingForm";
import Navbar from "@/components/Navbar";
import ContactFooter from "@/components/ContactFooter";
import { useEffect } from "react";

const BookStall = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (   // 👈 THIS WAS MISSING
    <div className="min-h-screen">
      <Navbar />
      <StallBookingForm />
      <ContactFooter />
    </div>
  );
};

export default BookStall;