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
  NavigationMenuTrigger,
  NavigationMenuContent,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import { tabMappings } from '@/helper/menu';

// Import tab content components - no longer needed here as they are imported in menu.tsx

type MenuConfigItem = {
  label: string;
  href: string;
  children?: MenuConfigItem[];
};

const TopNavigation: FC = () => {
  const { openNewTab } = useTabbedInterface();

  const handleMenuClick = (menuItemHref: string) => {
    const tabDef = tabMappings[menuItemHref];
    if (tabDef) {
      openNewTab({
        id: tabDef.id,
        title: tabDef.title,
        content: tabDef.content(),
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
        <NavigationMenu className="flex-1 justify-end" aria-label="Hauptnavigation">
          <NavigationMenuList>
            {(menuConfig as MenuConfigItem[]).map(({ label, href, children }) =>
              children && children.length > 0 ? (
                <NavigationMenuItem key={href}>
                  <NavigationMenuTrigger
                    className={navigationMenuTriggerStyle() + ' cursor-pointer'}
                    aria-label={label}
                    tabIndex={0}
                  >
                    {label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="w-full min-w-full p-0">
                    <ul className="w-full min-w-full">
                      {children.map(child => (
                        <li key={child.href}>
                          <NavigationMenuLink asChild>
                            <button
                              className="cursor-pointer w-full text-left px-3 py-2 rounded hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              aria-label={child.label}
                              tabIndex={0}
                              onClick={e => {
                                e.preventDefault();
                                handleMenuClick(child.href);
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleMenuClick(child.href);
                                }
                              }}
                            >
                              {child.label}
                            </button>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={href}>
                  <NavigationMenuLink asChild>
                    <button
                      className={navigationMenuTriggerStyle() + ' cursor-pointer'}
                      aria-label={label}
                      tabIndex={0}
                      onClick={e => {
                        e.preventDefault();
                        handleMenuClick(href);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleMenuClick(href);
                        }
                      }}
                    >
                      {label}
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            )}
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
