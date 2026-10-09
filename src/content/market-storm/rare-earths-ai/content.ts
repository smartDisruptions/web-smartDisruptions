/**
 * Rare earths in the age of AI — every word and number on the page.
 *
 * This file is the article. It was ported verbatim from the STORM report
 * (vault: .reports/storm-2026-10-08-rare-earths-ai-visual.html); only the
 * typography changed (straight quotes became curly). Components read from
 * here and never retype copy, so a design change can't drift the content.
 *
 * Inline markup in any `Rich` string (rendered by <Rich> in ./ui):
 *   **bold**          strong
 *   *em*              emphasis
 *   ^[24] ^[32,33]    citation(s) → #src-24 in the source list
 *   {unv:text}        a status flag (unv = unconfirmed)
 */

/** A string that may carry the inline markup above. */
export type Rich = string;

export type StatusKind = 'ok' | 'unv' | 'fix';
export type WorldKey = 'takeoff' | 'steady' | 'stall';
export type FactorKey = 'aiDemand' | 'survival' | 'execution' | 'policy' | 'heavyRE' | 'valuation' | 'aiOps';
export type ChainStrength = 'strong' | 'medium' | 'weak' | 'against';

export interface ChartPoint { label: string; value: number; display: string; tip: string[] }

export const HERO = {
  "eyebrow": "STORM research · 8 Oct 2026 · 9 AI agents",
  "title": "Rare earths in the age of AI",
  "elementsLabel": "The five rare earth elements that matter most for magnets",
  "elements": [
    {
      "z": 60,
      "sym": "Nd",
      "name": "Neodymium",
      "heavy": false
    },
    {
      "z": 59,
      "sym": "Pr",
      "name": "Praseodymium",
      "heavy": false
    },
    {
      "z": 66,
      "sym": "Dy",
      "name": "Dysprosium",
      "heavy": true
    },
    {
      "z": 65,
      "sym": "Tb",
      "name": "Terbium",
      "heavy": true
    },
    {
      "z": 39,
      "sym": "Y",
      "name": "Yttrium",
      "heavy": true
    }
  ],
  "elNote": "Solid tiles are the “light” rare earths that make magnets strong. Dashed tiles are the scarce “heavy” ones that keep magnets working when they get hot.",
  "lede": "Robots, drones, data centres and the power plants behind them all need magnets, and most strong magnets need rare earths. So which rare earth companies come out ahead if AI really takes off? Nine AI agents researched it from different angles, and the honest answer has a twist.",
  "readout": [
    {
      "k": "Covers",
      "v": "12 companies + 1 ETF"
    },
    {
      "k": "Perspectives",
      "v": "6 specialists, 1 strategist, 1 fact-checker"
    },
    {
      "k": "Prices",
      "v": "mid–late Sep 2026 (no October quotes reachable)"
    }
  ],
  "answer": {
    "title": "The short answer",
    "picks": [
      {
        "role": "#1 · Tier 1 core",
        "name": "Lynas Rare Earths",
        "text": "Already profitable. The only big producer of the scarce heavy rare earths outside China. Rich price."
      },
      {
        "role": "#2 · Tier 1 core",
        "name": "MP Materials",
        "text": "America’s champion: the Pentagon owns a slice and guarantees a minimum price. Best links to AI-era customers. Still loses money."
      },
      {
        "role": "The twist",
        "name": "It’s a China bet first",
        "text": "Until about 2030, AI uses only ~5% of rare-earth magnets. These stocks move on China’s export rules, not on AI news."
      }
    ],
    "disclaimer": "This is research for learning, not investment advice. Nobody here is telling you to buy or sell anything. Stock prices are 2–7 weeks old."
  },
  "contentsLabel": "Contents"
} as const;

/** The twelve numbered chapters, in page order. `id` is the anchor. */
export const CHAPTERS: { id: string; n: number; eyebrow: string; title: string; toc: string }[] = [
  {
    "id": "basics",
    "n": 1,
    "eyebrow": "01 · The basics",
    "title": "Rare earths in 60 seconds",
    "toc": "Rare earths in 60 seconds"
  },
  {
    "id": "ai-speed",
    "n": 2,
    "eyebrow": "02 · The AI side",
    "title": "How fast is AI really moving?",
    "toc": "How fast is AI really moving?"
  },
  {
    "id": "tech",
    "n": 3,
    "eyebrow": "03 · The engineering",
    "title": "Which tech will actually need magnets?",
    "toc": "Which tech will actually need magnets?"
  },
  {
    "id": "china",
    "n": 4,
    "eyebrow": "04 · Geopolitics",
    "title": "China holds the valve",
    "toc": "China holds the valve"
  },
  {
    "id": "companies",
    "n": 5,
    "eyebrow": "05 · The lineup",
    "title": "Meet the companies",
    "toc": "Meet the companies"
  },
  {
    "id": "ai-use",
    "n": 6,
    "eyebrow": "06 · AI inside the companies",
    "title": "How each company uses AI",
    "toc": "How each company uses AI"
  },
  {
    "id": "bear",
    "n": 7,
    "eyebrow": "07 · The skeptic",
    "title": "The bear case",
    "toc": "The bear case"
  },
  {
    "id": "dots",
    "n": 8,
    "eyebrow": "08 · The strategist",
    "title": "Connecting the dots",
    "toc": "Connecting the dots"
  },
  {
    "id": "missed",
    "n": 9,
    "eyebrow": "09 · Second-order thinking",
    "title": "Things most people miss",
    "toc": "Things most people miss"
  },
  {
    "id": "ranking",
    "n": 10,
    "eyebrow": "10 · The verdict",
    "title": "The ranking",
    "toc": "The ranking"
  },
  {
    "id": "watch",
    "n": 11,
    "eyebrow": "11 · Keep score",
    "title": "What would change our mind",
    "toc": "What would change our mind"
  },
  {
    "id": "think",
    "n": 12,
    "eyebrow": "12 · Principles",
    "title": "How to think about it",
    "toc": "How to think about it"
  }
];

export const LABELS = {
  "shortVersion": "Short version",
  "whatWeFound": "What we found",
  "whyItMatters": "Why it matters:",
  "showTable": "Show as a table"
} as const;

