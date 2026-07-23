import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only z-[100] rounded-xs bg-ink px-4 py-2 text-sm text-ivory focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <AnnouncementBar />
      <Header />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <FloatingWhatsApp />
    </div>
  );
}
