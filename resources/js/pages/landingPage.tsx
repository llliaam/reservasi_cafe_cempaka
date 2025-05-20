import { Head } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import WelcomeSection from '@/components/welcomeSection';
import MenuSection from '@/components/menuSection';
import Testimonials from '@/components/testimonial';
import ContactSection from '@/components/contactSection';
import Footer from '@/components/footer';

const LandingPage = () => {
    return (
        <>
            <Head title="Cafe Cempaka">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <Navbar />
            <main>
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
