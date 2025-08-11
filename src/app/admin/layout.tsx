import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
        <Sidebar>
            {/* Sidebar content here */}
        </Sidebar>
        <SidebarInset>
            <div className="min-h-screen">
                {children}
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}