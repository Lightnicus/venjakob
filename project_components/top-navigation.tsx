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
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/auth/actions';
import { useLoading } from './loading-provider';
import { useUser } from './use-user';

// Import tab content components - no longer needed here as they are imported in menu.tsx

type MenuConfigItem = {
  label: string;
  href: string;
  children?: MenuConfigItem[];
};

const TopNavigation: FC = () => {
  const { openNewTab } = useTabbedInterface();
  const router = useRouter();
  const { setLoading, isLoading } = useLoading();
  const { user, loading: userLoading } = useUser();

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

  const handleLogout = async () => {
    try {
      setLoading('logout', true);
      await signOut();
      // The signOut function will redirect to '/' automatically
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback to manual redirect if signOut fails
      router.push('/');
    } finally {
      setLoading('logout', false);
    }
  };

  const isLoggingOut = isLoading('logout');

  return (
    <div className="w-full bg-white shadow-md">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 py-2">
        <span
          className="text-xl font-bold text-gray-900 select-none"
          aria-label="Seitenname"
        >
          {sitewide.siteName}
        </span>
        <NavigationMenu className="flex-1 justify-end" aria-label="Hauptnavigation" viewport={false}>
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
                  <NavigationMenuContent className="left-0">
                    <ul className="">
                      {children.map(child => (
                        <li key={child.href}>
                          <NavigationMenuLink asChild>
                            <button
                              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 focus:bg-gray-100 focus:outline-none cursor-pointer"
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 p-1"
                aria-label="Benutzermenü öffnen"
              >
                <Avatar>
                  <AvatarImage src="/avatar.png" alt="Benutzeravatar" />
                  <AvatarFallback>
                    {user?.email ? user.email.substring(0, 2).toUpperCase() : 'MM'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {userLoading ? 'Laden...' : user?.email || 'Nicht angemeldet'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? 'Abmelden...' : 'Abmelden'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
