"use client";

import { FooterBrand } from "./FooterBrand";
import { FooterCopyright } from "./FooterCopyright";
import { FooterForStudios } from "./FooterForStudios";
import { FooterQuickLinks } from "./FooterQuickLinks";
import { FooterSocial } from "./FooterSocial";

const Footer: React.FC = () => (
  <footer className="border-t border-white/10 bg-yoga-text text-neutral-400">
    <div className="container mx-auto px-4 pt-10 pb-6 grid text-sm leading-relaxed grid-cols-7">
      <FooterBrand />
      <FooterQuickLinks />
      <FooterForStudios />
      <FooterSocial />
    </div>
    <FooterCopyright />
  </footer>
);

export default Footer;
