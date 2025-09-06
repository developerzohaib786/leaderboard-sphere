"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from '@/components/ui/navbar-menu';
import { cn } from "@/lib/utils";


export default function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
          <HoveredLink href="/">
         LeaderBoard Sphere
        </HoveredLink>
        <HoveredLink href="/uploadfile">
         Upload Project
        </HoveredLink>
        <HoveredLink href="/uploadfile">
         Chat Rooms
        </HoveredLink>
        
      </Menu>
    </div>
  );
}
