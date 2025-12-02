"use client"
import { ThemeToggle } from "./theme-toggle"
import { Notifications } from "./notifications"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSettings } from "@/contexts/settings-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import React from "react"

export function TopNav() {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)
  const { settings } = useSettings()

  return (
    <header className="sticky top-0 z-40 neu-topbar bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Breadcrumb con estilo neumórfico */}
        <div className="hidden md:block">
          <nav className="flex items-center space-x-2">
            <Link href="/" className="text-sm font-medium neu-badge hover:text-primary transition-colors">
              Inicio
            </Link>
            {pathSegments.map((segment, index) => (
              <React.Fragment key={segment}>
                <span className="text-muted-foreground">/</span>
                <Link
                  href={`/${pathSegments.slice(0, index + 1).join("/")}`}
                  className="text-sm font-medium neu-badge hover:text-primary transition-colors"
                >
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Actions con estilo neumórfico */}
        <div className="flex items-center gap-3">
          <div className="neu-icon-sm">
            <Notifications />
          </div>
          <div className="neu-icon-sm">
            <ThemeToggle />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative neu-avatar h-10 w-10 rounded-full overflow-hidden">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={settings.avatar || "/placeholder.svg"} alt={settings.fullName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {settings.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 neu-dropdown" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{settings.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{settings.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/20" />
              <DropdownMenuItem asChild className="hover:neu-pressed rounded-lg transition-all">
                <Link href="/settings">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:neu-pressed rounded-lg transition-all">
                <Link href="/settings">Configuración</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:neu-pressed rounded-lg transition-all text-destructive">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
