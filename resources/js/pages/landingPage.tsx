import { Head } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import WelcomeSection from '@/components/welcomeSection';
import MenuSection from '@/components/menuSection';
import Testimonials from '@/components/testimonial';
import ContactSection from '@/components/contactSection';
import Footer from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';

const LandingPage = () => {
    return (
        <>
            <Head title="Cempaka Cafe & Resto">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <Navbar />
            <main>
                <Toaster position="top-right"/>
                <WelcomeSection />
                <MenuSection />
                <Testimonials />
                <ContactSection />
            </main>
            <Footer />
        </>
    );
};

export default LandingPage;
