import menu from '../../config/menu.json';
import sitewide from '../../config/sitewide.json';
import Link from 'next/link';
import type { FC } from 'react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from './navigation-menu';

type MenuItem = {
  label: string;
  href: string;
};

const Navigation: FC = () => (
  <div className="w-full bg-white shadow-md">
    <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 py-2">
      <span className="text-xl font-bold text-gray-900 select-none" aria-label="Seitenname">{sitewide.siteName}</span>
      <NavigationMenu className="flex-1 justify-end" aria-label="Hauptnavigation">
        <NavigationMenuList>
          {(menu as MenuItem[]).map(({ label, href }) => (
            <NavigationMenuItem key={href}>
              <Link href={href} passHref legacyBehavior>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} aria-label={label}>
                  {label}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  </div>
);

export default Navigation; 