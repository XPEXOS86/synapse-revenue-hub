import {
  LayoutDashboard,
  BarChart3,
  CreditCard,
  Key,
  Activity,
  Settings,
  Brain,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "API Usage", url: "/dashboard/usage", icon: BarChart3 },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
  { title: "API Keys", url: "/dashboard/keys", icon: Key },
  { title: "Agents", url: "/dashboard/agents", icon: Activity },
];

const bottomItems = [
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary shrink-0" />
          <span className="font-display font-bold text-base group-data-[collapsible=icon]:hidden">
            RevLink Brain
          </span>
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      activeClassName="bg-muted text-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.url}
                  end
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  activeClassName="bg-muted text-foreground font-medium"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Sair">
              <NavLink
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted/50 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sair</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
