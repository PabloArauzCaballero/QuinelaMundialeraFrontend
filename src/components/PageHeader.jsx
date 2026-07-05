import React from 'react';

const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-col gap-md border-b border-outline-variant pb-md md:flex-row md:items-end md:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="mb-xs text-xs font-extrabold uppercase tracking-[0.25em] text-primary">{eyebrow}</p>}
      <h1 className="font-headline-md text-[34px] font-extrabold leading-none tracking-tight text-on-surface md:text-[48px]">{title}</h1>
      {description && <p className="mt-sm max-w-3xl text-sm text-on-surface-variant md:text-base">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-sm">{actions}</div>}
  </div>
);

export default PageHeader;
