(function () {
  "use strict";
  var C = (window.WhatIFCareers = window.WhatIFCareers || {});

  function insight(s) {
    var n = 0;
    ["foundConcentration", "storeData", "askedDebt", "contractExpiring", "usedSamData", "cityIssue", "askedMarcus"].forEach(function (k) {
      if (s.flags[k]) n += 1;
    });
    return n;
  }

  function slip(s, res) {
    if (s.flags.errorSlipped) {
      res.fx.rep = (res.fx.rep || 0) - 8;
      res.fx.bonus = (res.fx.bonus || 0) - 600;
      res.reaction.push({
        who: "priya",
        text: "One more thing. A committee member just caught an error in your forecast, the one assuming 28% growth every year. That's embarrassing for all of us."
      });
    }
    if (s.flags.blazer) {
      res.fx.rep = (res.fx.rep || 0) + 4;
      res.reaction.push({ text: "Your sharp blazer helps. People remember how a presenter looks as well as what they say." });
    }
    return res;
  }

  C.investor = {
    id: "investor",
    title: "Investment Analyst",
    org: "Harbor Capital",
    field: "Business & Finance",
    blurb: "Spend three days at a small investment firm. Study a company, earn a salary, manage your money and decide where clients' money goes.",
    reviewTitle: "Your performance review",
    taxRate: 0.22,

    labels: { skill: "Analysis", rep: "Reputation", energy: "Energy" },
    start: { cash: 400, rep: 55, skill: 40, energy: 80 },
    bonus: { label: "Bonus pool", start: 1500 },
    pay: { label: "Daily salary (gross)", gross: 300 },
    dailyBills: [{ label: "Food", amount: 25 }],

    characters: {
      marcus: { name: "Marcus Webb", role: "Vice President, your mentor", initials: "MW", color: "#012c64", rel: true, start: 50 },
      priya: { name: "Priya Nair", role: "Managing Partner", initials: "PN", color: "#7a2e3a", rel: true, start: 45 },
      sam: { name: "Sam Okafor", role: "Fellow analyst", initials: "SO", color: "#2f6f73", rel: true, start: 55 },
      elena: { name: "Elena Torres", role: "Founder, Brightleaf Coffee", initials: "ET", color: "#8a6d1f", rel: false }
    },

    glossary: {
      "due diligence": "The research an investor does before putting money in: checking the numbers, the risks and the people.",
      "investment committee": "A group of senior people at the firm who vote on whether to invest.",
      "revenue growth": "How much a company's sales increase from one year to the next.",
      "profit margin": "The share of sales left over as profit after paying all costs. A 4% margin means $4 of profit for every $100 of sales.",
      "debt": "Money a company has borrowed and has to pay back, with interest.",
      "concentration risk": "Depending too heavily on one customer, product or supplier. If that one thing goes wrong, everything does.",
      "forecast": "An estimate of a company's future sales and profit, built from assumptions.",
      "staged investment": "Investing part of the money now and the rest later, only if the company hits agreed targets.",
      "bonus": "Extra pay on top of salary, usually tied to how well you or the firm performed.",
      "clawback": "When a firm takes back bonus money because a decision turned out badly.",
      "gross pay": "Pay before taxes and other deductions come out.",
      "stake": "The share of a company that an investor owns."
    },

    briefing: {
      intro: "You are a junior analyst at Harbor Capital, a small investment firm. Harbor takes money from clients such as pension funds, universities and families, and invests it in companies it believes will grow. When those companies succeed, clients profit and so does Harbor. When they fail, clients lose money. Your job is to study a company and recommend whether Harbor should invest. This week's case is Brightleaf Coffee.",
      rules: [
        "Salary: $78,000 a year, which is about $300 a day in {{gross pay}}. In this game, every day is a paid workday.",
        "Taxes: about 22% comes out of your pay and your bonus. What's left is your take-home pay.",
        "Bills: you pay for housing and $25 a day for food every evening. You choose how you commute, and commuting costs money.",
        "Punctuality: be at Harbor Capital by 9:00 AM. Harbor's attendance policy deducts $50 each time you're late. (Real salaried jobs often work differently. Here, it's a game rule so you can feel the stakes.)",
        "Bonus: you start with a $1,500 {{bonus}} pool. Good work grows it and mistakes shrink it. If a deal you recommend loses money, Harbor can take part of the loss back from you through a {{clawback}}, capped at $1,200 in this game.",
        "All numbers are simplified and fictional so you can practice making trade-offs."
      ],
      housingTitle: "Where will you live?",
      housingHelp: "Your home sets your rent and your commute. Cheaper rent means a longer trip and a higher chance of being late."
    },

    housing: [
      { id: "family", name: "With family outside the city", cost: 0, late: 0.3, desc: "Free rent, but a long train ride in." },
      { id: "roommates", name: "Shared apartment with roommates", cost: 55, late: 0.15, desc: "A reasonable commute and a reasonable bill." },
      { id: "studio", name: "Studio near the office", cost: 110, late: 0.04, desc: "A short walk, but it takes a big bite out of your pay." }
    ],

    objectives: [
      { text: "Earn a \"Meets expectations\" review or better", test: function (s) { return s.reviewScore >= 60; } },
      { text: "Be late to work no more than once", test: function (s) { return s.lates <= 1; } },
      { text: "Finish with at least $1,000 in cash", test: function (s) { return s.cash >= 1000; } }
    ],

    commute: {
      where: "Harbor Capital",
      bossId: "marcus",
      deadlines: ["9:00 AM", "9:00 AM", "9:00 AM"],
      fees: [50, 50, 50],
      feeLabels: ["Late arrival deduction", "Late arrival deduction", "Late arrival deduction"],
      flavor: [
        "Monday, 7:40 AM. Your first day. The office is across town and your phone says the 8:10 train is the one to catch.",
        "Tuesday, 7:35 AM. You stayed up late reading about coffee supply chains. The train app says \"minor delays\" on your line.",
        "Wednesday, 7:30 AM. Committee day. A text from Marcus: \"Don't be late today. Priya notices.\""
      ],
      options: [
        { text: "Take the train, like most people do", short: "Train fare", cost: 6, mult: 1 },
        { text: "Take a rideshare", short: "Rideshare", cost: 26, mult: 0.15 },
        { text: "Leave 30 minutes early and review your notes on the train", short: "Train fare", cost: 6, mult: 0.15, energy: -4, skill: 2 }
      ],
      lateLines: [
        "The train sat in a tunnel for twenty minutes. You walk in at 9:14. Marcus glances at the clock but says nothing. Payroll will.",
        "A signal problem stalls the line. You arrive at 9:11, a little out of breath. Priya looks up from her laptop. Nobody smiles.",
        "Of all days. You arrive at 9:09 with the committee deck still unprinted. Marcus gives you a look you will remember."
      ],
      okLines: [
        "You arrive at 8:50 with time for coffee. Nobody notices you did the right thing, which is how being on time works.",
        "You make it at 8:55. The delays on the line were real, but your plan absorbed them.",
        "You walk in at 8:45. Marcus nods once. That's all the praise you'll get today, and it's enough."
      ]
    },

    evening: [
      "Back at your place, your feet hurt and your head is full of coffee shops. Time to see how the day treated your wallet.",
      "It's been a long day with a lot of people disagreeing in polite voices. Let's check where your money stands.",
      ""
    ],

    shop: [
      { id: "course", name: "Online course: reading financial statements", desc: "Learn to read a company's {{revenue growth}}, {{profit margin}} and {{debt}} numbers faster.", cost: 60, fx: { skill: 8 } },
      { id: "dinner", name: "Team dinner with Marcus and Sam", desc: "Build trust outside the office. It also means leaving the laptop closed.", cost: 45, daily: true, fx: { rel: { marcus: 6, sam: 6 }, energy: 3 } },
      { id: "blazer", name: "A sharp blazer for committee day", desc: "Looking the part helps you present with confidence.", cost: 120, fx: { flags: { blazer: true } } },
      { id: "takeout", name: "Comfort food and a movie", desc: "Not everything has to be an investment.", cost: 35, daily: true, fx: { energy: 12 } },
      { id: "sleep", name: "Go to bed early", desc: "Costs nothing and boosts your energy for tomorrow.", cost: 0, daily: true, fx: { energy: 15 } }
    ],

    days: [
      {
        name: "Monday",
        scenes: [
          {
            time: "9:15 AM",
            title: "Welcome to Harbor Capital",
            setting: "Harbor Capital, 14th floor. Glass walls, a quiet trading room and one very loud espresso machine.",
            lines: [
              { who: "marcus", text: "Welcome, [name]. I'm Marcus, your mentor this week. Quick version of what we do: clients give us money and we invest it in companies we think will grow. If we're right, clients profit and so do we." },
              { who: "marcus", text: "If we're wrong, clients lose money and it lands on us. That's why we do {{due diligence}} before we invest. We check everything we can." },
              { who: "marcus", text: "Your case this week is Brightleaf Coffee. They're asking us for $5 million. The {{investment committee}} meets Wednesday afternoon and you'll recommend what we do." },
              { who: "priya", text: "Brightleaf? I met the founder. Real energy in that room. Don't overthink it." }
            ],
            prompt: "It's your first morning. How do you start?",
            choices: [
              {
                text: "Ask Marcus how he evaluates a deal before reading anything.",
                reaction: [
                  { who: "you", text: "Before I dive in, how do you decide whether a deal is good?" },
                  { who: "marcus", text: "Good question. Three things: is the growth real, what could go wrong, and do we trust the people? Start with the second one. Everyone skips it." }
                ],
                fx: { skill: 6, rel: { marcus: 8 }, flags: { askedMarcus: true } }
              },
              {
                text: "Dive straight into the pitch document.",
                reaction: [
                  { text: "You read for two hours. The pitch is polished, maybe too polished. Every chart goes up and to the right." }
                ],
                fx: { skill: 8, energy: -6 }
              },
              {
                text: "Take Priya's advice: skim it and trust the founder's energy.",
                reaction: [
                  { who: "priya", text: "Exactly. Instinct is half this job." },
                  { text: "Marcus raises an eyebrow but says nothing." }
                ],
                fx: { skill: -2, rel: { priya: 6, marcus: -3 }, flags: { followedPriya: true } }
              }
            ]
          },
          {
            time: "11:00 AM",
            title: "The numbers",
            setting: "Marcus drops a one-page summary on your desk. Brightleaf Coffee (a fictional company) runs 14 cafes in three cities and wants money to expand.",
            facts: [
              { label: "{{Revenue growth}}", value: "28% a year" },
              { label: "{{Profit margin}}", value: "4%" },
              { label: "Existing {{debt}}", value: "$12 million" },
              { label: "Revenue from one grocery partner", value: "60%" },
              { label: "The ask", value: "$5 million" },
              { label: "Plan", value: "20 new cafes" }
            ],
            lines: [
              { who: "marcus", text: "Pick one number and pull the thread. You can't chase them all in a day." },
              { who: "sam", text: "I'm Sam. I can help with the spreadsheet if you want a second set of eyes." }
            ],
            prompt: "Which number do you investigate first?",
            choices: [
              {
                text: "The 28% growth. Is it coming from new stores or existing ones?",
                reaction: [
                  { who: "you", text: "Can we split the growth between new cafes and ones that have been open a while?" },
                  { who: "sam", text: "Smart. New stores can hide a weak core. I'll pull store-level data tonight." }
                ],
                fx: { skill: 8, rel: { sam: 6 }, flags: { storeData: true } }
              },
              {
                text: "The 60% of revenue from one grocery partner.",
                reaction: [
                  { who: "you", text: "Sixty percent from one customer worries me. What happens if they leave?" },
                  { who: "marcus", text: "That's the one. We call it {{concentration risk}}: if that partner pulls back, the whole company could be in trouble." }
                ],
                fx: { skill: 8, rel: { marcus: 6 }, flags: { foundConcentration: true } }
              },
              {
                text: "The $12 million of debt compared to the $5 million ask.",
                reaction: [
                  { who: "you", text: "They already owe $12 million. Where does our $5 million fit in?" },
                  { who: "marcus", text: "Right instinct. Debt gets paid back before investors see anything, so it limits what's left for us." }
                ],
                fx: { skill: 6, rel: { marcus: 4 }, flags: { askedDebt: true } }
              }
            ]
          }
        ]
      },
      {
        name: "Tuesday",
        scenes: [
          {
            time: "9:30 AM",
            title: "A disagreement",
            setting: "The small team room. Priya has her laptop open. Sam is staring at his coffee.",
            lines: [
              { who: "priya", text: "I've seen enough. This is a winner. We should push the committee to approve the full $5 million." },
              { who: "sam", text: "Quietly, to you: the newest stores in the second city earn about half what the first-city stores did at the same age. I don't think we can ignore that." },
              { text: "Priya looks at you. Everyone else has gone quiet." },
              { who: "priya", text: "[name]? You've been in the numbers. What do you think?" }
            ],
            prompt: "What do you say?",
            choices: [
              {
                text: "Agree with Priya. She has far more experience.",
                reaction: [
                  { who: "you", text: "I think Priya's read on the founder is right. I'm comfortable moving forward." },
                  { who: "priya", text: "Good. I like people who see the big picture." },
                  { text: "Sam looks down at his desk." }
                ],
                fx: { rel: { priya: 8, sam: -6 }, skill: -2, flags: { sidedPriya: true } }
              },
              {
                text: "Ask Sam to show you the store data before deciding.",
                reaction: [
                  { who: "you", text: "Sam, can you walk me through the numbers? I want to see them before I decide." },
                  { who: "priya", text: "Fine. But I need an answer by tomorrow." }
                ],
                fx: { skill: 6, rel: { sam: 8, priya: -2 }, flags: { usedSamData: true } }
              },
              {
                text: "Say you're not ready to commit and ask for until the end of the day.",
                reaction: [
                  { who: "you", text: "I'd like until end of day to check a few things. I'd rather be right than quick." },
                  { who: "priya", text: "Brave. Make it count." }
                ],
                fx: { skill: 4, rep: 4, rel: { priya: -3, marcus: 4 }, flags: { pushedBack: true } }
              }
            ]
          },
          {
            time: "1:30 PM",
            title: "Call with the founder",
            setting: "You and Marcus join a video call with Elena Torres, founder of Brightleaf Coffee. She is warm, fast-talking and a little tired.",
            lines: [
              { who: "elena", text: "Thanks for making time. I know the numbers in the second city look rough. We opened too fast." },
              { who: "marcus", text: "You get one question before we wrap up, [name]. Make it a good one." }
            ],
            prompt: "What do you ask Elena?",
            choices: [
              {
                text: "Is the grocery contract locked in?",
                reaction: [
                  { who: "you", text: "Sixty percent of sales comes from one grocery partner. Is that contract locked in?" },
                  { who: "elena", text: "It expires in eight months. They've hinted they'd like to renegotiate." },
                  { who: "marcus", text: "Write that down. That is exactly the kind of thing that changes a recommendation." }
                ],
                fx: { skill: 6, rel: { marcus: 6 }, flags: { contractExpiring: true } }
              },
              {
                text: "What went wrong in the second city?",
                reaction: [
                  { who: "you", text: "What went wrong in the second city, and what have you changed?" },
                  { who: "elena", text: "We hired fast and trained slowly. We've fixed it, but it's too early for the numbers to show it." },
                  { text: "It's a plausible answer. It's also an answer you can't verify yet." }
                ],
                fx: { skill: 5, rep: 2, flags: { cityIssue: true } }
              },
              {
                text: "How exactly would you spend the $5 million?",
                reaction: [
                  { who: "you", text: "If we invested the $5 million, what would you do with it?" },
                  { who: "elena", text: "Twenty new cafes across three new cities in eighteen months." },
                  { who: "marcus", text: "That's very aggressive. Good to know." }
                ],
                fx: { skill: 4, rel: { marcus: 2 }, flags: { aggressivePlan: true } }
              }
            ]
          },
          {
            time: "4:30 PM",
            title: "The forecast",
            setting: "Late afternoon. You've built a simple {{forecast}} of how much money Brightleaf could make over the next five years. You're tired, and it's almost done.",
            lines: [
              { who: "sam", text: "Quick sanity check. Your growth cell says 28% for every future year. For twenty new stores, that's... a lot." },
              { text: "He's right. You copied the current growth rate down the whole column. If you send this to Marcus as is, it will make the deal look much better than it is." }
            ],
            prompt: "What do you do?",
            choices: [
              {
                text: "Recheck the model and fix it before sending it.",
                hint: "Costs some energy now.",
                reaction: [
                  { who: "you", text: "Good catch. Give me twenty minutes to fix that properly." },
                  { who: "sam", text: "Assuming 28% forever is a classic mistake. Better you than the committee." }
                ],
                fx: { energy: -8, skill: 8, rel: { sam: 6 } }
              },
              {
                text: "It's probably fine. Send it to Marcus as is.",
                hint: "Risky: there's a chance nobody catches it before committee.",
                run: function (s) {
                  var caught = Math.random() < 0.7;
                  if (caught) {
                    return {
                      reaction: [
                        { who: "marcus", text: "[name]. This forecast assumes 28% growth every year forever. If we'd shown this to the committee, they'd have laughed us out of the room." },
                        { text: "The mistake costs you part of your bonus pool. At Harbor, errors that reach a senior reviewer count against you." }
                      ],
                      fx: { rep: -8, rel: { marcus: -8 }, bonus: -400, flags: { modelError: true } }
                    };
                  }
                  return {
                    reaction: [
                      { text: "Marcus skims it and moves on to the next fire. Nothing happens. For now." }
                    ],
                    fx: { flags: { modelError: true, errorSlipped: true } }
                  };
                }
              },
              {
                text: "Ask Sam to fix it for you.",
                reaction: [
                  { who: "sam", text: "Sure, this time. But you should know how to do it yourself." }
                ],
                fx: { rel: { sam: -4 }, rep: -2, energy: 2 }
              }
            ]
          }
        ]
      },
      {
        name: "Wednesday",
        scenes: [
          {
            time: "10:00 AM",
            title: "Your recommendation",
            setting: "Marcus's office. The committee meets at 3:00. You have to decide what you'll recommend.",
            lines: [
              { who: "marcus", text: "Time to decide, [name]. Remember, clients' money is on the line and so is part of your bonus. There's no perfect answer, only one you can defend." },
              { who: "marcus", text: "You can recommend the full $5 million, a smaller {{staged investment}} that releases more money only if Brightleaf hits targets, or you can pass for now." }
            ],
            prompt: "What will you recommend to the committee?",
            choices: [
              {
                text: "Invest the full $5 million. The growth is rare and real.",
                reaction: [
                  { who: "you", text: "I recommend we invest the full $5 million." },
                  { who: "marcus", text: "Bold. Be ready to defend it, because the downside is as big as the upside." },
                  { who: "priya", text: "Finally, someone with conviction." }
                ],
                fx: { rel: { priya: 6, marcus: -2 }, flags: { rec: "full" } }
              },
              {
                text: "Invest $2 million now and release more as targets are met.",
                reaction: [
                  { who: "you", text: "I recommend $2 million now, with more released if new stores hit targets and the grocery contract is renewed." },
                  { who: "marcus", text: "Sensible. It protects clients and it keeps us in the deal. Elena may not love it." }
                ],
                fx: { rel: { marcus: 6 }, flags: { rec: "staged" } }
              },
              {
                text: "Pass on the deal for now.",
                reaction: [
                  { who: "you", text: "I recommend we pass for now and revisit when the grocery contract is resolved." },
                  { who: "marcus", text: "Hard to argue with if the risks are real. Priya won't like it." },
                  { who: "priya", text: "Passing is also a decision, [name]. It has a cost." }
                ],
                fx: { rel: { marcus: 4, priya: -5 }, flags: { rec: "pass" } }
              }
            ]
          },
          function (s) {
            var lines = [
              { text: "Five committee members, one long table and a screen at the end of the room. You have five minutes." },
              { who: "marcus", text: "Remember, [name]: they've seen hundreds of pitches. Be clear, be honest and be brief." }
            ];
            if (s.flags.errorSlipped) {
              lines.push({ text: "Halfway through your slides, a committee member leans forward and taps the table." });
              lines.push({ who: "priya", text: "Hold on. Your forecast shows 28% growth every year for five years. Walk us through that." });
            }
            return {
              time: "3:00 PM",
              title: "In front of the committee",
              setting: "The boardroom on the top floor.",
              lines: lines,
              prompt: "How do you structure your five minutes?",
              choices: [
                {
                  text: "Lead with your recommendation, then give three reasons and the biggest risk.",
                  run: function (st) {
                    return slip(st, {
                      reaction: [{ who: "priya", text: "Clear and direct. I always know where I stand with you." }],
                      fx: { skill: 4, rep: 8, bonus: 300 }
                    });
                  }
                },
                {
                  text: "Walk through all the data in the order you found it.",
                  run: function (st) {
                    return slip(st, {
                      reaction: [{ text: "You're thorough, but a committee member checks the time twice before you get to your recommendation." }],
                      fx: { skill: 2, rep: 2 }
                    });
                  }
                },
                {
                  text: "Share a polished deck full of charts and let them draw their own conclusions.",
                  run: function (st) {
                    return slip(st, {
                      reaction: [{ who: "marcus", text: "Charts help, but they're paying you for your judgment, not your formatting." }],
                      fx: { rep: -3, bonus: -100 }
                    });
                  }
                }
              ]
            };
          }
        ]
      }
    ],

    finale: function (s) {
      var rec = s.flags.rec || "pass";
      var pGood = s.flags.contractExpiring ? 0.38 : 0.5;
      var good = Math.random() < pGood;
      var ins = insight(s);
      var delta = 0, rep = 0, lines = [];

      lines.push({ text: "Six months later. The committee followed your recommendation. Here is what happened." });

      if (rec === "full") {
        if (good) {
          lines.push({ text: "Brightleaf renewed its grocery contract and the new cafes found their footing. Harbor's $5 million {{stake}} is worth much more today." });
          lines.push({ who: "marcus", text: "We made money, and you made the call. Well done." });
          delta = 2000; rep = 10;
        } else {
          lines.push({ text: "The grocery partner cut its orders nearly in half. Brightleaf struggled to pay its debt. Harbor's $5 million is now worth a fraction of that." });
          lines.push({ who: "marcus", text: "This one hurts. The risks were on the table. That's how this job works. Part of the loss comes out of your bonus." });
          delta = -2400; rep = -10;
        }
      } else if (rec === "staged") {
        if (good) {
          lines.push({ text: "Brightleaf hit its targets and Harbor released the second payment. Not the biggest win, but a clean one." });
          lines.push({ who: "marcus", text: "Staged deals don't make headlines. They make careers." });
          delta = 1000; rep = 6;
        } else {
          lines.push({ text: "The grocery contract wasn't renewed, so Harbor held back the rest of its money. The $2 million is hurt, but the rest is safe." });
          lines.push({ who: "marcus", text: "That could have been much worse. You built in a way to stop." });
          delta = -300; rep = 4;
        }
      } else {
        if (good) {
          lines.push({ text: "Brightleaf thrived. Another firm made the investment and is celebrating. Harbor sat it out." });
          lines.push({ who: "priya", text: "Passing has a price, [name]. We left real money on the table." });
          delta = 0; rep = -2;
        } else {
          lines.push({ text: "Brightleaf lost its grocery partner and fell into trouble. Another firm lost millions. Harbor lost nothing." });
          lines.push({ who: "marcus", text: "Passing was the right call. It rarely gets applause, but it saves clients' money." });
          delta = 800; rep = 8;
        }
      }

      lines.push({ text: "Even a good decision can have a bad outcome, and a bad decision can get lucky. Professionals judge themselves on how well they weighed the risks." });

      var finalBonus = s.bonus + delta + ins * 100;
      var fx = { rep: rep, money: [] };
      if (finalBonus >= 0) {
        fx.money.push({ label: "Performance bonus (before taxes)", amount: finalBonus, taxable: true, cat: "income" });
        lines.push({ who: "marcus", text: "Your bonus pool finished at " + (finalBonus >= 0 ? "$" + Math.round(finalBonus).toLocaleString("en-US") : "") + ". Taxes come out of it, like everything else." });
      } else {
        var claw = Math.max(finalBonus, -1200);
        fx.money.push({ label: "Bonus clawback", amount: claw, cat: "penalty" });
        lines.push({ who: "marcus", text: "Your bonus pool went negative, which means Harbor takes money back from you: " + "$" + Math.abs(Math.round(claw)).toLocaleString("en-US") + ". That's the cost of being wrong at this level." });
      }
      s.flags.dealGood = good;
      s.flags.finalRec = rec;
      s.flags.finalBonus = finalBonus;

      return {
        time: "Six months later",
        title: "The result",
        setting: "Back at Harbor Capital, half a year on.",
        lines: lines,
        fx: fx
      };
    },

    review: function (s) {
      var rels = ["marcus", "priya", "sam"].map(function (k) { return s.rel[k]; });
      var avg = rels.reduce(function (a, b) { return a + b; }, 0) / rels.length;
      var score = Math.round(0.35 * s.skill + 0.35 * s.rep + 0.3 * avg) - 5 * s.lates + insight(s) * 3;
      if (s.flags.modelError) score -= 4;
      score = Math.max(0, Math.min(100, score));
      var lines;
      if (score >= 80) {
        lines = [
          { who: "marcus", text: "[name], that was a remarkable first week. You asked the right questions and you owned your decisions. I'd work with you again." },
          { who: "priya", text: "I didn't always agree with you. That's why I trust you." }
        ];
      } else if (score >= 60) {
        lines = [
          { who: "marcus", text: "Solid first week, [name]. There are things to sharpen, but you showed good judgment under pressure." },
          { who: "priya", text: "You'll do fine here. Speak up sooner next time." }
        ];
      } else if (score >= 40) {
        lines = [
          { who: "marcus", text: "[name], there's potential here, but this week had some avoidable misses. Let's talk about how to tighten up." },
          { who: "priya", text: "Be more careful. In this business, details cost money." }
        ];
      } else {
        lines = [
          { who: "marcus", text: "[name], this week didn't go the way any of us hoped. It happens to most people early on. What matters is what you learn from it." }
        ];
      }
      return { score: score, lines: lines };
    },

    reality: "Real analysts spend far more time reading, building spreadsheets and sitting in meetings than making dramatic calls, and most deals never close. Pay is high at some firms, but hours are long, bonuses swing with results, and decisions are judged over years rather than days. Salaried employees are usually not docked pay for being late, but lateness hurts reviews and trust. If you liked weighing evidence, questioning assumptions and defending a decision under uncertainty, this field may be worth exploring more. If you'd rather be moving around or working with your hands, you might prefer something else."
  };
})();
