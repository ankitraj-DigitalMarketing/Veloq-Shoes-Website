import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

export default function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-void text-ink">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0 pt-[86px]">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
