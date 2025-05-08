'use client';
import { usePathname } from 'next/navigation';
import TopNavigation from '@/project_components/top-navigation';

const ShowNavigation = () => {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return <TopNavigation />;
};

export default ShowNavigation;
