"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  BarChart2,
  Building2,
  Folder,
  Wallet,
  Receipt,
  CreditCard,
  Users2,
  Shield,
  MessagesSquare,
  Video,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  Users,
  FileText,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

const navigation = [
  { name: "Panel Principal", href: "/", icon: Home },
  { name: "Analíticas", href: "/analytics", icon: BarChart2 },
  { name: "Clientes", href: "/customers", icon: Users },
  { name: "Servicios", href: "/services", icon: Package },
  { name: "Preventas", href: "/preventas", icon: FileText },
  { name: "Organización", href: "/organization", icon: Building2 },
  { name: "Proyectos", href: "/projects", icon: Folder },
  { name: "Transacciones", href: "/transactions", icon: Wallet },
  { name: "Facturas", href: "/invoices", icon: Receipt },
  { name: "Pagos", href: "/payments", icon: CreditCard },
  { name: "Miembros", href: "/members", icon: Users2 },
  { name: "Permisos", href: "/permissions", icon: Shield },
  { name: "Chat", href: "/chat", icon: MessagesSquare },
  { name: "Reuniones", href: "/meetings", icon: Video },
]

const bottomNavigation = [
  { name: "Configuración", href: "/settings", icon: Settings },
  { name: "Ayuda", href: "/help", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const NavItem = ({ item, isBottom = false }: { item: (typeof navigation)[0]; isBottom?: boolean }) => (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
            pathname === item.href ? "neu-pressed text-primary" : "text-muted-foreground hover:text-foreground",
            isCollapsed && "justify-center px-2",
          )}
        >
          <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span>{item.name}</span>}
        </Link>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right" className="neu-flat">
          {item.name}
        </TooltipContent>
      )}
    </Tooltip>
  )

  return (
    <TooltipProvider>
      <>
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 neu-convex rounded-xl"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Alternar barra lateral"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div
          className={cn(
            "fixed inset-y-0 z-20 flex flex-col transition-all duration-300 ease-in-out lg:static",
            "bg-background neu-sidebar",
            isCollapsed ? "w-[72px]" : "w-72",
            isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          {/* Header */}
          <div className="border-b border-border/20">
            <div className={cn("flex h-16 items-center gap-2 px-4", isCollapsed && "justify-center px-2")}>
              {!isCollapsed && (
                <Link href="/" className="flex items-center font-semibold">
                  <span className="text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Sib Naranja v.08
                  </span>
                </Link>
              )}
              <button
                className={cn("ml-auto h-8 w-8 neu-icon-sm", isCollapsed && "ml-0")}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                <span className="sr-only">{isCollapsed ? "Expandir" : "Contraer"} Barra lateral</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-auto neu-scrollbar">
            <nav className="flex-1 space-y-2 px-3 py-4">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-border/20 p-3">
            <nav className="space-y-2">
              {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} isBottom />
              ))}
            </nav>
          </div>
        </div>
      </>
    </TooltipProvider>
  )
}
