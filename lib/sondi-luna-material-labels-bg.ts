import "server-only";
import OpenAI from "openai";
import { unstable_cache } from "next/cache";

/**
 * SONDI_LUNA_BG_MATERIAL_LABELS_V1
 * Presentation-only names. The original lithology strings remain
 * authoritative for depth evidence, source matching and validation.
 */
export const getSondiLunaMaterialLabelsBg = unstable_cache(
  async (materials: string[]): Promise<Record<string,string>> => {
    const originals = [...new Set(
      materials
        .filter((value): value is string => typeof value === "string")
        .map(value => value.trim())
        .filter(value => value.length > 0 && /[A-Za-z]/u.test(value))
    )].slice(0, 40);

    if (!originals.length ||
        process.env.SONDI_CLIENT_AI_ENABLED !== "true" ||
        !process.env.OPENAI_API_KEY) return {};

    try {
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 60000,
        maxRetries: 0
      });
      const response = await client.responses.create({
        model: process.env.SONDI_CLIENT_AI_MODEL || "gpt-6-luna",
        instructions: [
          "Ти подготвяш само българските заглавия на литоложки материали",
          "за клиентския интерфейс на SONDI.BG.",
          "Преведи точно геоложкия смисъл на всеки оригинален термин.",
          "Запази разликите между геоложка възраст, скален материал и формация.",
          "Не добавяй нови материали, дълбочини, свойства, вода или прогнози.",
          "Не интерпретирай сондажа. Не променяй оригиналните стойности.",
          'Върни САМО JSON: {"labels":[{"original":"точният вход","bg":"българско наименование"}]}.',
          "Полето original се копира дословно от входа.",
          "Полето bg е кратко, геоложки точно и задължително на кирилица."
        ].join("\n"),
        input: JSON.stringify({materials: originals}),
        max_output_tokens: 3000
      });

      const parsed: unknown = JSON.parse(response.output_text.trim());
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        return {};
      const entries = (parsed as {labels?:unknown}).labels;
      if (!Array.isArray(entries)) return {};

      const allowed = new Set(originals);
      const labels: Record<string,string> = {};
      for (const item of entries) {
        if (!item || typeof item !== "object" || Array.isArray(item))
          continue;
        const entry = item as {original?:unknown;bg?:unknown};
        if (typeof entry.original !== "string" ||
            typeof entry.bg !== "string" ||
            !allowed.has(entry.original) ||
            entry.bg.length < 3 ||
            entry.bg.length > 220 ||
            !/\p{Script=Cyrillic}/u.test(entry.bg))
          continue;
        labels[entry.original] = entry.bg.trim();
      }
      return labels;
    } catch {
      // The original documented label is always a safe fallback.
      return {};
    }
  },
  ["sondi-luna-bg-material-labels-v1"],
  {revalidate: 2592000}
);


// SONDI_EXACT_MATERIAL_DESCRIPTIONS_BG_V1
// Presentation-only descriptions; documented observations remain untouched.
export const getSondiLunaExactMaterialExplanationsBg = unstable_cache(
  async(materials:string[]):Promise<Record<string,string>>=>{
    const originals=[...new Set(
      materials.filter((x):x is string=>typeof x==="string")
        .map(x=>x.trim()).filter(x=>x.length>0)
    )].slice(0,50);
    if(!originals.length ||
       process.env.SONDI_CLIENT_AI_ENABLED!=="true" ||
       !process.env.OPENAI_API_KEY)return {};

    try {
      const client=new OpenAI({
        apiKey:process.env.OPENAI_API_KEY,
        timeout:60000,
        maxRetries:0
      });
      const response=await client.responses.create({
        model:process.env.SONDI_CLIENT_AI_MODEL||"gpt-6-luna",
        instructions:[
          "Подготви кратки индивидуални литоложки обяснения на български",
          "за документирани материали от реални сондажни колонки.",
          "За всеки материал напиши едно или две конкретни изречения.",
          "Обясни какъв е материалът и, ако следва от природата му,",
          "характерна особеност, важна при сондиране.",
          "Различните материали изискват различни обяснения.",
          "Не използвай общи повтарящи се фрази.",
          "Не извеждай наличие на вода, дебит, локална напуканост",
          "или конкретна пробиваемост без доказателства.",
          "Не добавяй пластове, дълбочини или геоложки контакти.",
          "Никога не изменяй оригиналното наименование.",
          'Върни само JSON: {"items":[{"original":"точен вход","explanation_bg":"обяснение на български"}]}.',
          "original трябва да съвпада дословно с входния материал."
        ].join("\n"),
        input:JSON.stringify({materials:originals}),
        max_output_tokens:5000
      });
      const parsed:unknown=JSON.parse(response.output_text.trim());
      if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))return {};
      const items=(parsed as {items?:unknown}).items;
      if(!Array.isArray(items))return {};
      const allowed=new Set(originals);
      const result:Record<string,string>={};
      const used=new Set<string>();
      for(const item of items){
        if(!item||typeof item!=="object"||Array.isArray(item))continue;
        const x=item as {original?:unknown;explanation_bg?:unknown};
        if(typeof x.original!=="string"||typeof x.explanation_bg!=="string"||
           !allowed.has(x.original))continue;
        const value=x.explanation_bg.trim();
        if(value.length<35||value.length>350||
           !/\p{Script=Cyrillic}/u.test(value)||
           used.has(value)||
           value.includes("Практическите условия за сондиране зависят"))
          continue;
        result[x.original]=value;
        used.add(value);
      }
      return result;
    }catch{
      // Never replace missing evidence with generic invented prose.
      return {};
    }
  },
  ["sondi-exact-material-descriptions-bg-v1"],
  {revalidate:2592000}
);
