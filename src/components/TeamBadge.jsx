import React from 'react';
import { getTeamFlagUrl } from '../services/flags';

const TeamBadge = ({ team, layout = 'vertical', showFullName = true }) => {
  if (!team) return null;

  const flagUrl = team.flagUrl || getTeamFlagUrl(team.fifaCode);

  if (layout === 'horizontal') {
    return (
      <div className="flex items-center gap-sm">
        {flagUrl ? (
          <img 
            src={flagUrl} 
            alt={team.name} 
            className="w-7 h-5 object-cover rounded shadow-sm border border-outline-variant"
          />
        ) : (
          <div className="w-7 h-5 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center font-bold text-[9px] text-on-surface-variant">
            {team.fifaCode || 'LOC'}
          </div>
        )}
        <span className="font-label-bold text-xs text-on-surface truncate">
          {showFullName ? team.name : team.fifaCode}
        </span>
      </div>
    );
  }

  // Layout vertical por defecto (diseño tipo transmisión de TV: bandera arriba, abreviatura abajo)
  return (
    <div className="flex flex-col items-center gap-xs text-center group">
      <div className="relative overflow-hidden w-12 h-8 rounded-md shadow border border-outline-variant bg-surface-container-low transition-transform duration-200 group-hover:scale-105">
        {flagUrl ? (
          <img 
            src={flagUrl} 
            alt={team.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-outline-variant">
            {team.fifaCode || 'LOC'}
          </div>
        )}
      </div>
      
      <div className="flex flex-col mt-1">
        <span className="font-label-bold text-xs font-bold text-on-surface uppercase tracking-wider">
          {team.fifaCode}
        </span>
        {showFullName && (
          <span className="text-[10px] text-on-surface-variant opacity-75 line-clamp-1">
            {team.name}
          </span>
        )}
      </div>
    </div>
  );
};

export default TeamBadge;