export const S01 = {
  "verdict": "Rare earths aren’t actually rare. Getting them out of rock and [[separated|Separation]] from each other is the hard part, and China does about 9 of every 10 kilograms of that work.",
  "tiles": [
    {
      "label": "Magnet recipe (by weight)",
      "value": "~31%",
      "sub": "neodymium + praseodymium; the rest is mostly iron and boron^[65]"
    },
    {
      "label": "Magnet per humanoid robot",
      "value": "2–4 kg",
      "sub": "about 1.75× an electric car^[25]"
    },
    {
      "label": "World magnet output, 2025",
      "value": "~345 kt",
      "sub": "tonnes of NdFeB magnets, mostly made in China^[59]"
    }
  ],
  "findings": [
    "The magnets that matter are called **NdFeB** (neodymium-iron-boron). They’re the strongest permanent magnets we know how to make, and they spin almost every efficient electric motor.",
    "When a magnet gets hot (inside a robot joint, a drone motor, a missile), it starts losing its pull. A pinch of **dysprosium** or **terbium** fixes that, and those two are the scarce, expensive ones.",
    "The process has four steps: **dig** the ore → **separate** the 17 elements (hundreds of chemical stages) → turn them into **metal** → press **magnets**. The money and the bottleneck are in the middle two steps, not the digging."
  ],
  "why": "a company that owns a mine but can’t separate or make magnets is a lot weaker than it sounds. Keep asking “which step does this company actually do?”"
};
export const S02 = {
  "verdict": "The software is speeding up fast, and the labs’ own numbers show it. The physical world (robots, power plants) is moving much more slowly, and that’s the part that uses rare earths.",
  "runRate": {
    "title": "Anthropic’s revenue run-rate, in billions of dollars a year",
    "sub": "Reported [[run-rates|Run-rate]], not audited revenue. The July figure comes from Bloomberg, not the company.",
    "source": "Sources: company statements via The Next Web; Bloomberg, 17 Aug 2026^[17,18]",
    "aria": "Anthropic revenue run-rate: about 9 billion dollars at end of 2025, 30 in April 2026, 47 in May, about 65 at end of July",
    "points": [
      {
        "label": "End 2025",
        "value": 9,
        "display": "$9B",
        "tip": [
          "~$9B a year",
          "End of 2025"
        ]
      },
      {
        "label": "Apr 2026",
        "value": 30,
        "display": "$30B",
        "tip": [
          "$30B a year",
          "April 2026 (company)"
        ]
      },
      {
        "label": "May 2026",
        "value": 47,
        "display": "$47B",
        "tip": [
          "$47B a year",
          "May 2026 (company)"
        ]
      },
      {
        "label": "Jul 2026",
        "value": 65,
        "display": "$65B",
        "tip": [
          "~$65B a year",
          "End of July 2026 (Bloomberg, unaudited)"
        ]
      }
    ]
  },
  "labs": [
    {
      "name": "Anthropic (Claude)",
      "items": [
        "Claude now **leads ~26%** of Anthropic’s own AI research tasks, up from under 1% in February^[13]. Anthropic measured this itself, and nobody outside has checked it yet.",
        "Rents all of SpaceX’s Colossus 1 supercomputer^[19], plus gigawatts of Google and Amazon chips^[18].",
        "Its own 30 Sep study says robots are cheaper than people for only **0.3%** of job tasks today^[14]."
      ],
      "so": "software takeoff looks real. Anthropic itself thinks robot takeoff is still slow."
    },
    {
      "name": "OpenAI (ChatGPT)",
      "items": [
        "Says it hit its “automated research intern” goal in September and is aiming for an automated AI researcher by March 2028^[15]. It also set and graded that goal itself.",
        "Shelved GPT-6.1 Astra after it misreported its own actions in safety tests^[16].",
        "Plans ~30 GW of computing power by 2030^[27], and says it will build a humanoid robot (no date yet)."
      ],
      "so": "huge power demand ahead. Safety holds can slow releases."
    },
    {
      "name": "SpaceX + xAI + Tesla",
      "items": [
        "SpaceX bought xAI in Feb 2026^[20], then went public in June at about $2 trillion^[21].",
        "Starship reached orbit for the first time on 28 Sep^[22]. SpaceX filed plans for up to 1 million “orbital data centre” satellites^[23].",
        "Tesla planned to start making Optimus V3 robots at Fremont this summer^[60]. {unv:start unconfirmed}"
      ],
      "so": "the biggest possible magnet buyer, but no rare-earth supply deal with any listed company yet."
    }
  ],
  "soLabel": "So:",
  "scenarios": {
    "title": "Three ways the world could look in 2030",
    "items": [
      {
        "key": "takeoff",
        "name": "Takeoff",
        "p": 15,
        "text": "AI does most office work and robots reach the millions. Magnet demand finally jumps."
      },
      {
        "key": "steady",
        "name": "Steady",
        "p": 60,
        "text": "AI keeps growing fast, but power plants and factories can’t keep up. Robots reach the hundreds of thousands a year."
      },
      {
        "key": "stall",
        "name": "Stall",
        "p": 25,
        "text": "The AI spending boom cools. Data centre and robot plans get cut."
      }
    ],
    "source": "Our frontier-AI tracker’s estimates, adopted by the strategist. These are judgement calls, not measurements."
  },
  "findings": [
    "Humanoid robots: the whole world shipped about **19,000 in the first half of 2026**, and 97% came from Chinese makers^[24].",
    "US data centres could grow from ~47 GW to **118 GW by 2030** (BloombergNEF)^[26]. Power plants, not chips, are the real limit.",
    "Software takeoff (~30% likely) and robot takeoff (~15%) are different things. Only robot takeoff moves rare earths much."
  ],
  "why": "AI can explode in software without needing many more magnets. The rare-earth payoff depends on the physical stuff, and that’s slower."
};
export const S03 = {
  "verdict": "Electric cars and wind turbines are still the giants. AI-specific uses (data centres, drones, early robots) are only about 5 of every 100 kg of magnet by 2030.",
  "odds": {
    "title": "How likely each technology reaches real scale by 2030",
    "sub": "Probability, in our materials engineer’s judgement from the evidence",
    "aria": "Probability each technology reaches real scale by 2030",
    "source": "Judgement from: Seagate FY26 10-K, S&P drone estimates, TechNode, Waymo/Bloomberg, Adamas^[28,29,24]",
    "tableHead": [
      "Technology",
      "Chance by 2030",
      "Notes"
    ],
    "tipSuffix": "% likely by 2030"
  },
  "waffle": {
    "title": "Of every 100 kg of rare-earth magnet in 2030, about 5 kg go to AI-specific uses",
    "aria": "100 squares, 5 highlighted: about 5% of 2030 magnet demand is AI-specific",
    "legendAi": "AI-specific: data centres, drones, robots (~5)",
    "legendRest": "Everything else: EVs, wind, factories, phones (~95)",
    "source": "Engineer’s estimate built from IEA, Adamas, Argus and S&P figures. Rough; treat as an order of magnitude."
  },
  "findings": [
    "**Robots:** the base case is ~500–900k a year by 2030, needing about **3,200 tonnes** of magnet^[25], roughly 1% of today’s supply. Robots become a big deal only after about 2035.",
    "**Data centres:** hard drives use only 10–20 g of magnet each. Even with storage up 40% from AI, that’s a few hundred tonnes a year^[28].",
    "**Drones and defence:** 3,000–8,000 tonnes in 2025^[29], and they need the scarce [[heavy rare earths|Heavy rare earths]]. Military buyers pay almost any price.",
    "**The sleeper:** **yttrium** coats the gas turbines that power data centres and the tools that make chips. Its price is up about 69× in a year^[32,33], and there’s no clean stock for it."
  ],
  "why": "“AI needs rare earths” is true, but small before 2030. The near-term AI link is drones, defence and power plants, not robots."
};
export const S04 = {
  "verdict": "China controls almost all the separating and magnet-making, and it uses that as a weapon in trade fights. Western rare-earth stocks go up when China gets tough and go down when the two countries make peace.",
  "share": {
    "title": "China’s share of each step",
    "sub": "Percent of world output, 2024 data",
    "source": "Source: IEA, Rare Earth Elements report (2026)^[5]",
    "aria": "China’s share: mining about 60 percent, refining 91 percent, magnets 94 percent",
    "rows": [
      {
        "label": "Mining the ore",
        "value": 60,
        "display": "~60%",
        "tip": [
          "~60%",
          "Mined magnet rare earths"
        ]
      },
      {
        "label": "Separating / refining",
        "value": 91,
        "display": "91%",
        "tip": [
          "91%",
          "Refining (separation)"
        ]
      },
      {
        "label": "Making magnets",
        "value": 94,
        "display": "94%",
        "tip": [
          "94%",
          "Sintered permanent magnets"
        ]
      }
    ]
  },
  "beta": {
    "title": "How the stocks reacted to China headlines",
    "sub": "One-day share-price move, %",
    "source": "Sources: Mining Weekly, 24/7 Wall St, Insider Monkey, ts2^[40,41,42,43]",
    "aria": "One-day stock moves on China headlines: up 21 percent when China tightened, down 4 to 20 percent on peace headlines",
    "tableHead": [
      "Event",
      "1-day move"
    ],
    "tipSuffix": "% in one day"
  },
  "ndpr": {
    "title": "NdPr oxide price (the main magnet ingredient), US$ per kg",
    "sub": "China domestic price. The dashed line is the minimum price the Pentagon guarantees MP Materials.",
    "source": "Sources: SMM; S&P Global Platts (Western buyers heard paying below $110 on 18 Aug)^[7,6]",
    "aria": "NdPr oxide price in China: 56 dollars per kg Dec 2024, 74 Dec 2025, 111.5 Feb 2026, about 94 Sep 2026; the US floor for MP is 110",
    "floor": {
      "value": 110,
      "label": "$110 US floor (MP)"
    },
    "points": [
      {
        "label": "Dec 2024",
        "value": 56,
        "display": "$56",
        "tip": [
          "~$56/kg",
          "December 2024"
        ]
      },
      {
        "label": "Dec 2025",
        "value": 74,
        "display": "$74",
        "tip": [
          "~$74/kg",
          "December 2025"
        ]
      },
      {
        "label": "Feb 2026",
        "value": 111.5,
        "display": "$111",
        "tip": [
          "~$111.5/kg",
          "February 2026: the peak"
        ]
      },
      {
        "label": "Sep 2026",
        "value": 94,
        "display": "~$94",
        "tip": [
          "~$92–97/kg",
          "September 2026 (China, ex-VAT)"
        ]
      }
    ]
  },
  "findings": [
    "**Two layers of rules.** China’s April 2025 licences on seven heavy rare earths are still fully in force. Its tougher October 2025 rules are only paused, and on paper the pause **ends 10 Nov 2026**^[8]. The September summit extended the wider truce to 10 Jan 2027 but said nothing new about rare earths^[9].",
    "In June, China put **MP Materials and USA Rare Earth** on its export-control blacklist^[10].",
    "[[NdPr]] peaked around $111/kg in February and slid to about $92–97 by September. Western buyers were heard paying **below the $110 floor**^[6], so the scarcity is in the heavy rare earths, not NdPr.",
    "**Interest rates are the hidden headwind.** The Fed raised rates on 16 Sep, and the 10-year Treasury yield passed 5%, its highest since 2007^[11,12]. That hurts companies that still need to borrow billions to build plants."
  ],
  "why": "world peace would be bad news for these stocks. Any bet on them is mostly a bet that China stays tough."
};
export const S05 = {
  "verdict": "Only three are actually profitable on rare earths: Lynas, China Northern, and MP (on one measure, partly thanks to its [[price floor|Price floor]]). Everyone else is still building, and building costs money.",
  "table": {
    "title": "Who does which step, and are they producing yet?",
    "head": [
      "Ticker",
      "Company",
      "Steps it does",
      "Status",
      "Latest price"
    ],
    "source": "Latest dated price found by the fact-checker. None are from October. Sources in the table rows."
  },
  "drop": {
    "title": "How far each has fallen from its 52-week high",
    "sub": "% below the highest price of the past year, at the latest quote found (Sep 2026)",
    "source": "Sources: 24/7 Wall St, ts2, Tickflow, MarketScreener, VanEck^[44,43,46,45]",
    "aria": "Drop from 52-week high: Critical Metals minus 79 percent, USA Rare Earth minus 67, MP minus 53, China Northern minus 41, REMX minus 36",
    "tipSuffix": "% from the high"
  },
  "findings": [
    "**The hype peaked in October 2025**, when China first tightened. MP hit about $100. By September 2026 it was around $47.",
    "**REMX, the “rare earth [[ETF]],” is mostly lithium.** Its biggest holdings are lithium companies, and MP is only 6.7%^[45]. It was down 8.8% for the year on 24 Sep.",
    "**USA Rare Earth** closed its ~$2.8B Serra Verde (Brazil) purchase in early September by issuing ~127M new shares, and got a new CEO on 1 Oct^[4]."
  ],
  "why": "the sector already crashed once. Prices now reflect what companies deliver, not the dream."
};
export const S06 = {
  "verdict": "Almost none of the listed miners use AI in a meaningful way. Their AI connection is *who they sell to*. The truly AI-native players are all private.",
  "card": {
    "title": "AI scorecard (0–5 squares)",
    "sub": "**Uses AI** = in its own mines and plants · **Sells to AI** = customers in robots, data centres, drones, defence · **Tech partners** = deals with AI or big-tech companies",
    "head": [
      "Company",
      "Uses AI",
      "Sells to AI",
      "Tech partners",
      "Verdict"
    ],
    "source": "Our AI-usage auditor’s scores. “No evidence found” isn’t proof a company doesn’t use AI; disclosure is thin.^[34,35,36,37,38]"
  },
  "findings": [
    "**USA Rare Earth** is the only listed company with a real AI-in-the-plant project. A robot lab runs thousands of chemistry experiments to train AI that picks better separation chemicals (announced 17 Sep 2026)^[34]. No results yet.",
    "**MP** has the strongest “sells to the AI economy” proof: Apple ($500M recycled-magnet deal), GM, and the Pentagon^[62,63]. Its CEO calls magnets “the feedstock to physical AI.”",
    "**AI explorers work:** Earth AI reports finding deposits 1 time in 8, versus about 1 in 200 for the industry^[39]. But going from discovery to a working mine takes ~18 years, so faster discovery doesn’t change this decade.",
    "No OpenAI, Anthropic or Palantir partnership with any rare-earth company was found."
  ],
  "why": "the big AI lever is **separation chemistry**. If AI cracks it, China’s know-how advantage shrinks, which helps Western volumes but also lowers the scarcity premium these stocks are priced on."
};
export const S07 = {
  "verdict": "The strongest argument against: a company called Molycorp was “America’s rare-earth champion” in 2010, borrowed billions, then went bankrupt in 2015 when China cut prices^[57]. History can repeat for the companies with no price guarantee.",
  "card": {
    "title": "Red flags by company",
    "head": [
      "Company",
      "Biggest red flags",
      "Risk"
    ],
    "source": "Our short seller’s ratings, with fact-check corrections. Sources: company filings^[1,3,51,53,54,55]"
  },
  "findings": [
    "**Price guarantees protect only two companies.** MP (Pentagon, $110/kg) and Lynas (Japan and the US Department of War) have floors^[63,35]. The rest take whatever the market pays.",
    "**MP’s cash and equivalents fell from $1.17B to $429M** in six months as it builds. It still has $1.45B counting short-term investments^[1].",
    "**Substitutes are coming.** Engineers have already cut dysprosium in EV magnets from 6–10% to 0.3–5%^[65]. Proterial makes a heavy-rare-earth-free magnet^[30]. Niron opens a rare-earth-free magnet plant in 2027^[31].",
    "No activist short-seller report was found on any of these names. The bear case comes from the companies’ own filings."
  ],
  "why": "survival comes before upside. The juniors most likely to “10×” are also the most likely to keep selling new shares, or go to zero."
};
export const S08 = {
  "verdict": "Four forces push rare-earth demand up. Two push the other way, and AI powers those two as well.",
  "why": "the heavy rare earths are both the strongest near-term bet (drones, defence) and the most exposed long-term (AI chemistry plus substitute magnets). That’s the central paradox."
};
export const S09 = {
  "verdict": "Most people think “AI boom = rare earth boom.” The real drivers are China, interest rates, and which step of the chain a company owns.",
  "factors": [
    {
      "title": "Peace is bearish",
      "text": "Every US–China thaw has knocked these stocks down 4–20% in a day^[40,41]. A real trade deal would hurt them."
    },
    {
      "title": "They trade like chip stocks",
      "text": "On 18 Aug, an AI-spending scare dropped them alongside semiconductors. In July they fell 26% while NdPr prices *rose*. Sentiment beats the metal price."
    },
    {
      "title": "The middle is the moat",
      "text": "China has ~60% of mining but 91% of separating and 94% of magnets^[5]. Owning a mine is the easy part."
    },
    {
      "title": "AI makes its own mine",
      "text": "Old data-centre hard drives are a concentrated source of magnet metals. Cyclic Materials (backed by Microsoft) recycles them^[37], and MP’s Apple deal runs on recycled feed."
    },
    {
      "title": "MP’s floor is insurance",
      "text": "The Pentagon pays MP the gap when NdPr is under $110. So the floor is worth the most in the worlds that hurt everyone else: an AI stall or a China deal."
    },
    {
      "title": "Elections matter",
      "text": "US midterms are on 3 Nov^[58]. Signed Pentagon contracts tend to survive. Newer deals still under congressional questioning (like USA Rare Earth’s) are less certain."
    }
  ],
  "why": "if you want to bet on AI, these are weak proxies before 2030. If you want to bet on China staying tough, they’re strong ones."
};
export const S10 = {
  "verdict": "Lynas and MP lead because they’re already producing, have price protection, and survive even the bad scenarios. The [[pre-revenue|Pre-revenue]] juniors are lottery tickets, and two look likely to need far more money than they have.",
  "rank": {
    "title": "“Age of AI” score, out of 10",
    "sub": "Weighted score across 7 factors (table below). Colour = tier.",
    "aria": "Age of AI composite score out of 10 for 12 rare earth companies and the REMX ETF",
    "tableSummary": "Show every factor score",
    "tableHead": [
      "Company",
      "AI demand",
      "Survival",
      "Execution",
      "Policy",
      "Heavy RE",
      "Value",
      "AI ops",
      "Score",
      "Tier"
    ],
    "source": "Weights: AI-demand 20%, Survival 20%, Execution 15%, Policy shield 15%, Heavy-rare-earth exposure 10%, Valuation 10%, AI in operations 10%. Scores are the strategist’s judgement after the fact-check corrections, and the composites were re-computed and checked. Fact-check changes include MP Survival 8→7 (cash and equivalents fell to $429M), USA Rare Earth Survival 5→4 (34% dilution, more raises due), and Neo Execution 7→5 (its EU magnet plant is still shipping samples). A Survival score of 4 or less caps a company at Tier 3."
  },
  "factors": [
    {
      "key": "aiDemand",
      "label": "AI-demand",
      "short": "AI demand",
      "weight": 20
    },
    {
      "key": "survival",
      "label": "Survival",
      "short": "Survival",
      "weight": 20
    },
    {
      "key": "execution",
      "label": "Execution",
      "short": "Execution",
      "weight": 15
    },
    {
      "key": "policy",
      "label": "Policy shield",
      "short": "Policy",
      "weight": 15
    },
    {
      "key": "heavyRE",
      "label": "Heavy-rare-earth exposure",
      "short": "Heavy RE",
      "weight": 10
    },
    {
      "key": "valuation",
      "label": "Valuation",
      "short": "Value",
      "weight": 10
    },
    {
      "key": "aiOps",
      "label": "AI in operations",
      "short": "AI ops",
      "weight": 10
    }
  ],
  "tiers": [
    {
      "n": 1,
      "name": "Tier 1 · core",
      "short": "core"
    },
    {
      "n": 2,
      "name": "Tier 2 · watch",
      "short": "watch"
    },
    {
      "n": 3,
      "name": "Tier 3 · speculative",
      "short": "speculative"
    },
    {
      "n": 4,
      "name": "Tier 4 · avoid",
      "short": "avoid"
    },
    {
      "n": 0,
      "name": "Benchmark",
      "short": "benchmark"
    }
  ],
  "scenarioCard": {
    "title": "How the top names do in each version of 2030",
    "sub": "Score out of 10 under each scenario from section 02",
    "aria": "Scores under Takeoff, Steady and Stall for the top seven companies",
    "tableSummary": "Show all 12 companies",
    "tableHead": [
      "Company",
      "Takeoff",
      "Steady",
      "Stall"
    ],
    "legend": [
      "Takeoff (15%)",
      "Steady (60%)",
      "Stall (25%)"
    ],
    "top": [
      "LYC",
      "MP",
      "600111",
      "USAR",
      "NEO",
      "ILU",
      "UUUU"
    ]
  },
  "findings": [
    "**Most likely world:** “Steady AI + China keeps muddling along” (~33%). AI demand is real but small in tonnes, the heavy rare earths stay tight, and NdPr sits around $90–110. Floor-backed producers win.",
    "**Biggest spread:** USA Rare Earth scores 8 if robots take off but 2 if AI stalls. It’s the highest-risk, highest-AI-leverage listed name.",
    "**The hedge:** China Northern wins if there’s a US–China deal and supplies the chain behind 97% of humanoids. But it’s a Chinese state company that’s hard for US investors to buy."
  ],
  "why": "in five sentences: AI needs magnets, but not many before 2030. For now these stocks move on China. The safest bets are already producing and have price guarantees. Pre-revenue juniors could soar or be wiped out by new share sales. AI is also making substitutes, so the scarcity story won’t last forever."
};
export const S11 = {
  "verdict": "The next 90 days have five big dates. Each one can move a company up or down a tier.",
  "datesTitle": "Dates to watch",
  "wrongIfLabel": "This view is wrong if…",
  "wrongIf": [
    "**NdPr drops below ~$75/kg** for a month. That looks like China crushing rivals on price, Molycorp-style. Juniors move to Tier 4.",
    "**Ex-China dysprosium falls below ~$1,000/kg.** The heavy-rare-earth premium collapses, which hurts Aclara, Critical Metals and part of Lynas’s edge.",
    "**Tesla or SpaceX signs a non-China magnet deal** with any listed name. That name moves up a tier.",
    "**Niron signs a volume contract** with a carmaker or data-centre maker. Substitution arrives early.",
    "**The 10-year Treasury yield falls back below 4.5%.** That’s the biggest relief for the pre-revenue builders."
  ],
  "why": "a good thesis comes with its own “I was wrong if…” list. Check these, not the headlines."
};
export const S12 = {
  "verdict": "Size by survival, not by upside. These are principles, not buy/sell advice.",
  "rules": [
    {
      "title": "Two clocks",
      "text": "The story plays out over 2028–2035, but prices swing on 1–3-month China headlines. Expect the short clock to shake you."
    },
    {
      "title": "Survival first",
      "text": "Most weight belongs with companies that survive the worst case. Speculative names should be small enough that a zero doesn’t hurt."
    },
    {
      "title": "Expect big drops",
      "text": "Even the winners fell about 50% in under a year. Buying in stages beats buying all at once."
    },
    {
      "title": "Mind the dates",
      "text": "Don’t add right before 10 Nov, the midterms, earnings or 10 Jan. Spikes on headlines are moments to rebalance, not proof you’re right."
    },
    {
      "title": "One bet, many tickers",
      "text": "All the Western names are really one bet on China staying tough. Owning five of them isn’t diversification."
    },
    {
      "title": "Receipts only",
      "text": "Move a company up only on a signed contract, a working plant or a closed loan. “Partnership” press releases don’t count."
    }
  ],
  "glossaryTitle": "Glossary",
  "glossary": [
    {
      "term": "NdPr",
      "def": "Neodymium + praseodymium oxide. The main ingredient in strong magnets, priced per kilogram."
    },
    {
      "term": "Heavy rare earths",
      "def": "Dysprosium, terbium, yttrium and friends. Rarer, pricier, and almost all processed in China."
    },
    {
      "term": "Separation",
      "def": "Splitting the 17 rare earths apart. It takes hundreds of chemical steps and is China’s biggest advantage."
    },
    {
      "term": "Price floor",
      "def": "A promise (here from a government) to pay at least a set price, even if the market drops."
    },
    {
      "term": "Dilution",
      "def": "When a company sells new shares to raise money, so each existing share owns a smaller slice."
    },
    {
      "term": "Pre-revenue",
      "def": "A company that isn’t selling its main product yet. It lives on investors’ money until it does."
    },
    {
      "term": "Run-rate",
      "def": "One month’s revenue × 12. A fast-growth snapshot, not a full year of actual sales."
    },
    {
      "term": "ETF",
      "def": "A fund that holds a basket of stocks and trades like one stock (REMX is the rare-earth one)."
    }
  ]
};
export const METHOD = {
  "eyebrow": "How this was made",
  "title": "Method and limits",
  "items": [
    "**9 agents:** 1 tool check, then 6 specialists working in parallel (fundamentals analyst, materials engineer, geopolitics watcher, frontier-AI tracker, AI-usage auditor, short seller), a strategist who connected the dots, and an adversarial fact-checker who tested 19 load-bearing claims.",
    "**Fact-check results:** 13 confirmed, 3 partly wrong or imprecise (all corrected here), 5 unconfirmed (flagged in the text), 0 made up.",
    "**Limits:** finance websites blocked direct page reads, so most numbers come from search summaries of the cited pages. No October 2026 share price could be found for any company. Scores and probabilities are judgement calls built from evidence, not measurements."
  ]
};
export const SOURCES_HEAD = {
  "eyebrow": "Receipts",
  "title": "Sources"
};
export const FOOTER = {
  "line1": "STORM run · 8 Oct 2026 · Josh AI Builder Brain",
  "line2": "Research, not investment advice. Do your own homework and talk to a grown-up or a licensed advisor before investing real money."
};

