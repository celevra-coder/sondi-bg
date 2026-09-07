"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SearchSettlement = {
  name: string;
  slug: string;
  municipality: string;
  district: string;
};

export default function WaterSearch({
  settlements,
}: {
  settlements: SearchSettlement[];
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query
      .trim()
      .toLocaleLowerCase("bg-BG");

    if (!q) {
      return settlements.slice(0, 12);
    }

    return settlements
      .filter((item) => {
        const haystack = [
          item.name,
          item.municipality,
          item.district,
        ]
          .join(" ")
          .toLocaleLowerCase("bg-BG");

        return haystack.includes(q);
      })
      .slice(0, 20);
  }, [query, settlements]);

  return (
    <div className="rounded-[26px] border border-[#d8e8ea] bg-white p-5 shadow-[0_18px_55px_rgba(25,74,82,.08)] sm:p-7">
      <label
        htmlFor="water-place-search"
        className="block text-sm font-bold text-[#234951]"
      >
        {"\u0422\u044a\u0440\u0441\u0435\u043d\u0435 \u043f\u043e \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e"}
      </label>

      <input
        id="water-place-search"
        type="search"
        value={query}
        onChange={(event) =>
          setQuery(event.target.value)
        }
        placeholder={"\u041d\u0430\u043f\u0440. \u0411\u0435\u0440\u043a\u043e\u0432\u0438\u0446\u0430, \u041f\u0435\u0442\u0440\u0438\u0447, \u041f\u043b\u043e\u0432\u0434\u0438\u0432..."}
        className="mt-3 w-full rounded-2xl border border-[#d7e5e8] bg-white px-4 py-3.5 text-[15px] text-[#173943] outline-none transition focus:border-[#56a4a8] focus:ring-4 focus:ring-[#dff1f2]"
      />

      <div className="mt-4 grid gap-2">
        {results.length > 0 ? (
          results.map((item) => (
            <Link
              key={item.slug}
              href={`/water/${item.slug}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-[#e0eaec] bg-[#f8fbfb] px-4 py-3 transition hover:border-[#a8d0d7] hover:bg-white"
            >
              <div>
                <div className="font-bold text-[#183f49]">
                  {item.name}
                </div>

                <div className="mt-0.5 text-xs text-[#6b8187]">
                  {item.municipality}
                  {" \u00b7 "}
                  {item.district.replace(
                    /^\u043e\u0431\u043b\.\s*/i,
                    "",
                  )}
                </div>
              </div>

              <span className="text-[#27788a]">
                {"\u2192"}
              </span>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[#c8dcdf] bg-[#f8fbfb] px-4 py-6 text-center text-sm text-[#6b8187]">
            {"\u041d\u0435 \u0435 \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u043e \u043d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e \u0432 \u0442\u0435\u043a\u0443\u0449\u0438\u044f \u043f\u0443\u0431\u043b\u0438\u0447\u0435\u043d \u0438\u043d\u0434\u0435\u043a\u0441."}
          </div>
        )}
      </div>
    </div>
  );
}
