/**
 * Mapea códigos FIFA de países a códigos ISO de 2 letras para flagcdn.com
 */
export const getTeamFlagUrl = (fifaCode) => {
  if (!fifaCode) return null;
  const mapping = {
    ARG: 'ar',
    BRA: 'br',
    FRA: 'fr',
    ESP: 'es',
    MEX: 'mx',
    USA: 'us',
    CAN: 'ca',
    GER: 'de',
    ITA: 'it',
    ENG: 'gb-eng',
    POR: 'pt',
    URU: 'uy',
    COL: 'co',
    CHL: 'cl',
    NED: 'nl',
    BEL: 'be',
    CRO: 'hr',
    MAR: 'ma',
    SEN: 'sn',
    JPN: 'jp',
    KOR: 'kr',
    ECU: 'ec',
    PER: 'pe',
    PAR: 'py',
    VEN: 've',
  };
  const code = mapping[fifaCode.toUpperCase()];
  return code ? `https://flagcdn.com/w80/${code}.png` : null;
};