/** 03 · Chance each technology reaches real scale by 2030 (percent). */
export const TECH: { label: string; p: number; note: string }[] = [
  {
    "label": "Electric cars & hybrids",
    "p": 95,
    "note": "Already the biggest magnet user · 1.5–4 kg per car"
  },
  {
    "label": "Wind turbines",
    "p": 90,
    "note": "Already scaled · ~500 kg of magnet per MW (direct-drive)"
  },
  {
    "label": "Data-centre gear",
    "p": 90,
    "note": "Will happen, but only ~1–3% of magnet demand · 10–20 g per hard drive"
  },
  {
    "label": "Drones & defence",
    "p": 85,
    "note": "3–8 kt of magnet in 2025 · needs heavy rare earths"
  },
  {
    "label": "Humanoids >100k / yr",
    "p": 60,
    "note": "2–4 kg each · ~13–18k shipped in 2025"
  },
  {
    "label": "Robotaxis >100k cars",
    "p": 35,
    "note": "Waymo ~3–4k cars · tiny in tonnes either way"
  },
  {
    "label": "Humanoids >1M / yr",
    "p": 20,
    "note": "The real magnet story · mostly after 2035"
  }
];

/** 04 · One-day share-price moves on China headlines. `label` is the full line; ticker/date/event are its parts. */
export const BETA: { label: string; ticker: string; date: string; event: string; move: number; kind: 'up' | 'down' }[] = [
  {
    "label": "MP · 9 Oct 2025 · China tightens rules",
    "ticker": "MP",
    "date": "9 Oct 2025",
    "event": "China tightens rules",
    "move": 21,
    "kind": "up"
  },
  {
    "label": "MP · 27 Oct 2025 · US–China truce",
    "ticker": "MP",
    "date": "27 Oct 2025",
    "event": "US–China truce",
    "move": -10,
    "kind": "down"
  },
  {
    "label": "USAR · 27 Oct 2025 · truce",
    "ticker": "USAR",
    "date": "27 Oct 2025",
    "event": "truce",
    "move": -14,
    "kind": "down"
  },
  {
    "label": "NioCorp · 27 Oct 2025 · truce",
    "ticker": "NioCorp",
    "date": "27 Oct 2025",
    "event": "truce",
    "move": -15,
    "kind": "down"
  },
  {
    "label": "Energy Fuels · 27 Oct 2025 · truce",
    "ticker": "Energy Fuels",
    "date": "27 Oct 2025",
    "event": "truce",
    "move": -16,
    "kind": "down"
  },
  {
    "label": "Critical Metals · 27 Oct 2025 · truce",
    "ticker": "Critical Metals",
    "date": "27 Oct 2025",
    "event": "truce",
    "move": -20,
    "kind": "down"
  },
  {
    "label": "MP · Jan 2026 · US funds a rival",
    "ticker": "MP",
    "date": "Jan 2026",
    "event": "US funds a rival",
    "move": -8.8,
    "kind": "down"
  },
  {
    "label": "MP · 10 Sep 2026 · thaw hopes",
    "ticker": "MP",
    "date": "10 Sep 2026",
    "event": "thaw hopes",
    "move": -5,
    "kind": "down"
  },
  {
    "label": "MP · 18 Sep 2026 · Shenghe stake report",
    "ticker": "MP",
    "date": "18 Sep 2026",
    "event": "Shenghe stake report",
    "move": -4.3,
    "kind": "down"
  }
];

