'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTabbedInterface } from '@/project_components/tabbed-interface-provider';
import { useLoading } from '@/project_components/loading-provider';
import { useUser } from '@/hooks/use-user';
import { signOut } from '@/lib/auth/actions';
import { tabMappings, hasTabPermissions } from '@/helper/menu';
import menuConfig from '@/config/menu.json';
import sitewide from '@/config/sitewide.json';

interface MenuConfigItem {
  label: string;
  href: string;
  children?: MenuConfigItem[];
}

const MobileNavigation: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
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
        setIsOpen(false); // Close mobile menu after navigation
      } else {
        console.warn(`User does not have permission to access: ${menuItemHref}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      setLoading('logout', true);
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
    } finally {
      setLoading('logout', false);
    }
  };

  const isLoggingOut = isLoading('logout');

  const getDisplayName = () => {
    if (userLoading) return 'Laden...';
    if (dbUser?.name) return dbUser.name;
    if (user?.email) return user.email;
    return 'Nicht angemeldet';
  };

  const getAvatarInitials = () => {
    if (dbUser?.name) {
      return dbUser.name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'MM';
  };

  const getFilteredMenuConfig = () => {
    if (userLoading) {
      return menuConfig as MenuConfigItem[];
    }

    return (menuConfig as MenuConfigItem[]).filter(menuItem => {
      const tabDef = tabMappings[menuItem.href];
      
      if (menuItem.children && menuItem.children.length > 0) {
        const accessibleChildren = menuItem.children.filter(child => {
          const childTabDef = tabMappings[child.href];
          return childTabDef && hasTabPermissions(childTabDef, hasPermission);
        });
        
        if (accessibleChildren.length > 0) {
          return {
            ...menuItem,
            children: accessibleChildren
          };
        }
        return false;
      } else {
        return tabDef && hasTabPermissions(tabDef, hasPermission);
      }
    }).map(menuItem => {
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

  const toggleSubmenu = (href: string) => {
    setOpenSubmenu(openSubmenu === href ? null : href);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="w-full bg-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-gray-900 select-none">
            {sitewide.siteName}
          </span>
          
          <div className="flex items-center gap-2">
            {/* User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 p-1"
                  aria-label="Benutzermenü öffnen"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" alt="Benutzeravatar" />
                    <AvatarFallback className="text-xs">
                      {getAvatarInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? 'Abmelden...' : 'Abmelden'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Burger Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menü öffnen"
              className="p-2"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div 
            className="absolute top-0 right-0 w-80 max-w-[80vw] h-full bg-white shadow-lg overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-bold text-gray-900">
                  Navigation
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  aria-label="Menü schließen"
                  className="p-2"
                >
                  <X size={20} />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                <Avatar>
                  <AvatarImage src="/avatar.png" alt="Benutzeravatar" />
                  <AvatarFallback>
                    {getAvatarInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {getDisplayName()}
                </span>
              </div>

              {/* Menu Items */}
              <nav className="space-y-2">
                {filteredMenuConfig.map(({ label, href, children }) => (
                  <div key={href}>
                    {children && children.length > 0 ? (
                      <div>
                        <button
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => toggleSubmenu(href)}
                          aria-label={label}
                        >
                          <span className="font-medium">{label}</span>
                          {openSubmenu === href ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                        {openSubmenu === href && (
                          <div className="ml-4 mt-2 space-y-1">
                            {children.map(child => (
                              <button
                                key={child.href}
                                className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded transition-colors"
                                onClick={() => handleMenuClick(child.href)}
                                aria-label={child.label}
                              >
                                {child.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        className="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        onClick={() => handleMenuClick(href)}
                        aria-label={label}
                      >
                        {label}
                      </button>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation; 