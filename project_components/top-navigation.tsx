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

// Import tab content components - no longer needed here as they are imported in menu.tsx

type MenuConfigItem = {
  label: string;
  href: string;
  children?: MenuConfigItem[];
};

const TopNavigation: FC = () => {
  const { openNewTab } = useTabbedInterface();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const handleAvatarClick = () => setIsDropdownOpen(v => !v);
  const handleAvatarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsDropdownOpen(v => !v);
    }
    if (e.key === 'Escape') setIsDropdownOpen(false);
  };
  const handleLogout = () => router.push('/');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

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
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 focus:outline-none rounded px-1 cursor-pointer"
              aria-label="Benutzermenü öffnen"
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
              tabIndex={0}
              onClick={handleAvatarClick}
              onKeyDown={handleAvatarKeyDown}
              type="button"
            >
              <Avatar>
                <AvatarImage src="/avatar.png" alt="Benutzeravatar" />
                <AvatarFallback>MM</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">Max Mustermann</span>
            </button>
            {isDropdownOpen && (
              <div
                className="absolute top-full right-0 w-40 bg-white border border-gray-200 rounded shadow-lg z-50 animate-fade-in mt-2"
                role="menu"
                aria-label="Benutzermenü"
              >
                <button
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none rounded cursor-pointer"
                  onClick={handleLogout}
                  tabIndex={0}
                  role="menuitem"
                  aria-label="Abmelden"
                  onKeyDown={e => {
                    if (e.key === 'Escape') setIsDropdownOpen(false);
                  }}
                >
                  Abmelden
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