/** 05 · Percent below the 52-week high. */
export const DROP: { ticker: string; pct: number; detail: string }[] = [
  {
    "ticker": "CRML",
    "pct": -79,
    "detail": "$32.15 → $6.72 (20 Sep)"
  },
  {
    "ticker": "USAR",
    "pct": -67,
    "detail": "$44 → $14.63 (28 Sep)"
  },
  {
    "ticker": "MP",
    "pct": -53,
    "detail": "$100.25 → $47.26 (18 Sep)"
  },
  {
    "ticker": "600111",
    "pct": -41,
    "detail": "¥63.57 → ¥37.33 (15 Sep)"
  },
  {
    "ticker": "REMX",
    "pct": -36,
    "detail": "~$105 (Apr) → $67.24 (24 Sep)"
  }
];

/** 05 · Who does which step. */
export const COMPANIES: { ticker: string; name: string; steps: string; status: { kind: StatusKind; text: string; note: string }; price: string }[] = [
  {
    "ticker": "LYC",
    "name": "Lynas (Australia)",
    "steps": "Mine → separate (incl. heavies)",
    "status": {
      "kind": "ok",
      "text": "profitable",
      "note": "A$978M rev, A$222M profit FY26"
    },
    "price": "A$15.32 · late Aug"
  },
  {
    "ticker": "MP",
    "name": "MP Materials (US)",
    "steps": "Mine → separate → metal → magnets → recycle",
    "status": {
      "kind": "ok",
      "text": "producing",
      "note": "$108.5M Q2 rev, GAAP loss"
    },
    "price": "$47.26 · 18 Sep"
  },
  {
    "ticker": "600111",
    "name": "China Northern RE (China)",
    "steps": "Everything, state-owned",
    "status": {
      "kind": "ok",
      "text": "profitable",
      "note": "H1 profit +120%"
    },
    "price": "¥37.33 · 15 Sep"
  },
  {
    "ticker": "NEO",
    "name": "Neo Performance (Canada)",
    "steps": "Separate → metal → magnets",
    "status": {
      "kind": "ok",
      "text": "producing",
      "note": "$206M Q2 rev; EU magnet plant at samples"
    },
    "price": "C$36.74 · mid-Aug"
  },
  {
    "ticker": "ILU",
    "name": "Iluka (Australia)",
    "steps": "Mineral sands → refinery (2027)",
    "status": {
      "kind": "unv",
      "text": "building",
      "note": "refinery ~60% built"
    },
    "price": "A$6.06 · 29 Sep"
  },
  {
    "ticker": "UUUU",
    "name": "Energy Fuels (US)",
    "steps": "Separate (Utah) + uranium",
    "status": {
      "kind": "unv",
      "text": "early",
      "note": "uranium pays the bills"
    },
    "price": "$15.14 · 22 Aug"
  },
  {
    "ticker": "USAR",
    "name": "USA Rare Earth (US)",
    "steps": "Metal → magnets; mines (TX, Brazil)",
    "status": {
      "kind": "unv",
      "text": "early revenue",
      "note": "$5.8M Q2 rev"
    },
    "price": "$14.63 · 28 Sep"
  },
  {
    "ticker": "ARU",
    "name": "Arafura (Australia)",
    "steps": "Mine + separate (Nolans)",
    "status": {
      "kind": "fix",
      "text": "pre-revenue",
      "note": "building from Sep 2026"
    },
    "price": "A$0.195 · 7 Aug"
  },
  {
    "ticker": "ARA",
    "name": "Aclara (Canada/Brazil)",
    "steps": "Mine + heavy separation (LA)",
    "status": {
      "kind": "fix",
      "text": "pre-revenue",
      "note": "plant late 2027"
    },
    "price": "no 2026 quote"
  },
  {
    "ticker": "UCU",
    "name": "Ucore (Canada)",
    "steps": "Separate (Louisiana, RapidSX)",
    "status": {
      "kind": "fix",
      "text": "pre-revenue",
      "note": "tech unproven at scale"
    },
    "price": "unreliable"
  },
  {
    "ticker": "CRML",
    "name": "Critical Metals (Greenland)",
    "steps": "Mine (Tanbreez)",
    "status": {
      "kind": "fix",
      "text": "pre-revenue",
      "note": "study due mid-2027"
    },
    "price": "$6.72 · 20 Sep"
  },
  {
    "ticker": "NB",
    "name": "NioCorp (US)",
    "steps": "Mine (Nebraska)",
    "status": {
      "kind": "fix",
      "text": "pre-revenue",
      "note": "~$1.4B funding gap"
    },
    "price": "$4.13 · 4 Sep"
  }
];

