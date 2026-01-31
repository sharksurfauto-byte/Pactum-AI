export const FINANCIAL_KEYWORDS: Record<string, string[]> = {
    budget: ["budget", "spending", "expenses", "cost", "afford"],
    investment: ["invest", "stock", "portfolio", "fund", "etf", "401k"],
    savings: ["save", "savings", "emergency fund", "nest egg"],
    debt: ["debt", "loan", "mortgage", "credit", "repay"],
    retirement: ["retire", "pension", "social security"],
    goals: ["goal", "target", "plan", "milestone"],
};

export function extractFinancialInsights(text: string) {
    const normalized = text.toLowerCase();
    const hits: Record<string, string[]> = {};
    const words = normalized.split(/\s+/).filter((w) => w.length > 0);
    const totalWords = words.length;
    let totalMatches = 0;

    for (const [topic, keywords] of Object.entries(FINANCIAL_KEYWORDS)) {
        const matches = keywords.filter((w) => normalized.includes(w));
        if (matches.length > 0) {
            hits[topic] = matches;
            totalMatches += matches.length;
        }
    }

    return {
        hits,
        topics: Object.keys(hits),
        source: "keyword_extraction",
        confidence: totalWords > 0 ? totalMatches / totalWords : 0,
    };
}
