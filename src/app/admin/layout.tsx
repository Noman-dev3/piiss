
'use client';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { Logo } from '@/components/shared/Logo';
import { LayoutDashboard, Users, GraduationCap, Settings, LogOut, FileText, UserPlus, Newspaper, Image as ImageIcon, Calendar, Star, MessageSquareQuote, HelpCircle, Megaphone } from 'lucide-react';
import { UserNav } from './_components/user-nav';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { href: '/admin/admissions', label: 'Admissions', icon: <UserPlus /> },
    { href: '/admin/students', label: 'Students', icon: <GraduationCap /> },
    { href: '/admin/teachers', label: 'Teachers', icon: <Users /> },
    { href: '/admin/results', label: 'Results', icon: <FileText /> },
    { href: '/admin/news', label: 'News', icon: <Newspaper /> },
    { href: '/admin/events', label: 'Events', icon: <Calendar /> },
    { href: '/admin/gallery', label: 'Gallery', icon: <ImageIcon /> },
    { href: '/admin/toppers', label: 'Toppers', icon: <Star /> },
    { href: '/admin/testimonials', label: 'Testimonials', icon: <MessageSquareQuote /> },
    { href: '/admin/announcements', label: 'Announcements', icon: <Megaphone /> },
    { href: '/admin/faq', label: 'FAQ', icon: <HelpCircle /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings /> },
]

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <Sidebar>
                    <SidebarHeader>
                        <Logo isAdmin={true}/>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                 <SidebarMenuItem key={item.href}>
                                    <Link href={item.href} className="w-full">
                                        <SidebarMenuButton 
                                            isActive={pathname.startsWith(item.href)}
                                            tooltip={item.label}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                        <SidebarMenu>
                             <SidebarMenuItem key="logout">
                                <SidebarMenuButton onClick={logout}>
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>
                <main className="flex-1 bg-muted/40 overflow-y-auto">
                    <div className="border-b bg-background sticky top-0 z-10">
                        <div className="flex h-16 items-center px-4 sm:px-8">
                            <div className="flex items-center gap-2">
                                <SidebarTrigger className="md:hidden" />
                                 <h1 className="text-xl font-semibold tracking-tight hidden md:block">
                                    {menuItems.find(item => pathname.startsWith(item.href))?.label || 'Admin'}
                                </h1>
                            </div>
                            <div className="ml-auto flex items-center space-x-4">
                                <UserNav />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6 p-4 sm:p-8 pt-6">
                        {children}
                    </div>
                </main>
            </div>
      </SidebarProvider>
    );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthProvider>
    )
}
