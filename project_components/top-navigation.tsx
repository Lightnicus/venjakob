import menu from '@/config/menu.json';
import sitewide from '@/config/sitewide.json';
import Link from 'next/link';
import type { FC } from 'react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type MenuItem = {
  label: string;
  href: string;
};

const TopNavigation: FC = () => (
  <div className="w-full bg-white shadow-md">
    <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 py-2">
      <span
        className="text-xl font-bold text-gray-900 select-none"
        aria-label="Seitenname"
      >
        {sitewide.siteName}
      </span>
      <NavigationMenu
        className="flex-1 justify-end"
        aria-label="Hauptnavigation"
      >
        <NavigationMenuList>
          {(menu as MenuItem[]).map(({ label, href }) => (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink
                href={href}
                className={navigationMenuTriggerStyle()}
                aria-label={label}
              >
                {label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-2 ml-4">
        <Avatar>
          <AvatarImage src="/avatar.png" alt="Benutzeravatar" />
          <AvatarFallback>MM</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-gray-700">Max Mustermann</span>
      </div>
    </div>
  </div>
);

export default TopNavigation;