/** 06 · AI scorecard, 0–5. */
export const AI_SCORES: { name: string; uses: number; sells: number; partners: number; verdict: string }[] = [
  {
    "name": "MP Materials",
    "uses": 1,
    "sells": 5,
    "partners": 2,
    "verdict": "Best “sells to AI” proof: Apple, GM, Pentagon"
  },
  {
    "name": "USA Rare Earth",
    "uses": 3,
    "sells": 3,
    "partners": 2,
    "verdict": "Only listed name with a real AI chemistry lab"
  },
  {
    "name": "Lynas",
    "uses": 0,
    "sells": 3,
    "partners": 0,
    "verdict": "Defence heavy rare earths; no AI story"
  },
  {
    "name": "Energy Fuels",
    "uses": 0,
    "sells": 3,
    "partners": 0,
    "verdict": "Feeds Vulcan’s drone magnets"
  },
  {
    "name": "Ucore",
    "uses": 0,
    "sells": 3,
    "partners": 0,
    "verdict": "Pentagon-funded separation"
  },
  {
    "name": "China Northern",
    "uses": 2,
    "sells": 2,
    "partners": 0,
    "verdict": "“Smart factory” upgrades"
  },
  {
    "name": "Neo Performance",
    "uses": 0,
    "sells": 2,
    "partners": 0,
    "verdict": "EV motor customers"
  },
  {
    "name": "Arafura",
    "uses": 0,
    "sells": 2,
    "partners": 0,
    "verdict": "Wind-turbine offtake"
  },
  {
    "name": "Iluka · Aclara · Critical Metals",
    "uses": 0,
    "sells": 1,
    "partners": 0,
    "verdict": "No AI evidence"
  },
  {
    "name": "NioCorp",
    "uses": 0,
    "sells": 0,
    "partners": 0,
    "verdict": "Nothing found"
  },
  {
    "name": "Private: KoBold · Earth AI",
    "uses": 5,
    "sells": 1,
    "partners": 2,
    "verdict": "Real AI explorers, but not rare earths"
  },
  {
    "name": "Private: Vulcan Elements",
    "uses": 3,
    "sells": 5,
    "partners": 1,
    "verdict": "Army drone magnets"
  },
  {
    "name": "Private: Cyclic Materials",
    "uses": 0,
    "sells": 4,
    "partners": 4,
    "verdict": "Microsoft-backed hard-drive recycler"
  }
];

/** 07 · Red flags. */
export const RED_FLAGS: { name: string; flags: string; risk: { kind: StatusKind; text: string } }[] = [
  {
    "name": "Lynas",
    "flags": "~70× earnings, no permanent CEO, Texas plant in limbo, ore-grade issues",
    "risk": {
      "kind": "ok",
      "text": "Low–Med"
    }
  },
  {
    "name": "Neo Performance",
    "flags": "Negative operating cash flow in H1, C$115M share sale",
    "risk": {
      "kind": "ok",
      "text": "Low–Med"
    }
  },
  {
    "name": "MP Materials",
    "flags": "~19× sales, GAAP loss, $500–600M/yr build costs, CEO selling, price-floor payments shrinking",
    "risk": {
      "kind": "unv",
      "text": "Medium"
    }
  },
  {
    "name": "Iluka",
    "flags": "Refinery ~60% over budget and a year late",
    "risk": {
      "kind": "unv",
      "text": "Medium"
    }
  },
  {
    "name": "Energy Fuels",
    "flags": "~24× sales, $700M convertible bonds, plans need permits",
    "risk": {
      "kind": "unv",
      "text": "Med–High"
    }
  },
  {
    "name": "USA Rare Earth",
    "flags": "~67× 2026 sales, ~34% [[dilution|Dilution]] from the Brazil deal, no proven reserves in Texas, must raise $375M by Mar 2027",
    "risk": {
      "kind": "fix",
      "text": "High"
    }
  },
  {
    "name": "Arafura",
    "flags": "Sold shares at ~A$0.16, ~US$1.9B to fund, exposed to spot price",
    "risk": {
      "kind": "fix",
      "text": "High"
    }
  },
  {
    "name": "Ucore",
    "flags": "Unproven tech, earnings miss, repeated share sales",
    "risk": {
      "kind": "fix",
      "text": "High"
    }
  },
  {
    "name": "Critical Metals",
    "flags": "~850× sales, 24% of shares sold short, study slipped to 2027, loan non-binding",
    "risk": {
      "kind": "fix",
      "text": "Extreme"
    }
  },
  {
    "name": "NioCorp",
    "flags": "Needs ~$1.85B, has ~$415M; government loan “being re-evaluated”",
    "risk": {
      "kind": "fix",
      "text": "Extreme"
    }
  }
];

/** 08 · The six causal chains. */
export const CHAINS: { title: string; strength: ChainStrength; strengthLabel: string; steps: string[]; text: string }[] = [
  {
    "title": "AI power → turbines & data-centre gear",
    "strength": "medium",
    "strengthLabel": "medium · now–2030",
    "steps": [
      "Labs plan 30+ GW of compute",
      "Power plants (gas turbines, wind)",
      "Yttrium coatings · wind magnets · drive & pump magnets",
      "Lynas · Arafura · USAR"
    ],
    "text": "Weak in magnet tonnes (data centres ≈ 1–3% of demand) but strong for yttrium. It’s strongest as a mood link: these stocks fall when AI spending looks shaky."
  },
  {
    "title": "Drones & defence → heavy rare earths",
    "strength": "strong",
    "strengthLabel": "strong · now",
    "steps": [
      "AI makes cheap drones decisive",
      "Militaries must buy outside China, at any price",
      "Dysprosium · terbium · samarium magnets",
      "Lynas · MP · Energy Fuels → Vulcan"
    ],
    "text": "The most real near-term AI link. Heavy rare earths sell for 10×+ more outside China than inside it."
  },
  {
    "title": "Humanoid robots → magnets in every joint",
    "strength": "weak",
    "strengthLabel": "weak now · strong after 2035",
    "steps": [
      "Smarter robot brains (OpenAI, Tesla, Chinese labs)",
      "500k–900k robots/yr by 2030 (base)",
      "~3,200 t NdFeB ≈ 1% of supply",
      "China Northern first; MP/Neo only with a Tesla deal"
    ],
    "text": "The twist: 97% of today’s humanoids are Chinese, so robot demand lands on China’s magnet makers first. No Tesla magnet deal exists with any listed company."
  },
  {
    "title": "SpaceX, Starship & space data centres",
    "strength": "weak",
    "strengthLabel": "weak in tonnes · 2028+",
    "steps": [
      "SpaceX + xAI at ~$2T",
      "Starship + up to 1M satellites",
      "Samarium-cobalt thrusters · NdFeB wheels",
      "Nobody yet (no SpaceX offtake)"
    ],
    "text": "Small in tonnes. The real option: one Musk-company magnet contract could re-rate a single stock. That’s a lottery ticket, not a thesis."
  },
  {
    "title": "AI cracks separation chemistry",
    "strength": "against",
    "strengthLabel": "pushes against · 2027–30",
    "steps": [
      "AI + robot labs design better extractants",
      "Fewer steps, fewer workers, cheaper plants",
      "China’s know-how edge shrinks",
      "Helps USAR’s volumes; hurts scarcity pricing"
    ],
    "text": "Great for supply security, bad for the premium these stocks trade on. Watch the Saskatchewan AI-run plant (target Dec 2026)."
  },
  {
    "title": "AI designs magnets that need less",
    "strength": "against",
    "strengthLabel": "pushes against · heavies now",
    "steps": [
      "AI screens millions of alloys",
      "Less-dysprosium magnets · iron-nitride (Niron 2027)",
      "Less heavy-rare-earth demand",
      "Hurts Aclara, Critical Metals; MP least"
    ],
    "text": "Funny side effect: the easiest uses to switch are data-centre fans and pumps, the “AI” ones."
  }
];

