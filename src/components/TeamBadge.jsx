import React from 'react';
import { getTeamFlagUrl } from '../services/flags';
import { teamCode, teamName } from '../utils/formatters';

const TeamBadge = ({ team, layout = 'vertical', showFullName = true }) => {
  const code = teamCode(team);
  const name = teamName(team);
  const flagUrl = team?.flagUrl || getTeamFlagUrl(code);

  const flag = flagUrl ? (
    <img src={flagUrl} alt={name} className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-surface-container-high text-xs font-extrabold text-on-surface-variant">{code}</div>
  );

  if (layout === 'horizontal') {
    return (
      <div className="flex min-w-0 items-center gap-sm">
        <div className="h-8 w-11 shrink-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high shadow-md shadow-black/20">{flag}</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-on-surface">{showFullName ? name : code}</p>
          {showFullName && <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{code}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-xs text-center">
      <div className="relative h-14 w-16 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high shadow-lg shadow-black/30 ring-1 ring-white/5">
        {flag}
      </div>
      <div>
        <p className="text-lg font-extrabold uppercase leading-none tracking-wide text-on-surface">{code}</p>
        {showFullName && <p className="mt-1 max-w-[120px] truncate text-[11px] font-semibold text-on-surface-variant">{name}</p>}
      </div>
    </div>
  );
};

export default TeamBadge;
