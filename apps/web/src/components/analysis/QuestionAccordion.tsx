import { useState } from "react";
import type { PlainAnswers } from "@truestock/types";
import { ChevronIcon } from "../ui/ChevronIcon";

const QUESTIONS: {
  key: keyof PlainAnswers;
  question: string;
  number: number;
}[] = [
  { number: 1, key: "isProfitable", question: "Công ty này có đang kiếm tiền không?" },
  { number: 2, key: "isDebtSafe", question: "Mức nợ có an toàn không?" },
  { number: 3, key: "isGrowing", question: "Công ty có đang tăng trưởng không?" },
  { number: 4, key: "isPriceReasonable", question: "Giá cổ phiếu có hợp lý không?" },
  { number: 5, key: "suitableFor", question: "Cổ phiếu này phù hợp với ai?" },
];

interface QuestionAccordionProps {
  plainAnswers: PlainAnswers;
}

export function QuestionAccordion({ plainAnswers }: QuestionAccordionProps) {
  const [openKey, setOpenKey] = useState<keyof PlainAnswers | null>("isProfitable");

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="text-base font-semibold text-navy sm:text-lg">Giải thích chi tiết</h2>
        <p className="mt-1 text-sm text-slate-500">
          5 câu hỏi mọi nhà đầu tư F0 đều muốn biết
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {QUESTIONS.map(({ key, question, number }) => {
          const isOpen = openKey === key;

          return (
            <div key={key}>
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : key)}
                className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition sm:items-center sm:gap-4 sm:px-6 sm:py-4 ${
                  isOpen ? "bg-teal/5" : "hover:bg-slate-50"
                }`}
                aria-expanded={isOpen}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:mt-0 sm:h-8 sm:w-8 sm:text-sm ${
                    isOpen
                      ? "bg-teal text-white"
                      : "bg-navy/5 text-navy"
                  }`}
                >
                  {number}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-navy sm:text-base">
                  {question}
                </span>
                <ChevronIcon open={isOpen} className="mt-1 shrink-0 sm:mt-0" />
              </button>

              <div
                className={`grid transition-all duration-200 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-teal/10 bg-gradient-to-b from-teal/5 to-transparent px-4 py-3.5 sm:px-6 sm:py-4 sm:pl-[4.5rem]">
                    <p className="text-sm leading-relaxed text-slate-700">
                      {plainAnswers[key]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