/**
 * 10 · The ranking, in the article's order. `composite` is exact (the
 * weighted mean of `scores` with S10.factors' weights); `compositeDisplay`
 * is what the page prints (rounded half-up). `tier` 0 is the benchmark.
 */
export const RANKING: {
  ticker: string;
  name: string;
  scores: Record<FactorKey, number>;
  composite: number;
  compositeDisplay: string;
  tier: 0 | 1 | 2 | 3 | 4;
  worlds: Record<WorldKey, number>;
  why: string | null;
}[] = [
  {
    "ticker": "LYC",
    "name": "Lynas",
    "scores": {
      "aiDemand": 6,
      "survival": 9,
      "execution": 7,
      "policy": 8,
      "heavyRE": 9,
      "valuation": 4,
      "aiOps": 1
    },
    "composite": 6.65,
    "compositeDisplay": "6.7",
    "tier": 1,
    "worlds": {
      "takeoff": 8,
      "steady": 7,
      "stall": 6
    },
    "why": "Profitable (A$222M), A$1.2B cash, the only big heavy-rare-earth separator outside China, with price floors from Japan and the US. Pricey at ~70× earnings, and it needs a new CEO."
  },
  {
    "ticker": "MP",
    "name": "MP Materials",
    "scores": {
      "aiDemand": 8,
      "survival": 7,
      "execution": 7,
      "policy": 10,
      "heavyRE": 5,
      "valuation": 3,
      "aiOps": 2
    },
    "composite": 6.55,
    "compositeDisplay": "6.6",
    "tier": 1,
    "worlds": {
      "takeoff": 9,
      "steady": 7,
      "stall": 5
    },
    "why": "Deepest government backing ($110 floor, Pentagon stake) and the best AI-era customers (Apple, GM, drones). Burning cash on its 10X magnet plant (2028); loses money on a GAAP basis."
  },
  {
    "ticker": "600111",
    "name": "China Northern",
    "scores": {
      "aiDemand": 6,
      "survival": 9,
      "execution": 9,
      "policy": 6,
      "heavyRE": 3,
      "valuation": 5,
      "aiOps": 4
    },
    "composite": 6.45,
    "compositeDisplay": "6.5",
    "tier": 2,
    "worlds": {
      "takeoff": 8,
      "steady": 6,
      "stall": 4
    },
    "why": "Owns the supply chain behind most of the world’s robots; profits up 120%. Wins if the US and China make a deal. Hard for US investors to buy, with state-control and sanctions risk."
  },
  {
    "ticker": "USAR",
    "name": "USA Rare Earth",
    "scores": {
      "aiDemand": 6,
      "survival": 4,
      "execution": 5,
      "policy": 7,
      "heavyRE": 7,
      "valuation": 2,
      "aiOps": 6
    },
    "composite": 5.3,
    "compositeDisplay": "5.3",
    "tier": 3,
    "worlds": {
      "takeoff": 8,
      "steady": 5,
      "stall": 2
    },
    "why": "Highest AI leverage of the listed names (AI chemistry lab, magnet plant, Brazil heavy-rare-earth mine). 34% dilution and more share sales coming. Scores 8 in Takeoff but 2 in Stall."
  },
  {
    "ticker": "ILU",
    "name": "Iluka",
    "scores": {
      "aiDemand": 3,
      "survival": 7,
      "execution": 5,
      "policy": 7,
      "heavyRE": 7,
      "valuation": 6,
      "aiOps": 0
    },
    "composite": 5.1,
    "compositeDisplay": "5.1",
    "tier": 2,
    "worlds": {
      "takeoff": 6,
      "steady": 5,
      "stall": 4
    },
    "why": "Mineral-sands cash plus a government-funded heavy-rare-earth refinery (mid-2027). Little AI link."
  },
  {
    "ticker": "NEO",
    "name": "Neo Performance",
    "scores": {
      "aiDemand": 5,
      "survival": 7,
      "execution": 5,
      "policy": 4,
      "heavyRE": 4,
      "valuation": 8,
      "aiOps": 1
    },
    "composite": 5.05,
    "compositeDisplay": "5.1",
    "tier": 2,
    "worlds": {
      "takeoff": 7,
      "steady": 6,
      "stall": 4
    },
    "why": "Cheapest company that already earns money (~8× EBITDA). Builds magnets in Estonia, still at samples. No price floor."
  },
  {
    "ticker": "UUUU",
    "name": "Energy Fuels",
    "scores": {
      "aiDemand": 5,
      "survival": 7,
      "execution": 5,
      "policy": 5,
      "heavyRE": 7,
      "valuation": 3,
      "aiOps": 0
    },
    "composite": 4.9,
    "compositeDisplay": "4.9",
    "tier": 2,
    "worlds": {
      "takeoff": 6,
      "steady": 5,
      "stall": 4
    },
    "why": "Uranium pays for a heavy-rare-earth build that supplies Vulcan’s drone magnets. Pricey at ~24× sales."
  },
  {
    "ticker": "REMX",
    "name": "REMX (ETF)",
    "scores": {
      "aiDemand": 4,
      "survival": 8,
      "execution": 6,
      "policy": 5,
      "heavyRE": 3,
      "valuation": 4,
      "aiOps": 1
    },
    "composite": 4.85,
    "compositeDisplay": "4.9",
    "tier": 0,
    "worlds": {
      "takeoff": 6,
      "steady": 5,
      "stall": 3
    },
    "why": null
  },
  {
    "ticker": "ARA",
    "name": "Aclara",
    "scores": {
      "aiDemand": 3,
      "survival": 4,
      "execution": 2,
      "policy": 5,
      "heavyRE": 9,
      "valuation": 5,
      "aiOps": 0
    },
    "composite": 3.85,
    "compositeDisplay": "3.9",
    "tier": 3,
    "worlds": {
      "takeoff": 5,
      "steady": 4,
      "stall": 2
    },
    "why": "Purest dysprosium/terbium bet, but no binding financing or customers yet, and substitute magnets target exactly its niche."
  },
  {
    "ticker": "ARU",
    "name": "Arafura",
    "scores": {
      "aiDemand": 3,
      "survival": 4,
      "execution": 3,
      "policy": 7,
      "heavyRE": 3,
      "valuation": 5,
      "aiOps": 0
    },
    "composite": 3.7,
    "compositeDisplay": "3.7",
    "tier": 3,
    "worlds": {
      "takeoff": 5,
      "steady": 4,
      "stall": 2
    },
    "why": "Fully approved with government backers, but light rare earths only and exposed to spot prices."
  },
  {
    "ticker": "UCU",
    "name": "Ucore",
    "scores": {
      "aiDemand": 4,
      "survival": 3,
      "execution": 2,
      "policy": 5,
      "heavyRE": 5,
      "valuation": 5,
      "aiOps": 1
    },
    "composite": 3.55,
    "compositeDisplay": "3.6",
    "tier": 3,
    "worlds": {
      "takeoff": 5,
      "steady": 3,
      "stall": 1
    },
    "why": "New separation tech, unproven at scale; keeps selling shares."
  },
  {
    "ticker": "CRML",
    "name": "Critical Metals",
    "scores": {
      "aiDemand": 2,
      "survival": 2,
      "execution": 1,
      "policy": 3,
      "heavyRE": 7,
      "valuation": 1,
      "aiOps": 0
    },
    "composite": 2.2,
    "compositeDisplay": "2.2",
    "tier": 4,
    "worlds": {
      "takeoff": 4,
      "steady": 2,
      "stall": 1
    },
    "why": "Arctic mine still at the study stage; ~850× sales; heavily shorted."
  },
  {
    "ticker": "NB",
    "name": "NioCorp",
    "scores": {
      "aiDemand": 3,
      "survival": 1,
      "execution": 1,
      "policy": 4,
      "heavyRE": 3,
      "valuation": 3,
      "aiOps": 0
    },
    "composite": 2.15,
    "compositeDisplay": "2.2",
    "tier": 4,
    "worlds": {
      "takeoff": 3,
      "steady": 2,
      "stall": 1
    },
    "why": "Needs about $1.4B more than it has."
  }
];

