"use client";

import Link from "next/link";
import Image from "next/image";
import { useStorefront } from "@/contexts/StorefrontContext";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShoppingCart, User, LogOut, Menu, ChevronDown } from "lucide-react";
import CartDropdown from "./CartDropdown";
import UserDropdown from "./UserDropdown";

function Header() {
  const { cart, customerToken, setCustomerToken, customer } = useStorefront();
  const [store, setStore] = useState<any>(null);
  const [navlinks, setNavlinks] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/storefront/store")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setStore(result.data);
        }
      })
      .catch(() => {
      });

    fetch("/api/storefront/navlinks")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setNavlinks(result.data);
        }
      })
      .catch(() => {
      });
  }, []);

  const cartItemCount = useMemo(
    () => cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    [cart?.items]
  );

  const navigationLinks = useMemo(
    () => [
      { href: "/", label: "Home", external: false },
      { href: "/store", label: "Products", external: false },
      {
        href: "https://discord.gg/PwxWSsZzUP",
        label: "Discord",
        external: true,
      },
      ...navlinks
        .filter((link) => link.url)
        .map((link) => ({
          href: link.url,
          label: link.label,
          external: link.url.startsWith("http"),
        })),
    ],
    [navlinks]
  );

  const handleCartToggle = useCallback(() => {
    setCartOpen((prev) => !prev);
  }, []);

  const handleUserToggle = useCallback(() => {
    setUserDropdownOpen((prev) => !prev);
  }, []);

  const handleMobileToggle = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  return (
    <>
      <header className="fixed left-1/2 -translate-x-1/2 w-1/2 z-50 bg-white/5 mt-5 rounded-2xl min-w-fit px-6 backdrop-blur-sm border border-border/50">
        <div className="flex h-16 items-center justify-between gap-8">
          <Link href="/" className="flex items-center space-x-2 z-10">
            DM TWEAKS
          </Link>

          <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {navigationLinks.map((link) =>
              link.external ? (
                <Link
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-2 relative">
            {customerToken && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9"
                  onClick={handleCartToggle}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-semibold">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
                <CartDropdown
                  isOpen={cartOpen}
                  onClose={() => setCartOpen(false)}
                />
              </div>
            )}

            <div className="lg:hidden relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={handleMobileToggle}
              >
                {mobileMenuOpen ? (
                  <ChevronDown className="h-5 w-5 rotate-180 transition-transform" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {mobileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/50"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <Card className="absolute right-0 top-full mt-2 w-56 z-50 shadow-lg border">
                    <nav className="flex flex-col p-2">
                      {navigationLinks.map((link) =>
                        link.external ? (
                          <Link
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 text-sm font-medium text-foreground rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 text-sm font-medium text-foreground rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            {link.label}
                          </Link>
                        )
                      )}
                      <div className="border-t my-2" />
                      {customerToken ? (
                        <>
                          <div className="px-3 py-2">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Name
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {customer?.name || "N/A"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setCustomerToken(null);
                              setMobileMenuOpen(false);
                            }}
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                            size="sm"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            asChild
                            className="w-full mb-2"
                            size="sm"
                          >
                            <Link
                              href="/store/register"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              Sign Up
                            </Link>
                          </Button>
                          <Button asChild className="w-full" size="sm">
                            <Link
                              href="/store/login"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              Login
                            </Link>
                          </Button>
                        </>
                      )}
                    </nav>
                  </Card>
                </>
              )}
            </div>

            {customerToken ? (
              <div className="hidden lg:block relative">
                <Button
                  variant="ghost"
                  onClick={handleUserToggle}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden xl:inline">
                    {customer?.name || "Account"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
                <UserDropdown
                  isOpen={userDropdownOpen}
                  onClose={() => setUserDropdownOpen(false)}
                />
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  size="sm"
                  className="hidden lg:flex"
                >
                  <Link href="/store/register">Sign Up</Link>
                </Button>
                <Button asChild size="sm" className="hidden lg:flex">
                  <Link href="/store/login">Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default memo(Header);
