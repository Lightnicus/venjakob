'use client'; // Ensure client component

import menuConfig from '@/config/menu.json';
import sitewide from '@/config/sitewide.json';
import type { FC } from 'react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import { tabMappings } from '@/helper/menu';

// Import tab content components - no longer needed here as they are imported in menu.tsx

type MenuConfigItem = {
  label: string;
  href: string; // href from menu.json might be used as a unique key or part of tab ID
};

const TopNavigation: FC = () => {
  const { openNewTab } = useTabbedInterface();

  const handleMenuClick = (menuItemHref: string) => {
    const tabDef = tabMappings[menuItemHref];
    if (tabDef) {
      openNewTab({
        id: tabDef.id,
        title: tabDef.title,
        content: tabDef.content(), // Execute the function to get the ReactNode
        closable: tabDef.closable,
      });
    }
  };

  return (
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
            {(menuConfig as MenuConfigItem[]).map(({ label, href }) => (
              <NavigationMenuItem key={href}>
                {/* Use a button-like behavior for NavigationMenuLink if it supports onClick well,
                    otherwise, might need a custom component or simple button styled appropriately. 
                    Setting href='#' and relying on onClick is a common pattern. */}
                <NavigationMenuLink
                  href="#" // Prevent actual navigation
                  className={navigationMenuTriggerStyle() + ' cursor-pointer'}
                  aria-label={label}
                  onClick={e => {
                    e.preventDefault(); // Prevent default link behavior
                    handleMenuClick(href);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMenuClick(href);
                    }
                  }}
                  tabIndex={0} // Ensure it's focusable
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
          <span className="text-sm font-medium text-gray-700">
            Max Mustermann
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
