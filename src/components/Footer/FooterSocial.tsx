import React from 'react'

import { Facebook, Instagram } from "lucide-react";
import { FOOTER_SOCIAL, footerColumnHeadingClass } from "./constants";

const socialButtonClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition-colors hover:border-white/35 hover:bg-white/10 hover:text-white";


export const FooterSocial = () => {
    return (
        <div>
            <h4 className={footerColumnHeadingClass}>Социални мрежи</h4>

            <div className="mt-6 flex items-center gap-2">
                <a
                    href={FOOTER_SOCIAL.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={socialButtonClass}
                    aria-label="Instagram"
                >
                    <Instagram className="h-6 w-6" strokeWidth={1.75} />
                </a>
                <a
                    href={FOOTER_SOCIAL.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={socialButtonClass}
                    aria-label="Facebook"
                >
                    <Facebook className="h-6 w-6" strokeWidth={1.75} />
                </a>
            </div>
        </div>
    )
}