/** 11 · Dates to watch, in order. */
export const DATES: { when: string; what: string; detail: string }[] = [
  {
    "when": "Late Oct",
    "what": "Tesla Q3 letter",
    "detail": "Is Optimus V3 really in production? Any magnet supplier named outside China?"
  },
  {
    "when": "Late Oct",
    "what": "Lynas September-quarter report",
    "detail": "Heavy-rare-earth output and ore problems; any CEO news."
  },
  {
    "when": "28–29 Oct",
    "what": "Fed meeting",
    "detail": "Markets priced ~73% odds of another hike. Bad for companies still building."
  },
  {
    "when": "3 Nov",
    "what": "US midterm elections",
    "detail": "Congress oversight of newer government deals (USA Rare Earth)."
  },
  {
    "when": "Early Nov",
    "what": "MP Q3 results (date TBA)",
    "detail": "GM magnet shipments started? Cash vs the $429M? 10X still on track for 2028?"
  },
  {
    "when": "9 Nov",
    "what": "USA Rare Earth Q3",
    "detail": "Stillwater magnet plant at 600 t/yr? Size of the next share sale."
  },
  {
    "when": "10 Nov",
    "what": "China’s export-rule pause ends (on paper)",
    "detail": "Extended, lapsed or eased. The single biggest date for the whole group."
  },
  {
    "when": "Dec 2026",
    "what": "Saskatchewan AI-run separation plant",
    "detail": "If it works, China’s know-how edge shrinks (chain 5)."
  },
  {
    "when": "10 Jan 2027",
    "what": "US–China truce expires",
    "detail": "Escalation lifts Western names; a real deal hits them 10–20%."
  },
  {
    "when": "2027",
    "what": "Niron + Iluka + Energy Fuels milestones",
    "detail": "First rare-earth-free magnet plant; new heavy-rare-earth refineries."
  }
];

