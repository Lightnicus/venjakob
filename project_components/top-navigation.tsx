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
import { tabMappings, hasTabPermissions } from '@/helper/menu';
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
import { useUser } from '@/hooks/use-user';

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
  const { user, dbUser, hasPermission, loading: userLoading } = useUser();

  const handleMenuClick = (menuItemHref: string) => {
    const tabDef = tabMappings[menuItemHref];
    if (tabDef) {
      // Check permissions before opening tab
      if (hasTabPermissions(tabDef, hasPermission)) {
        openNewTab({
          id: tabDef.id,
          title: tabDef.title,
          content: tabDef.content(),
          closable: tabDef.closable,
        });
      } else {
        console.warn(`User does not have permission to access: ${menuItemHref}`);
        // Optionally show a toast notification here
      }
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

  // Get display name: prefer dbUser.name, fallback to user.email
  const getDisplayName = () => {
    if (userLoading) return 'Laden...';
    if (dbUser?.name) return dbUser.name;
    if (user?.email) return user.email;
    return 'Nicht angemeldet';
  };

  // Get avatar initials: prefer dbUser.name, fallback to user.email
  const getAvatarInitials = () => {
    if (dbUser?.name) {
      return dbUser.name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'MM';
  };

  // Filter menu items based on permissions
  const getFilteredMenuConfig = () => {
    // Allow menu to show while loading, but with reduced filtering
    // This prevents the menu from disappearing during permission checks
    
    if (userLoading) {
      // While loading, show all menu items to prevent blank menu
      // Once permissions load, proper filtering will apply
      return menuConfig as MenuConfigItem[];
    }

    return (menuConfig as MenuConfigItem[]).filter(menuItem => {
      const tabDef = tabMappings[menuItem.href];
      
      if (menuItem.children && menuItem.children.length > 0) {
        // For parent items, show if at least one child is accessible
        const accessibleChildren = menuItem.children.filter(child => {
          const childTabDef = tabMappings[child.href];
          return childTabDef && hasTabPermissions(childTabDef, hasPermission);
        });
        
        // Update the menu item to only include accessible children
        if (accessibleChildren.length > 0) {
          return {
            ...menuItem,
            children: accessibleChildren
          };
        }
        return false;
      } else {
        // For leaf items, check direct permission
        return tabDef && hasTabPermissions(tabDef, hasPermission);
      }
    }).map(menuItem => {
      // Filter children for parent items
      if (menuItem.children && menuItem.children.length > 0) {
        const accessibleChildren = menuItem.children.filter(child => {
          const childTabDef = tabMappings[child.href];
          return childTabDef && hasTabPermissions(childTabDef, hasPermission);
        });
        
        return {
          ...menuItem,
          children: accessibleChildren
        };
      }
      return menuItem;
    });
  };

  const filteredMenuConfig = getFilteredMenuConfig();

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
            {filteredMenuConfig.map(({ label, href, children }) =>
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
                    {getAvatarInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {getDisplayName()}
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
