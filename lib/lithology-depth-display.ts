/** Reader-friendly descriptions for all lithology depth reports.
 * Display-only: never changes formation identity, depths, confidence, or evidence.
 */
export function explainDepthLithology(raw: string): { title: string; explanation: string } {
  const title = raw.trim();
  const normalized = title.toLocaleLowerCase('bg-BG');
  const meanings: Array<[RegExp, string]> = [
    [/льос|loess/i, 'льосът е фин праховиден материал, натрупан главно от вятъра'],
    [/алувиал|alluvium|alluvial/i, 'алувиалните наслаги са пясъци, чакъли и глини, отложени от реки'],
    [/кватернер|quaternary/i, 'кватернерът е най-младият геоложки период'],
    [/неоген|neogene/i, 'неогенът е по-стар геоложки период; тук могат да участват различни глини, пясъци и скали'],
    [/сармат|sarmatian/i, 'сарматът е част от геоложката последователност на неогена'],
    [/мергел|marl/i, 'мергелът е скала от глинест и варовиков материал'],
    [/варовик|limestone/i, 'варовикът е твърда скала, изградена главно от калциев карбонат'],
    [/пясъчник|sandstone/i, 'пясъчникът е втвърден и споен пясък'],
    [/конгломерат|conglomerate/i, 'конгломератът е скала от споени заоблени чакъли и камъни'],
    [/алевролит|siltstone/i, 'алевролитът е скала от споени много фини песъчливи частици'],
    [/гнайс|gneiss/i, 'гнайсът е твърда метаморфна скала; водата може да се движи по пукнатини'],
    [/шист|schist/i, 'шистите са скали с ясно изразена слоестост или разсланяване'],
    [/амфиболит|amphibolite/i, 'амфиболитът е твърда метаморфна скала'],
    [/доломит|dolomite/i, 'доломитът е карбонатна скала, подобна на варовика'],
    [/кристалин|crystalline/i, 'кристалинните скали са твърди скали, често с пукнатини'],
    [/интрузив|гранит|granite/i, 'гранитните скали са твърди магмени скали'],
    [/кредн|cretaceous/i, 'кредата е древен геоложки период, а не непременно бяла креда като материал'],
    [/прослойк|intercalation/i, 'прослойката е сравнително тънък пласт сред други материали'],
    [/конкреци|concretion/i, 'конкрециите са малки по-твърди минерални образувания вътре в пласта'],
  ];
  const found = meanings.filter(([pattern]) => pattern.test(normalized)).slice(0, 2).map(([, explanation]) => explanation);
  return {
    title,
    explanation: found.length > 0 ? `${found.join('; ')}.` : '',
  };
}