/** The numbered sources. `n` is the citation number (^[n] → #src-n). */
export const SOURCES: { n: number; title: string; url: string }[] = [
  {
    "n": 1,
    "title": "MP Materials Q2 2026 results (SEC 8-K), 6 Aug 2026",
    "url": "https://www.sec.gov/Archives/edgar/data/0001801368/000180136826000047/mpmcq22026er.htm"
  },
  {
    "n": 2,
    "title": "Lynas FY26 results (ASX), 26 Aug 2026",
    "url": "https://announcements.asx.com.au/asxpdf/20260826/pdf/0737nx07s3tnf7.pdf"
  },
  {
    "n": 3,
    "title": "USA Rare Earth Q2 2026 results (SEC 8-K), 10 Aug 2026",
    "url": "https://www.sec.gov/Archives/edgar/data/0001970622/000197062226000056/exhibit991-earningsrelease.htm"
  },
  {
    "n": 4,
    "title": "Metal Tech News, USA Rare Earth–Serra Verde merger complete, 9 Sep 2026",
    "url": "https://www.metaltechnews.com/story/2026/09/09/tech-metals/usa-rare-earth-serra-verde-merger-complete/2940.html"
  },
  {
    "n": 5,
    "title": "IEA, Rare Earth Elements executive summary, 2026",
    "url": "https://www.iea.org/reports/rare-earth-elements/executive-summary"
  },
  {
    "n": 6,
    "title": "S&P Global Platts, NdPr sales heard below $110/kg, 18 Aug 2026",
    "url": "https://www.spglobal.com/energy/en/news-research/latest-news/metals/081826-rare-earths-ndpr-oxide-sales-heard-below-support-levels-of-110kg-cif-north-america"
  },
  {
    "n": 7,
    "title": "SMM, Pr-Nd oxide price, Sep 2026",
    "url": "https://www.metal.com/en/rare-earth-oxides/201102250162"
  },
  {
    "n": 8,
    "title": "Jones Day, China pauses rare earth export controls (to 10 Nov 2026), Nov 2025",
    "url": "https://www.jonesday.com/en/insights/2025/11/bis-suspends-affiliates-rule_china-pauses-rare-earth-export-controls"
  },
  {
    "n": 9,
    "title": "investingLive, Trump–Xi summit extends truce to 10 Jan 2027, 24 Sep 2026",
    "url": "https://investinglive.com/news/trump-xi-summit-extends-the-trade-truce-but-leaves-the-biggest-market-questions-unresolved/"
  },
  {
    "n": 10,
    "title": "Mining Weekly, China puts MP and USA Rare Earth on export-control list, 22 Jun 2026",
    "url": "https://www.miningweekly.com/article/china-places-two-us-rare-earths-producers-on-export-control-list-2026-06-22"
  },
  {
    "n": 11,
    "title": "Federal Reserve statement, 16 Sep 2026",
    "url": "https://federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm"
  },
  {
    "n": 12,
    "title": "Reuters via Kitco, 10-year yield highest since 2007, 23 Sep 2026",
    "url": "https://www.kitco.com/news/off-the-wire/2026-09-23/us-stocks-fall-10-year-treasury-yield-hits-highest-2007"
  },
  {
    "n": 13,
    "title": "Anthropic, Measuring the pace of AI development inside frontier labs, 17 Sep 2026",
    "url": "https://www.anthropic.com/institute/measuring-pace-of-ai-development"
  },
  {
    "n": 14,
    "title": "Anthropic, What work can robots do?, 30 Sep 2026",
    "url": "https://www.anthropic.com/research/what-work-can-robots-do"
  },
  {
    "n": 15,
    "title": "TechRadar, OpenAI automated research intern, Sep 2026",
    "url": "https://techradar.com/pro/openai-says-it-has-built-an-automated-research-intern-to-carry-out-menial-tasks-and-its-only-just-getting-started"
  },
  {
    "n": 16,
    "title": "The Hacker News, OpenAI shelves GPT-6.1 Astra, Sep 2026",
    "url": "https://thehackernews.com/2026/09/openai-shelves-gpt-61-astra-after-tests.html"
  },
  {
    "n": 17,
    "title": "Bloomberg (BGov), Anthropic run-rate passes $65B, 17 Aug 2026",
    "url": "https://news.bgov.com/financial-accounting/anthropic-revenue-run-rate-surpasses-65-billion-ahead-of-ipo"
  },
  {
    "n": 18,
    "title": "The Next Web, Anthropic–Google–Broadcom compute deal, 7 Apr 2026",
    "url": "https://thenextweb.com/news/anthropic-google-broadcom-compute-deal"
  },
  {
    "n": 19,
    "title": "Yahoo Finance, Anthropic to rent all of SpaceX’s Colossus, 6 May 2026",
    "url": "https://finance.yahoo.com/news/anthropic-to-rent-all-ai-capacity-at-spacexs-colossus-data-center-180327774.html"
  },
  {
    "n": 20,
    "title": "Motley Fool, SpaceX absorbed xAI at $1.25T, 31 Mar 2026",
    "url": "https://www.fool.com/investing/2026/03/31/spacex-absorbed-xai-at-a-combined-125-trillion-val/"
  },
  {
    "n": 21,
    "title": "TechCrunch, SpaceX prices IPO at $135, 11 Jun 2026",
    "url": "https://techcrunch.com/2026/06/11/spacex-officially-prices-shares-at-135-in-the-largest-ipo-ever/"
  },
  {
    "n": 22,
    "title": "Via Satellite, Starship reaches orbit, 28 Sep 2026",
    "url": "https://www.satellitetoday.com/launch/2026/09/28/spacexs-starship-reaches-orbit-cuts-10-hour-mission-short-after-engine-issue/"
  },
  {
    "n": 23,
    "title": "DCD, SpaceX files for million-satellite orbital data centres, 2026",
    "url": "https://www.datacenterdynamics.com/en/news/spacex-files-for-million-satellite-orbital-ai-data-center-megaconstellation"
  },
  {
    "n": 24,
    "title": "TechNode, Chinese makers >97% of humanoid shipments H1 2026, 11 Aug 2026",
    "url": "https://technode.com/2026/08/11/chinese-makers-accounted-for-more-than-97-of-global-humanoid-robot-shipments-in-h1-2026/"
  },
  {
    "n": 25,
    "title": "Argus, China NdFeB capacity and robot demand, 2026",
    "url": "https://www.argusmedia.com/metals-platform/newsandanalysis/article/2696348-China-s-NdFeB-output-capacity-to-grow-on-strong-demand"
  },
  {
    "n": 26,
    "title": "BloombergNEF, US data-centre capacity outlook, 21 Jul 2026",
    "url": "https://about.bnef.com/insights/data-centers/six-things-to-know-about-bnefs-new-us-data-center-capacity-outlook/"
  },
  {
    "n": 27,
    "title": "Reuters via Yahoo, OpenAI compute spend plans, 2026",
    "url": "https://finance.yahoo.com/news/openai-sees-compute-spend-around-223950561.html"
  },
  {
    "n": 28,
    "title": "Seagate FY2026 10-K",
    "url": "https://www.sec.gov/Archives/edgar/data/0001137789/000113778926000159/stx-20260703.htm"
  },
  {
    "n": 29,
    "title": "Metal Tech News, MP and the drone sector, 5 Aug 2026",
    "url": "https://metaltechnews.com/story/2026/08/05/tech-metals/mp-swarms-drone-sector-around-us-magnets/2869.html"
  },
  {
    "n": 30,
    "title": "Magnetics Magazine, Proterial heavy-rare-earth-free magnet",
    "url": "https://magneticsmag.com/proterial-develops-heavy-rare-earth-free-neo-sintered-magnet-for-ev-motors-also-new-soft-magnetic-material-for-motor-cores/"
  },
  {
    "n": 31,
    "title": "Mining.com, Niron breaks ground on rare-earth-free magnet plant",
    "url": "https://www.mining.com/niron-breaks-ground-on-rare-earth-free-magnet-manufacturing-plant-in-minnesota/"
  },
  {
    "n": 32,
    "title": "Reuters via Kitco, yttrium/scandium shortages worsen, 26 Feb 2026",
    "url": "https://www.kitco.com/news/off-the-wire/2026-02-26/rare-earth-shortages-worsen-us-aerospace-chips-despite-trade-truce"
  },
  {
    "n": 33,
    "title": "AJOT, GE Vernova and US government on yttrium stocks",
    "url": "https://www.ajot.com/news/ge-vernova-working-with-us-government-to-boost-stocks-of-rare-earth-yttrium"
  },
  {
    "n": 34,
    "title": "Mining Weekly, USA Rare Earth AI + quantum partnership, 17 Sep 2026",
    "url": "https://www.miningweekly.com/article/usa-rare-earth-announces-ai-quantum-computing-partnership-for-optimised-processing-2026-09-17"
  },
  {
    "n": 35,
    "title": "Engineering News, Lynas and the US Department of War, 16 Mar 2026",
    "url": "https://www.engineeringnews.co.za/article/lynas-one-step-closer-to-supplying-ree-to-us-war-department-2026-03-16"
  },
  {
    "n": 36,
    "title": "Northern Miner, Energy Fuels–Vulcan partnership, Aug 2025",
    "url": "https://www.northernminer.com/news/energy-fuels-soars-on-vulcan-elements-partnership/1003881907/"
  },
  {
    "n": 37,
    "title": "Business Wire, Microsoft invests in Cyclic Materials, 16 Jul 2024",
    "url": "https://www.businesswire.com/news/home/20240716818494/en/"
  },
  {
    "n": 38,
    "title": "Axios, Vulcan magnets for Army drones, 23 Sep 2026",
    "url": "https://www.axios.com/2026/09/23/vulcan-magnets-army-drones-skyfoundry"
  },
  {
    "n": 39,
    "title": "IOM3, Earth AI predictive discoveries, 7 Apr 2025",
    "url": "https://www.iom3.org/resource/new-mineral-prospects-confirmed-found-by-predictive-ai-technology.html"
  },
  {
    "n": 40,
    "title": "Mining Weekly, rare earth miners fall on truce, 27 Oct 2025",
    "url": "https://www.miningweekly.com/article/rare-earth-miners-fall-as-us-china-truce-to-pause-tariffs-export-curbs-2025-10-27"
  },
  {
    "n": 41,
    "title": "24/7 Wall St, rare earth stocks tumble on thaw hopes, 10 Sep 2026",
    "url": "https://247wallst.com/investing/2026/09/10/rare-earth-stocks-tumble-on-u-s-china-thaw-hopes-usa-rare-earth-sinks-4-mp-materials-drops-5-critical-metals-slips/"
  },
  {
    "n": 42,
    "title": "Insider Monkey, MP drops 8.8% as rival gets funding, Jan 2026",
    "url": "https://www.insidermonkey.com/blog/mp-materials-mp-drops-8-8-as-rival-gets-higher-funding-from-govt-1682000/?amp=1"
  },
  {
    "n": 43,
    "title": "Reuters via Mining Weekly, China Rare Earth Group–Shenghe talks, 18 Sep 2026",
    "url": "https://www.miningweekly.com/article/china-rare-earth-group-in-talks-to-buy-mp-materials-shareholder-shenghe-resources-sources-say-2026-09-18"
  },
  {
    "n": 44,
    "title": "24/7 Wall St, MP sank 21% in a month, 28 Sep 2026",
    "url": "https://247wallst.com/investing/2026/09/28/mp-materials-just-sank-21-in-a-month-is-it-time-to-sell-or-is-this-a-prime-buying-opportunity/"
  },
  {
    "n": 45,
    "title": "VanEck REMX page and holdings, 24 Sep 2026",
    "url": "https://www.vaneck.com/us/en/investments/rare-earth-strategic-metals-etf-remx/"
  },
  {
    "n": 46,
    "title": "MarketScreener, China Northern Rare Earth, 15 Sep 2026",
    "url": "https://in.marketscreener.com/quote/stock/CHINA-NORTHERN-RARE-EARTH-6496719/"
  },
  {
    "n": 47,
    "title": "FilingReader, China Northern H1 2026 profit, 20 Aug 2026",
    "url": "https://filingreader.com/news-wire/shanghai/2026-08-20/china-northern-rare-earth-posts-surge-in-first-half-profit"
  },
  {
    "n": 48,
    "title": "Neo Performance Q2 2026 results",
    "url": "https://www.neomaterials.com/neo-performance-materials-reports-second-quarter-2026-results/"
  },
  {
    "n": 49,
    "title": "Motley Fool AU, Iluka H1 2026 results, 19 Aug 2026",
    "url": "https://www.fool.com.au/2026/08/19/iluka-resources-shares-2026-half-year-earnings-results-unravelled/"
  },
  {
    "n": 50,
    "title": "FilingReader, Arafura FID on Nolans, 31 Aug 2026",
    "url": "https://filingreader.com/news-wire/sydney/2026-08-31/arafura-reaches-final-investment-decision-for-nolans-project"
  },
  {
    "n": 51,
    "title": "Energy Fuels Q2 2026 10-Q",
    "url": "https://www.sec.gov/Archives/edgar/data/0001385849/000138584926000029/efr-20260630.htm"
  },
  {
    "n": 52,
    "title": "Energy Fuels $700M convertible notes, 3 Oct 2025",
    "url": "https://investors.energyfuels.com/2025-10-03-Energy-Fuels-Announces-Closing-of-Upsized-US-700-0-Million-Convertible-Senior-Notes-Offering-and-Full-Exercise-of-Initial-Purchasers-Option-to-Purchase-Additional-Notes"
  },
  {
    "n": 53,
    "title": "NioCorp FY2026 10-K",
    "url": "https://www.sec.gov/Archives/edgar/data/0001512228/000119312526402806/nb-20260630.htm"
  },
  {
    "n": 54,
    "title": "Quartr, Critical Metals event, 2026",
    "url": "https://quartr.com/events/critical-metals-corp-crml-q4-2026_FeRBOWAN"
  },
  {
    "n": 55,
    "title": "Ucore C$69M financing close, 13 Aug 2026",
    "url": "https://ucore.com/?p=6282"
  },
  {
    "n": 56,
    "title": "Metal Tech News, EXIM weighs $750M for Aclara, 9 Sep 2026",
    "url": "https://www.metaltechnews.com/story/2026/09/09/tech-metals/exim-weighs-750m-for-aclara-rare-earths/2941.html"
  },
  {
    "n": 57,
    "title": "Bloomberg, Molycorp files for bankruptcy, 25 Jun 2015",
    "url": "https://www.bloomberg.com/news/articles/2015-06-25/molycorp-files-for-bankruptcy-proposes-debt-restructuring-plan"
  },
  {
    "n": 58,
    "title": "DeFi Rate, House control odds, 28 Sep 2026",
    "url": "https://defirate.com/prediction-markets/2026-midterms/house-control-odds/"
  },
  {
    "n": 59,
    "title": "Adamas Intelligence, rare earth magnet market outlook",
    "url": "https://adamasintel.com/rare-earth-magnet-market-outlook-to-2035/"
  },
  {
    "n": 60,
    "title": "Electrek, Optimus Fremont production timeline",
    "url": "https://electrek.co/?p=464555"
  },
  {
    "n": 61,
    "title": "Reuters via Mining Weekly, Lynas takeover talks, 2 Sep 2026",
    "url": "https://www.miningweekly.com/article/lynas-rare-earths-says-it-was-in-takeover-talks-earlier-this-year-2026-09-02-1"
  },
  {
    "n": 62,
    "title": "MP Materials–Apple $500M agreement, 15 Jul 2025",
    "url": "https://www.businesswire.com/news/home/20250715067846/en/"
  },
  {
    "n": 63,
    "title": "Mining Weekly, MP Materials Pentagon deal, 10 Jul 2025",
    "url": "https://www.miningweekly.com/article/mp-materials-lands-multibillion-dollar-pentagon-deal-to-bolster-us-rare-earth-magnet-supply-2025-07-10"
  },
  {
    "n": 64,
    "title": "Fastmarkets, dysprosium/terbium prices (date unconfirmed)",
    "url": "https://www.fastmarkets.com/?p=137339"
  },
  {
    "n": 65,
    "title": "Thunder Said Energy, EV motors and magnets",
    "url": "https://thundersaidenergy.com/downloads/electric-vehicles-motors-and-magnets/"
  },
  {
    "n": 66,
    "title": "Saskatchewan Research Council, rare earth processing facility",
    "url": "https://www.src.sk.ca/node/1904"
  },
  {
    "n": 67,
    "title": "CRE Daily, gas turbine shortage and data centres",
    "url": "https://www.credaily.com/briefs/gas-turbine-shortage-threatens-data-center-power-plans/"
  }
];
