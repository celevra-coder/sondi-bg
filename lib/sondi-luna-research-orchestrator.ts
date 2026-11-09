import {
  searchLunaNationalSpatialEvidence
} from "./sondi-luna-national-spatial-index";
import "server-only";
import {
  searchLunaNationalResearch,
  readLunaNationalResearch
} from "./sondi-luna-national-research-tools";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import OpenAI from "openai";
import {
  searchLunaGeologicalRecords,
  readLunaGeologicalRecord,
  searchLunaNationalBoreholes
} from "./sondi-luna-research-tools";

const REVISION = "LUNA_RELEASE_GEOGRAPHIC_ISOLATION_V1";

const DATA_FILES = [
  "montana_research_spatial_evidence.geojson",
  "montana_integrated_research_catalog.json"
];

let snapshot: { signature: string; hash: string } | null = null;

export function lunaResearchDataVersion(): string {
  const dir = path.join(
    process.cwd(), "data", "soil-lithology", "runtime", "regions"
  );

  const paths = [
    path.join(process.cwd(), "data", "soil-lithology",
      "runtime", "national_research_evidence_catalog.json"),
    ...DATA_FILES.map(name => path.join(dir, name)),
    path.join(process.cwd(), "data", "soil-lithology",
      "bulgaria_borehole_lithology.json")
  ];
  const signature = paths.map(p => {
    const s = fs.statSync(p);
    return `${p}:${s.size}:${s.mtimeMs}`;
  }).join("|");

  if (snapshot?.signature === signature) return snapshot.hash;

  const h = createHash("sha256").update(REVISION);
  for (const p of paths) h.update(fs.readFileSync(p));

  snapshot = { signature, hash: h.digest("hex") };
  return snapshot.hash;
}

const tools: OpenAI.Responses.Tool[] = [
  {
    type: "function",
    name: "search_national_spatial_evidence",
    description:
      "Търси националните документални изследвания по проверени " +
      "координати и разстояние. По желание връща отделно " +
      "документални кандидати за декларирана област. " +
      "Не доказва литоложки пластове под имота. " +
      "Използвай read_national_research за оригиналния запис.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        radius_km: {
          type: ["number", "null"],
          description: "Радиус до 50 км; null за 10 км."
        },
        region: {
          type: ["string", "null"],
          description:
            "Област само ако е известна надеждно; " +
            "null без административен филтър."
        }
      },
      required: ["radius_km", "region"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "search_national_research",
    description:
      "Търси самостоятелно в националния каталог с документални геоложки " +
      "и хидрогеоложки сведения. Използвай геоложки термин, материал, " +
      "населено място или област. Резултатите са документални препратки, " +
      "не автоматично доказателства за избрания имот.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        query: { type: ["string", "null"] },
        region: { type: ["string", "null"] }
      },
      required: ["query", "region"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "read_national_research",
    description:
      "Чете оригинален запис от националния изследователски каталог " +
      "по точен intake_id. Провери източника, района, статуса и " +
      "дали има реална геореференция преди интерпретация.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        id: { type: "string" }
      },
      required: ["id"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "search_national_boreholes",
    description:
      "Търси в националния индекс на сондажи. " +
      "При borehole_id=null намира близките сондажи. " +
      "При зададен borehole_id прочита подробните литоложки интервали. " +
      "Разграничавай точни координати от регионални сведения. " +
      "Сондажните интервали са наблюдения в референтен обект, " +
      "а не доказани пластове под избрания имот.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        radius_km: {
          type: ["number", "null"],
          description: "Радиус до 50 км или null за 10 км."
        },
        borehole_id: {
          type: ["string", "null"],
          description: "null за търсене или точен ID за подробности."
        }
      },
      required: ["radius_km", "borehole_id"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "search_geological_records",
    description:
      "Самостоятелно търсене в наличните пространствени геоложки записи " +
      "и каталога на картографските материали. " +
      "Връща разстояния, статус на доказателствата и идентификатори. " +
      "Каталогът е регионален и не доказва пластове под имота.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: ["string", "null"],
          description: "Геоложка единица, материал или термин; null за общо пространствено търсене."
        },
        radius_km: {
          type: ["number", "null"],
          description: "Обхват в километри, максимум 15; null за 7."
        }
      },
      required: ["query", "radius_km"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "read_geological_record",
    description:
      "Прочита оригиналните атрибути на конкретен геоложки запис по evidence_id. " +
      "Включва статусите за геореференция и проверка. " +
      "Изследователски запис не е потвърдена сондажна колонка.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Точният evidence_id, получен от търсенето."
        }
      },
      required: ["id"],
      additionalProperties: false
    }
  }
];

