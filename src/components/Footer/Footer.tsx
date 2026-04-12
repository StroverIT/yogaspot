"use client";

import { FooterBetaNotice } from "./FooterBetaNotice";
import { FooterBrand } from "./FooterBrand";
import { FooterCopyright } from "./FooterCopyright";
import { FooterForStudios } from "./FooterForStudios";
import { FooterQuickLinks } from "./FooterQuickLinks";
import { FooterSocial } from "./FooterSocial";

const Footer: React.FC = () => (
  <footer className="border-t border-white/10 bg-yoga-text text-neutral-400">
    <div className="container mx-auto px-4 pt-10 pb-6 text-sm leading-relaxed grid grid-cols-1 md:grid-cols-7 gap-y-10">
      <FooterBrand />
      <FooterQuickLinks />
      <FooterForStudios />
      <FooterSocial />
    </div>
    <FooterBetaNotice />
    <FooterCopyright />
  </footer>
);

export default Footer;
