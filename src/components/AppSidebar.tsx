import { useAuth } from '@/lib/auth-context';
import { useLocation, NavLink } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Bot, BarChart3, Package, ShoppingCart, Bell, Users, Truck, LogOut, LayoutDashboard, MessageSquare, Star } from 'lucide-react';

const ownerNav = [
  { title: 'Dashboard', url: '/owner/dashboard', icon: LayoutDashboard },
  { title: 'Products', url: '/owner/products', icon: Package },
  { title: 'Orders', url: '/owner/orders', icon: ShoppingCart },
  { title: 'Analytics', url: '/owner/analytics', icon: BarChart3 },
  { title: 'NPS', url: '/owner/nps', icon: Star },
  { title: 'AI Alerts', url: '/owner/alerts', icon: Bell },
];

const opsNav = [
  { title: 'Dashboard', url: '/operations/dashboard', icon: LayoutDashboard },
  { title: 'Deliveries', url: '/operations/deliveries', icon: Truck },
  { title: 'Alerts', url: '/operations/alerts', icon: Bell },
];

const customerNav = [
  { title: 'Products', url: '/customer/products', icon: Package },
  { title: 'My Orders', url: '/customer/orders', icon: ShoppingCart },
  { title: 'AI Chat', url: '/customer/chat', icon: MessageSquare },
  { title: 'Feedback', url: '/customer/nps', icon: Star },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const navItems = user?.role === 'owner' ? ownerNav : user?.role === 'operations_manager' ? opsNav : customerNav;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-ai">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold font-display text-foreground">NexusOps</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{!collapsed && (user?.role === 'owner' ? 'Business' : user?.role === 'operations_manager' ? 'Operations' : 'Shop')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-3">
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
