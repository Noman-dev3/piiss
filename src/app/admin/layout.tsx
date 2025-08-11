'use client';
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarGroup } from '@/components/ui/sidebar';
import { Logo } from '@/components/shared/Logo';
import { Home, Newspaper, Calendar, Users, GraduationCap, BarChart, Settings, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/news', label: 'News & Events', icon: Newspaper },
    { href: '/admin/teachers', label: 'Teachers', icon: Users },
    { href: '/admin/students', label: 'Students', icon: GraduationCap },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                <Logo />
                <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {adminNavItems.map(item => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton href={item.href} isActive={pathname === item.href}>
                                <item.icon />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
             <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <div className="min-h-screen">
                {children}
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
