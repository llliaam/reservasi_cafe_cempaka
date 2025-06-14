// app-sidebar.tsx

import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Home,
    Calendar,
    ShoppingBag,
    Heart,
    Star,
    Settings,
    HelpCircle,
    LogOut,
    User,
    LayoutDashboard
} from 'lucide-react';
import AppLogo from './app-logo';
import { usePage } from '@inertiajs/react';

type PageProps = {
  user: {
    name: string;
    email: string;
  } | null ;
};

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        isActive: true,
    },
    {
        title: 'Riwayat Pesanan & Reservasi',
        href: '/riwayat',
        icon: ShoppingBag,
    },
    // COMMENT atau hapus kedua menu lama ini:
    // {
    //     title: 'Riwayat Reservasi',
    //     href: '/riwayat-reservasi',
    //     icon: Calendar,
    // },
    // {
    //     title: 'Riwayat Pemesanan',
    //     href: '/riwayat-pemesanan',
    //     icon: ShoppingBag,
    // },
    {
        title: 'Menu Favorit',
        href: '/menu-favorit',
        icon: Heart,
    },
    {
        title: 'Ulasan Saya',
        href: '/ulasan',
        icon: Star,
    },
    {
        title: 'Home',
        href: '/',
        icon: Home,
    },
];

const accountNavItems: NavItem[] = [
    {
        title: 'Pengaturan',
        href: '/settings',
        icon: Settings,
    },
    {
        title: 'Bantuan',
        href: '/help',
        icon: HelpCircle,
    },
];

export function AppSidebar() {
    const {user} = usePage<PageProps>().props;
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <div className="flex items-center gap-2">
                                    <AppLogo />
                                    <div className="grid flex-1 text-sm leading-tight text-left">
                                        <span className="font-semibold truncate">
                                            Cemapaka Cafe
                                        </span>
                                        <span className="text-xs truncate text-muted-foreground">
                                            Customer Portal
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Navigation */}
                <div className="px-3 py-2">
                    <h4 className="mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                        Menu Utama
                    </h4>
                    <NavMain items={mainNavItems} />
                </div>
            </SidebarContent>

            <SidebarFooter>
                {/* User Profile Section */}
                <div className="px-3 py-3 border-t border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user?.name ?? 'Guest'}
                            </p>
                            <p className="text-xs truncate text-muted-foreground">
                                {user?.email ?? '-'}
                            </p>
                        </div>
                    </div>

                    {/* Account Section - Moved here */}
                    <div className="mb-4">
                        <h4 className="mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                            Akun
                        </h4>
                        <NavMain items={accountNavItems} />
                    </div>

                    {/* Logout Button */}
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
