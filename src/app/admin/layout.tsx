'use client';
import { AuthProvider } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { Logo } from '@/components/shared/Logo';
import { LayoutDashboard, Users, GraduationCap, Settings, LogOut, FileText, UserPlus, BookCopy } from 'lucide-react';
import { UserNav } from './_components/user-nav';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { href: '/admin/students', label: 'Students', icon: <GraduationCap /> },
    { href: '/admin/teachers', label: 'Teachers', icon: <Users /> },
    { href: '/admin/results', label: 'Results', icon: <FileText /> },
    { href: '/admin/admissions', label: 'Admissions', icon: <UserPlus /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings /> },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { logout } = useAuth();
  return (
    <AuthProvider>
        <SidebarProvider>
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
                                        isActive={pathname === item.href}
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
                         <SidebarMenuItem>
                            <SidebarMenuButton onClick={logout}>
                                <LogOut />
                                <span>Logout</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <main className="flex-1 bg-muted/40">
                <div className="border-b bg-background">
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
      </SidebarProvider>
    </AuthProvider>
  );
}