export async function runLunaResearchCycle(
  client: OpenAI,
  model: string,
  instructions: string,
  payload: string,
  acceptFinal?: (text: string) => boolean
): Promise<{ status: string; output_text: string | null }> {
  const parsed = JSON.parse(payload) as {
    coordinate: { latitude: number; longitude: number }
  };

  const lat = parsed.coordinate.latitude;
  const lon = parsed.coordinate.longitude;

  // Coordinates come exclusively from the server, never from AI arguments.
  const history: unknown[] = [{
    role: "user",
    content: payload
  }];

  const researchInstructions = instructions + `

SONDI_LUNA_AUTONOMOUS_RESEARCH_V1:

SONDI_LUNA_RELEASE_GEOGRAPHIC_ISOLATION:
Използвай геоложки сведения само когато географската им
приложимост към избраната точка е обоснована.
Не пренасяй сведения от други области въз основа
на тематично съвпадение или име на геоложка свита.
Не приемай всички единици от картен лист за местни пластове.
При недостатъчни конкретни доказателства направи
качествен регионален геоложки анализ.

SONDI_LUNA_CLIENT_TEXT_QUALITY:
Пиши на естествен и разбираем български език.
Представяй геоложката обстановка, материалите,
тяхното практическо значение и ограниченията.
Не повтаряй едно и също предупреждение във всеки абзац.
Не използвай израза „легендарни сведения“.
Не изброявай несвързани геоложки формации.

SONDI_LUNA_NATIONAL_SPATIAL_INDEX_V1:
SONDI_LUNA_UNIFIED_SPATIAL_EVIDENCE_V1:

SONDI_LUNA_RESEARCH_SUPPORT_V11:

SONDI_LUNA_POLYGON_LEGEND_MATCH_V13:
Различавай общите названия на единици от картния лист
от названията, свързани с пресичащ изследователски полигон.
Полето polygon_legend_matches означава съвпадение на име,
не доказана геоложка единица под избраната точка.
Полето same_sheet_legend_reference_count е само справочен брой.
Не избирай автоматично всички свити от картния лист.
Не използвай тези съвпадения за дълбочинни интервали.
Единният пространствен индекс предоставя близки
изследователски клетки и картографски единици от
същия картен лист. Използвай ги само като кандидати
за допълнителен регионален геоложки контекст.
Близостта до клетка не доказва принадлежност към
нейната геоложка класификация.
Картният лист не доказва, че всички негови
геоложки единици присъстват под избраната точка.
Не извеждай дълбочинни интервали от тези записи.
Единният пространствен инструмент връща отделно проверени
сондажи, пресичащи изследователски полигони и документални
регионални сведения. Не ги смесвай.
Пресичането на изследователски полигон не доказва
геоложка единица или контакт под имота.
За точни сондажни колонки използвай
search_national_boreholes, а за подробен документален
запис използвай read_national_research.
Не приписвай на избраната точка измерените дълбочини
на съседен сондаж без достатъчно независими доказателства.
Използвай search_national_spatial_evidence за проверка
на наличните национални документални сведения с координати.
Различавай пространствено проверена позиция на източник
от доказана литология под имота.
При необходимост използвай read_national_research.
Не представяй регионален документ като измерена
сондажна колонка. Можеш да извеждаш условна
дълбочинна интерпретация от няколко пространствено
и геоложки съпоставими доказателства, включително
приблизително локализирани документи. Прочети
оригиналните записи и цитирай действителните intake_id.
Ако сведенията не позволяват надеждна дълбочинна
прогноза, избери REGIONAL и състави подробен
индивидуален анализ на геологията около избраната точка.
SONDI_LUNA_EVIDENCE_ACCESS_V3:
Резултатите от търсенето са указател към доказателствата,
а не заместител на оригиналните документи.

Самостоятелно избери кои намерени записи са относими
към избраната координата. Когато геоложкият извод
зависи от съдържанието на конкретен документ,
прочети неговия оригинален запис чрез подходящия
инструмент read_national_research или
read_geological_record.

За сондажи използвай search_national_boreholes
с идентификатора на конкретния сондаж, когато
е необходим пълният му литоложки разрез.

Съпоставяй точността на геореференцията, геоложката
среда, материалите, документираните дълбочини,
структурните различия и противоречията между източниците.

Не е задължително да прочиташ всеки намерен документ.
Ти решаваш кои са важни и кога събраните сведения
са достатъчни за надеждна интерпретация.

Приблизително локализираните сведения могат да
подкрепят обоснована условна прогноза, но не са
измерена колонка на избраната координата.

Ако дълбочинната опора не е достатъчна, самостоятелно
избери REGIONAL и състави индивидуален регионален
геоложки анализ от относимите сведения.
Не е необходимо да извикваш всички инструменти, ако вече
разполагаш с достатъчни доказателства.

SONDI_LUNA_NATIONAL_DOCUMENTARY_RESEARCH_V2:
Разполагаш с национални инструменти за сондажни и документални
геоложки доказателства.

Използвай search_national_boreholes за наличните сондажни колонки
около точката. Отвори подробно най-относимите записи и сравни
литоложките интервали, координатната точност и източниците.

Използвай search_national_research, когато са необходими
геоложка основа, регионална структура, разрези, стратиграфия
или допълнителни сведения за материалите. Използвай
read_national_research за проверка на относимите записи.

Областният филтър е документален, а не пространствен.
Ако административната област не е надеждно установена,
не я отгатвай. Можеш да търсиш по геоложки термин,
но тогава провери географската приложимост на всеки резултат.

Различавай:
- потвърдена принадлежност в първични метаданни;
- непотвърдено предположение от името на източниковия файл;
- действително проверени координати на сондаж;
- общ регионален геоложки контекст.

Несъответствие между област и източников файл изисква
повишено внимание и не разрешава местна интерпретация.
Не използвай документ за друг район като пряко доказателство.

Приблизително локализирани документи могат да подкрепят
самостоятелна геоложка интерпретация при обоснована
пространствена приложимост. Разграничавай измерени
факти, приблизително местоположение и AI прогноза.
Не представяй предполагаеми контакти като измерени.

Приоритет са надеждните плитки сведения. Сравнявай всички
относими близки сондажи, включително различията в покривката,
вместо да избираш само една представителна колонка.

Не измисляй дълбочини, пластове, водоносни хоризонти,
дебити или водни притоци. За дълбочинни интервали
спазвай изискванията на съществуващия валидатор.

Ако липсват достатъчни пространствено и дълбочинно
надеждни данни, изготви подробен регионален анализ,
без неподкрепени метрични интервали.

Самостоятелно избирай кои налични източници да проучиш.
Не е необходимо да извикваш всички инструменти,
когато доказателствата вече са достатъчни.
Преди заключението използвай инструментите за самостоятелно проучване.
Използвай search_national_boreholes за относимите национални
сондажни записи. Сам прецени кои сондажи заслужават подробно
прочитане. Запази статуса на координатите и източниците.
Не приемай непроверени регионални координати за точни.
Не пренасяй автоматично измерени дълбочини от сондаж към имота.
Започни с общо пространствено търсене около зададената точка.
Ако е необходимо, търси по геоложки единици и отвори конкретни записи.
Провери какво действително е установено и какво е само
предварителна картографска интерпретация.
Не приемай списъка от картен лист за литология под имота.
Не превръщай непотвърдените пространствени записи в сондажни дълбочини.
Върни окончателния JSON формат, указан по-горе.
`;

  let executedCalls = 0;

  for (let round = 0; round < 5; round++) {
    const response = await client.responses.create({
      model,
      instructions: researchInstructions,
      input: history as OpenAI.Responses.ResponseInput,
      tools,
      tool_choice: round === 0 ? "required" :
                   round === 4 ? "none" : "auto",
      include: ["reasoning.encrypted_content"],
      max_output_tokens: 6500,
      store: false
    });

    if (response.status !== "completed") {
      throw new Error("LUNA_RESEARCH_INCOMPLETE");
    }

    history.push(...response.output);

    const calls = response.output.filter(
      item => item.type === "function_call"
    );

    if (!calls.length) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[SONDI_LUNA_RESEARCH] FINAL_RESPONSE TOOLS_USED=" + executedCalls);
      }
      if (!response.output_text?.trim()) {
        throw new Error("LUNA_RESEARCH_NO_FINAL_TEXT");
      }

      // SONDI_LUNA_AUTONOMY_V1
      if (acceptFinal && !acceptFinal(response.output_text)) {
        if (round === 4) {
          throw new Error("LUNA_REVIEW_RETRIES_EXHAUSTED");
        }

        if (process.env.NODE_ENV !== "production") {
          console.info("[SONDI_LUNA_RESEARCH] SELF_CORRECTION_REQUESTED");
        }

        history.push({
          role: "user",
          content:
            "Проверката установи проблем с формата или доказателствата. " +
            "Прегледай източниците и поправи неподкрепените твърдения. " +
            "Можеш да продължиш проучването с инструментите. " +
            "Разграничавай документирани измервания от прогнози. " +
            "Върни коригиран JSON."
        });

        continue;
      }

return {
        status: response.status,
        output_text: response.output_text
      };
    }

    if (round === 4) {
      throw new Error("LUNA_RESEARCH_UNFINISHED_CALLS");
    }

    for (const call of calls) {
      executedCalls++;
      if (process.env.NODE_ENV !== "production") {
        console.info("[SONDI_LUNA_RESEARCH] TOOL_CALL", call.name);
      }

      if (executedCalls > 14) {
          // Every Responses API function call needs a corresponding
          // function_call_output. Stop additional research gracefully
          // instead of discarding already collected evidence.
          history.push({
            type: "function_call_output",
            call_id: call.call_id,
            output: JSON.stringify({
              error: "RESEARCH_TOOL_BUDGET_REACHED",
              executed_tool_limit: 14,
              instruction:
                "Do not request further tools. Complete the geological analysis using the evidence already collected. Preserve all evidence and depth-validation restrictions."
            })
          });

          if (process.env.NODE_ENV !== "production") {
            console.info(
              "[SONDI_LUNA_RESEARCH] TOOL_BUDGET_EXHAUSTED"
            );
          }

          continue;
        }

      let result: unknown;

      try {
        const args = JSON.parse(call.arguments) as Record<string, unknown>;

        if (call.name === "search_national_spatial_evidence") {
          result = searchLunaNationalSpatialEvidence({
            latitude: lat,
            longitude: lon,
            radius_km: typeof args.radius_km === "number"
              ? args.radius_km : undefined,
            region: typeof args.region === "string"
              ? args.region : undefined
          });
        } else if (call.name === "search_national_research") {
          result = searchLunaNationalResearch({
            query: typeof args.query === "string"
              ? args.query : undefined,
            region: typeof args.region === "string"
              ? args.region : undefined
          });
        } else if (call.name === "read_national_research") {
          result = readLunaNationalResearch(String(args.id ?? ""));
        } else if (call.name === "search_geological_records") {
          result = searchLunaGeologicalRecords({
            latitude: lat,
            longitude: lon,
            query: typeof args.query === "string"
              ? args.query : undefined,
            radius_km: typeof args.radius_km === "number"
              ? args.radius_km : undefined
          });
        } else if (call.name === "search_national_boreholes") {
          result = searchLunaNationalBoreholes({
            latitude: lat,
            longitude: lon,
            radius_km: typeof args.radius_km === "number"
              ? args.radius_km : undefined,
            borehole_id: typeof args.borehole_id === "string"
              ? args.borehole_id : undefined
          });        } else if (call.name === "read_geological_record") {
          const requestedId = String(args.id ?? "");
          const nearbyEvidence = searchLunaGeologicalRecords({
            latitude: lat,
            longitude: lon,
            radius_km: 15
          });
          const exactNearbyMatch = (nearbyEvidence.spatial ?? []).some(
            item => item.id === requestedId
          );
          result = exactNearbyMatch
            ? readLunaGeologicalRecord(requestedId)
            : { error: "LEGACY_RECORD_NOT_SPATIALLY_MATCHED" };
        } else {
          result = { error: "UNKNOWN_RESEARCH_TOOL" };
        }
      } catch {
        result = { error: "INVALID_TOOL_ARGUMENTS_OR_SOURCE" };
      }

      if (process.env.NODE_ENV !== "production") {
        console.info("[SONDI_LUNA_RESEARCH] TOOL_RESULT",
          call.name, "CHARS=" + JSON.stringify(result).length);
      }

      history.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: (() => {
          const serialized = JSON.stringify(result);
          if (process.env.NODE_ENV !== "production") {
            console.info(
              "[SONDI_LUNA_RESEARCH] EVIDENCE_DELIVERY",
              call.name,
              "TOTAL=" + serialized.length,
              "DELIVERED=" + Math.min(serialized.length, 48000)
            );
          }
          return serialized.slice(0, 48000);
        })()
      });
    }
  }

  throw new Error("LUNA_RESEARCH_NO_FINAL_RESPONSE");
}