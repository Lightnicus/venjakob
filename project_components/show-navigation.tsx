'use client';
import { usePathname } from 'next/navigation';
import TopNavigation from '@/project_components/top-navigation';
import MobileNavigation from '@/project_components/mobile-navigation';

const ShowNavigation = () => {
  const pathname = usePathname();
  if (pathname === '/') return null;
  
  return (
    <>
      {/* Desktop Navigation - visible from md (768px) and up */}
      <div className="hidden lg:block">
        <TopNavigation />
      </div>
      
      {/* Mobile Navigation - visible below md (under 768px) */}
      <div className="block lg:hidden">
        <MobileNavigation />
      </div>
    </>
  );
};

export default ShowNavigation;
