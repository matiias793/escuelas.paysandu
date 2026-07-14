'use client';

import { useEffect, useState } from 'react';
import { FaCheck, FaExternalLinkAlt, FaSchool } from 'react-icons/fa';
import {
  appAuthInputClass,
  appAuthLabelClass,
  appPanelClass,
  plannerBtnPrimary,
  plannerBtnSecondary,
} from '@/styles/ui';

type Props = {
  idPrefix?: string;
};

export default function PublicPaysanduSchoolsGalleryLinkSection({
  idPrefix = 'schools-gallery',
}: Props) {
  const [copied, setCopied] = useState(false);
  const [galleryUrl, setGalleryUrl] = useState('/');
  const inputId = `${idPrefix}-url`;

  useEffect(() => {
    setGalleryUrl(`${window.location.origin}/`);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(galleryUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`${appPanelClass} space-y-3 p-3 sm:p-4`}>
      <div className="flex items-start gap-3">
        <FaSchool className="mt-0.5 shrink-0 text-primary" size={18} aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-800">Galería pública</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600">
            Compartí este enlace para que cualquiera vea las escuelas con foto e
            información, sin iniciar sesión.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor={inputId} className={appAuthLabelClass}>
          Enlace de la galería
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <input
            id={inputId}
            type="text"
            readOnly
            value={galleryUrl}
            className={`${appAuthInputClass} break-all text-xs sm:flex-1 sm:text-sm`}
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            onClick={() => void handleCopy()}
            className={`${plannerBtnPrimary} min-h-11 w-full touch-manipulation justify-center sm:w-auto sm:shrink-0`}
          >
            {copied ? (
              <>
                <FaCheck aria-hidden />
                Copiado
              </>
            ) : (
              'Copiar enlace'
            )}
          </button>
        </div>
      </div>

      <a
        href={galleryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${plannerBtnSecondary} inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 sm:w-auto`}
      >
        <FaExternalLinkAlt size={12} aria-hidden />
        Abrir galería
      </a>
    </div>
  );
}
