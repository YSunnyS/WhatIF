(function () {
  "use strict";
  var C = (window.WhatIFCareers = window.WhatIFCareers || {});

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function fmt(n) { return "$" + Math.abs(Math.round(n)).toLocaleString("en-US"); }

  C.tennis = {
    id: "tennis",
    title: "Tennis Pro",
    org: "the Riverside Open",
    field: "Sports",
    blurb: "Spend three days on the pro circuit. Train on a budget, handle sponsors and recovery, and play your first-round match with real money on the line.",
    reviewTitle: "Your week in review",
    taxRate: 0.25,

    labels: { skill: "Game", rep: "Reputation", energy: "Energy" },
    start: { cash: 1800, rep: 50, skill: 45, energy: 85 },
    bonus: { label: "Sponsor bonus pool", start: 100 },
    pay: { label: "Sponsor retainer (gross)", gross: 120 },
    dailyBills: [{ label: "Food and recovery drinks", amount: 30 }, { label: "Travel, stringing and entry costs", amount: 60 }],

    characters: {
      whitfield: { name: "Dana Whitfield", role: "Your coach", initials: "DW", color: "#012c64", rel: true, start: 55 },
      ben: { name: "Ben Ortiz", role: "Physiotherapist", initials: "BO", color: "#2f6f73", rel: true, start: 50 },
      tara: { name: "Tara Lindqvist", role: "Apex Sportswear, sponsor rep", initials: "TL", color: "#7a2e3a", rel: true, start: 45 },
      luca: { name: "Luca Moretti", role: "Your first-round opponent", initials: "LM", color: "#8a6d1f", rel: false }
    },

    glossary: {
      "challenger": "A tournament level one step below the biggest pro tours. The prize money is modest, and players pay most of their own travel and coaching.",
      "sponsor": "A company that pays an athlete, usually in exchange for wearing its gear and promoting it.",
      "retainer": "A regular payment a sponsor makes so an athlete stays on its team.",
      "physio": "A physiotherapist, someone who treats injuries and helps athletes recover.",
      "prize money": "Money players earn from a tournament based on how far they go.",
      "break point": "A moment when the player returning serve is one point from winning the server's game.",
      "tiebreak": "A special game played when a set is tied at six games each.",
      "scouting report": "Notes on an opponent's strengths and weaknesses.",
      "code violation": "A penalty from the umpire for bad behavior, such as breaking a racquet. It can come with a fine.",
      "gross pay": "Pay before taxes and other deductions come out."
    },

    briefing: {
      intro: "You are a professional tennis player ranked just outside the top 200, playing a {{challenger}} tournament called the Riverside Open. You play your first-round match on day 3 against Luca Moretti. Between now and then, you manage practice, your body, a sponsor and your budget. Unlike an office job, you run your own small business. You pay for most of what you need.",
      rules: [
        "Income: your {{sponsor}} pays a {{retainer}} of $120 a day in {{gross pay}} while you're on tour. You also earn {{prize money}} based on your match result, and your sponsor may pay a bonus.",
        "Taxes: about 25% comes out of your income, including prize money and bonuses.",
        "Expenses: you pay for lodging, $30 a day for food, about $60 a day for travel and tournament costs, plus your commute, coaching and treatment.",
        "Punctuality: be at the courts by your deadline. Showing up late costs you your booked court time or a late check-in penalty.",
        "Behavior: umpires can issue a {{code violation}} with a fine for bad conduct.",
        "Bonus: you start with a $100 sponsor bonus pool. Good conduct and results grow it.",
        "All numbers are simplified and fictional. Real prize money and costs vary a lot, and many players outside the top ranks struggle to make a profit."
      ],
      housingTitle: "Where will you stay?",
      housingHelp: "Cheaper lodging means a longer trip to the courts and a higher chance of being late."
    },

    housing: [
      { id: "hostel", name: "Budget hostel across town", cost: 35, late: 0.3, desc: "Cheap, noisy and a long bus ride from the courts." },
      { id: "hotel", name: "Mid-range hotel", cost: 80, late: 0.15, desc: "Decent sleep and a reasonable ride to the courts." },
      { id: "venue", name: "Hotel at the tournament venue", cost: 150, late: 0.04, desc: "A short walk to the courts, but it costs you." }
    ],

    objectives: [
      { text: "Win your first-round match", test: function (s) { return !!s.flags.matchWon; } },
      { text: "Be late no more than once", test: function (s) { return s.lates <= 1; } },
      { text: "Walk onto court with at least 50 Energy", test: function (s) { return (s.flags.matchEnergy || 0) >= 50; } }
    ],

    commute: {
      where: "the courts",
      bossId: "whitfield",
      deadlines: ["8:00 AM", "8:00 AM", "9:30 AM"],
      fees: [60, 60, 150],
      feeLabels: ["Late court booking fee", "Late court booking fee", "Late check-in penalty"],
      flavor: [
        "Tuesday, 6:50 AM. You are booked on Court 3 at 8:00. You slept okay, not great.",
        "Wednesday, 6:50 AM. Yesterday's practice left you sore. Your first-round opponent is on everyone's mind.",
        "Thursday, 7:30 AM. Match day. You must check in at the tournament desk by 9:30. Your match starts at 11:00."
      ],
      options: [
        { text: "Take the tournament shuttle bus", short: "Shuttle fare", cost: 4, mult: 1 },
        { text: "Take a taxi", short: "Taxi", cost: 22, mult: 0.15 },
        { text: "Leave 30 minutes early and stretch on the way", short: "Shuttle fare", cost: 4, mult: 0.15, energy: -3, skill: 1 }
      ],
      lateLines: [
        "The shuttle crawls through traffic. You hustle onto Court 3 at 8:12. The slot was booked for 8:00, so the court fee is yours to pay. Coach Whitfield says nothing, which is worse.",
        "The bus is late and then it's packed. You make it at 8:09, just as another player takes your court. The booking fee still hits your account.",
        "You reach the tournament desk at 9:41, eleven minutes after check-in closed. The official is polite but firm. There's a penalty, and your warm-up time is gone."
      ],
      okLines: [
        "You reach Court 3 at 7:45 and get some extra stretching in. Coach Whitfield nods approvingly.",
        "You arrive at 7:50. A few minutes of calm before a busy day.",
        "You check in at 9:00, plenty early. Your name is on the draw sheet and your nerves are almost under control."
      ]
    },

    evening: [
      "You peel off your shoes at the hotel. Tennis feels glamorous on TV. Behind the scenes, there's a receipt for almost everything. Time to check your numbers.",
      "Another long day. Your body aches, but your head is clear. Here's how your money looks.",
      ""
    ],

    shop: [
      { id: "massage", name: "Physio recovery massage", desc: "Helps your body bounce back. Not cheap, but cheaper than an injury.", cost: 70, daily: true, fx: { energy: 12 } },
      { id: "meal", name: "Big recovery meal at a good restaurant", desc: "Real food instead of vending machine snacks.", cost: 50, daily: true, fx: { energy: 8, skill: 1 } },
      { id: "video", name: "Video analysis subscription", desc: "Study your own matches so you can spot patterns you can't feel on court.", cost: 40, fx: { skill: 6 } },
      { id: "strings", name: "Fresh strings and grip tape", desc: "Small details matter when matches are decided by a few points.", cost: 45, fx: { edge: 0.02 } },
      { id: "dinner", name: "Dinner with Coach Whitfield", desc: "Get to know your coach beyond the court.", cost: 35, daily: true, fx: { rel: { whitfield: 8 } } },
      { id: "sleep", name: "Go to bed early", desc: "Costs nothing and boosts your energy for tomorrow.", cost: 0, daily: true, fx: { energy: 15 } }
    ],

    days: [
      {
        name: "Tuesday",
        scenes: [
          {
            time: "8:15 AM",
            title: "Court 3 with Coach",
            setting: "Riverside Tennis Center. Morning mist is lifting off the courts. The tournament starts Thursday and you play at 11:00 AM.",
            lines: [
              { who: "whitfield", text: "Morning, [name]. First round is Luca Moretti. Big serve, weak backhand. We have two days to get you ready." },
              { who: "whitfield", text: "Before we start, a reminder: at a {{challenger}}, the prize money is modest and we pay for most of this ourselves. Every session has a price." }
            ],
            prompt: "How do you want to practice today?",
            choices: [
              {
                text: "Full session with Coach Whitfield ($100)",
                hint: "Best training, most expensive.",
                reaction: [
                  { who: "you", text: "Let's do the full session. I want every rep to count." },
                  { who: "whitfield", text: "Good. Let's work on your second serve and your return position." }
                ],
                fx: { skill: 10, energy: -12, rel: { whitfield: 6 }, money: [{ label: "Coaching session", amount: -100, cat: "spend" }] }
              },
              {
                text: "Hit with a local hitting partner ($40)",
                hint: "A cheaper option, but he can't coach you.",
                reaction: [
                  { who: "whitfield", text: "That works. Just remember he can hit with you, but he can't tell you what you're doing wrong." }
                ],
                fx: { skill: 6, energy: -10, rel: { whitfield: -2 }, money: [{ label: "Hitting partner", amount: -40, cat: "spend" }] }
              },
              {
                text: "Practice serves alone on a side court (free)",
                hint: "No cost, but slower progress.",
                reaction: [
                  { who: "whitfield", text: "Free is nice. Just don't make it a habit. You'll plateau." }
                ],
                fx: { skill: 3, energy: -6, flags: { soloPractice: true } }
              }
            ]
          },
          {
            time: "1:00 PM",
            title: "A call from your sponsor",
            setting: "You're eating lunch in the players' lounge when your phone buzzes. It's Tara from Apex Sportswear, the company that pays your {{retainer}}.",
            lines: [
              { who: "tara", text: "Hi [name]! We love how you're ranking. Two quick requests: a 30-second social video today, and a fan meet-and-greet tomorrow evening." },
              { who: "tara", text: "Apex pays a $150 content fee for the video. The meet-and-greet is part of your sponsorship duties, so there's no extra fee." }
            ],
            prompt: "How do you respond?",
            choices: [
              {
                text: "Say yes to both.",
                reaction: [
                  { who: "you", text: "Happy to do both. Thanks for thinking of me." },
                  { who: "tara", text: "Wonderful! Apex remembers players who say yes." }
                ],
                fx: { energy: -10, rep: 6, rel: { tara: 8 }, bonus: 200, flags: { didMeetGreet: true }, money: [{ label: "Apex content fee", amount: 150, taxable: true, cat: "income" }] }
              },
              {
                text: "Do the video, politely decline the meet-and-greet to rest.",
                reaction: [
                  { who: "you", text: "I can do the video, but I need to protect my recovery before Thursday." },
                  { who: "tara", text: "Understood. Match first. We'll find another time." }
                ],
                fx: { energy: -5, rep: 2, rel: { tara: 2 }, money: [{ label: "Apex content fee", amount: 150, taxable: true, cat: "income" }] }
              },
              {
                text: "Ask for $250 for the video.",
                hint: "A gamble. It might work, or it might annoy her.",
                run: function (s) {
                  var ok = Math.random() < 0.4 + (s.rel.tara - 45) / 200;
                  if (ok) {
                    return {
                      reaction: [
                        { who: "you", text: "My time is valuable. Could we do $250 for the video?" },
                        { who: "tara", text: "You drive a hard bargain. Okay, $250." }
                      ],
                      fx: { energy: -8, rep: 2, rel: { tara: 2 }, money: [{ label: "Apex content fee (negotiated)", amount: 250, taxable: true, cat: "income" }] }
                    };
                  }
                  return {
                    reaction: [
                      { who: "you", text: "Could we do $250 for the video?" },
                      { who: "tara", text: "$150 is the standard offer for everyone on the roster. Do you want to take it?" },
                      { text: "You take it, but the mood in the call has cooled." }
                    ],
                    fx: { energy: -8, rep: -2, rel: { tara: -4 }, money: [{ label: "Apex content fee", amount: 150, taxable: true, cat: "income" }] }
                  };
                }
              },
              {
                text: "Decline both to focus on training.",
                reaction: [
                  { who: "tara", text: "Okay. Just remember, sponsors are a partnership. They notice when you say no." }
                ],
                fx: { rep: -4, rel: { tara: -6 }, energy: 4 }
              }
            ]
          }
        ]
      },
      {
        name: "Wednesday",
        scenes: [
          {
            time: "9:00 AM",
            title: "A tight shoulder",
            setting: "The training room. Your right shoulder has felt stiff since yesterday's serves.",
            lines: [
              { who: "ben", text: "I'm Ben, the tournament {{physio}}. Your shoulder's tight. How long has that been bothering you?" },
              { who: "you", text: "Since the end of yesterday's session. It's not terrible." },
              { who: "ben", text: "Small problems become big ones when you play through them. Your call, though." }
            ],
            prompt: "What do you do?",
            choices: [
              {
                text: "Book a 45-minute physio session ($80)",
                hint: "Costs money and time, protects your arm.",
                reaction: [
                  { who: "ben", text: "Smart. Pros treat small problems early." }
                ],
                fx: { energy: 4, rel: { ben: 8 }, flags: { treated: true }, money: [{ label: "Physio session", amount: -80, cat: "spend" }] }
              },
              {
                text: "Warm up carefully and skip treatment.",
                hint: "Free, but there's a chance it flares up.",
                run: function (s) {
                  if (Math.random() < 0.4) {
                    return {
                      reaction: [{ text: "Your shoulder grabs on a serve. You shake it out, but it keeps nagging you for the rest of the day." }],
                      fx: { energy: -15, rel: { ben: -2 }, flags: { shoulderFlare: true } }
                    };
                  }
                  return {
                    reaction: [{ text: "You warm up carefully and the shoulder loosens. Lucky this time." }],
                    fx: { energy: -2 }
                  };
                }
              },
              {
                text: "Push through at full intensity. You can't afford to lose practice time.",
                hint: "High risk, high reward.",
                run: function (s) {
                  if (Math.random() < 0.55) {
                    return {
                      reaction: [
                        { text: "On your third serve, something pinches. You stop and call Ben back over." },
                        { who: "ben", text: "This is the sort of thing I was worried about. You need a scan and treatment today." }
                      ],
                      fx: { energy: -20, rel: { ben: -4 }, flags: { shoulderFlare: true }, money: [{ label: "Emergency physio and scan", amount: -250, cat: "spend" }] }
                    };
                  }
                  return {
                    reaction: [{ text: "You grit your teeth and hit hard for ninety minutes. The shoulder holds up, and your serve has never felt better." }],
                    fx: { skill: 6, energy: -10 }
                  };
                }
              }
            ]
          },
          {
            time: "2:00 PM",
            title: "Scouting Luca",
            setting: "Coach Whitfield has a laptop open in the players' lounge with video of Luca Moretti.",
            lines: [
              { who: "whitfield", text: "Here's the {{scouting report}} on Luca. His first serve is huge, but if you get it back deep, he gets nervous. His backhand breaks down under pressure." },
              { who: "whitfield", text: "We have to choose a game plan. You can't do everything." }
            ],
            prompt: "What's your game plan?",
            choices: [
              {
                text: "Attack his backhand relentlessly.",
                reaction: [
                  { who: "you", text: "I'll pin him in the backhand corner and make him prove he can hit through it." },
                  { who: "whitfield", text: "Aggressive. If you execute, it works. If you miss, you hand him free points." }
                ],
                fx: { skill: 4, edge: 0.04, rel: { whitfield: 4 }, flags: { plan: "backhand" } }
              },
              {
                text: "Neutralize his serve. Block returns deep and stay in rallies.",
                reaction: [
                  { who: "you", text: "I'll make him play every point. If I can neutralize the serve, the match changes." },
                  { who: "whitfield", text: "Patient and smart. It will test your legs, so keep your energy up." }
                ],
                fx: { skill: 4, edge: 0.05, energy: -4, rel: { whitfield: 4 }, flags: { plan: "return" } }
              },
              {
                text: "Play your usual game. No special plan.",
                reaction: [
                  { who: "whitfield", text: "Alright. Just be careful. Opponents who prepare for you will have the edge." }
                ],
                fx: { rel: { whitfield: -3 } }
              }
            ]
          },
          {
            time: "4:00 PM",
            title: "A broken string",
            setting: "Late practice. A loud snap, and your main racquet's strings go slack.",
            lines: [
              { text: "The restringing service closes in twenty minutes. You have a backup racquet in your bag, but it's older and feels different." }
            ],
            prompt: "What do you do?",
            choices: [
              {
                text: "Pay for a rush restring ($35)",
                reaction: [{ text: "You race to the stringers. The racquet is ready in time. You're out $35, but it feels like yours again." }],
                fx: { money: [{ label: "Rush restring", amount: -35, cat: "spend" }] }
              },
              {
                text: "Use the backup racquet.",
                reaction: [{ text: "The backup works fine in practice, but you don't quite trust it. You'll have to decide if you play with it on Thursday." }],
                fx: { edge: -0.02, flags: { backupRacquet: true } }
              }
            ]
          }
        ]
      },
      {
        name: "Thursday",
        scenes: [
          {
            time: "9:45 AM",
            title: "Warm-up",
            setting: "The practice courts behind the main stadium. Fans are arriving. Across the net you can see Luca Moretti hitting serves that make a loud thwack.",
            lines: [
              { who: "ben", text: "How's the body feeling this morning?" },
              { who: "whitfield", text: "You've done the work. Now it's about routine. What's your last hour look like?" }
            ],
            prompt: "How do you prepare in the last hour before your match?",
            choices: [
              {
                text: "Full routine: dynamic warm-up, breathing and visualizing your first serve.",
                reaction: [
                  { who: "whitfield", text: "That's what pros do. Same routine every time, and your body knows what's coming." }
                ],
                fx: { energy: -4, edge: 0.04, rel: { whitfield: 4 } }
              },
              {
                text: "Short warm-up, then headphones and quiet.",
                reaction: [{ text: "You keep it simple. You feel loose but not fully switched on." }],
                fx: { energy: -1, edge: 0.02 }
              },
              {
                text: "Scroll your phone and check other results.",
                reaction: [
                  { text: "Another player's upset win makes your stomach tighten. You put the phone away but the nerves are already in." }
                ],
                fx: { edge: -0.03, rep: -1 }
              }
            ]
          },
          {
            time: "11:20 AM",
            title: "Down a break",
            enter: function (s) { s.flags.matchEnergy = s.energy; },
            setting: "Court 2. The first set is going badly. Luca has broken your serve and leads 5-4. Your shoulder and your nerves both feel tight.",
            lines: [
              { text: "Luca is serving for the set. You've just lost a long rally and your racquet is shaking in your hand." },
              { text: "This is a {{break point}}-type moment, and one of the first big tests of your match." }
            ],
            prompt: "How do you respond?",
            choices: [
              {
                text: "Take a breath, reset, and focus only on the next point.",
                reaction: [
                  { who: "you", text: "One point. Just this point." },
                  { text: "You settle into your routine. The first serve goes in. It's still tight, but you're hanging in." }
                ],
                fx: { edge: 0.05, energy: -3 }
              },
              {
                text: "Swing bigger and go for winners.",
                hint: "High risk, high reward.",
                run: function () {
                  if (Math.random() < 0.4) {
                    return {
                      reaction: [{ text: "Two clean winners in a row. The crowd murmurs. Luca frowns." }],
                      fx: { edge: 0.06, energy: -4 }
                    };
                  }
                  return {
                    reaction: [{ text: "Three errors in a row. Unforced mistakes hand Luca the set." }],
                    fx: { edge: -0.04, energy: -5 }
                  };
                }
              },
              {
                text: "Smash your racquet in frustration.",
                reaction: [
                  { text: "The racquet crunches on the court. The umpire raises a hand." },
                  { text: "A {{code violation}} costs you a fine and a warning. Sponsors don't like seeing that either." }
                ],
                fx: { edge: -0.02, rep: -8, bonus: -150, rel: { tara: -5 }, money: [{ label: "Code violation fine", amount: -500, cat: "penalty" }] }
              }
            ]
          },
          {
            time: "1:00 PM",
            title: "The deciding moments",
            setting: "The match is level. A final-set {{tiebreak}} is coming. Your legs are heavy and your head is clear.",
            lines: [
              { text: "The stadium has gone quiet. Coach Whitfield is watching from the box. This is what the last two days were about." }
            ],
            prompt: "What's your approach?",
            choices: [
              {
                text: "Play safe: make him hit one more ball.",
                hint: "Works best when your energy is high.",
                run: function (s) {
                  var good = s.energy >= 45;
                  return {
                    reaction: [{ text: good ? "Rally after rally, Luca blinks first. Your legs hold up." : "Your legs are gassed. The long rallies are no longer your friend." }],
                    fx: { edge: good ? 0.04 : -0.03, energy: -5 }
                  };
                }
              },
              {
                text: "Serve and attack the net.",
                hint: "Works best when your game is sharp.",
                run: function (s) {
                  var good = s.skill >= 60;
                  return {
                    reaction: [{ text: good ? "Your volleys are crisp. Luca can't find his rhythm." : "A couple of shaky volleys give Luca the points he needs." }],
                    fx: { edge: good ? 0.04 : -0.03, energy: -3 }
                  };
                }
              },
              {
                text: "Stick to the plan you made with Coach yesterday.",
                run: function (s) {
                  var has = !!s.flags.plan;
                  return {
                    reaction: [{ text: has ? "You trust the plan. Coach Whitfield nods in the box. Every point feels familiar." : "You reach for a plan and find nothing there. You're improvising at the worst time." }],
                    fx: { edge: has ? 0.05 : -0.02 }
                  };
                }
              }
            ]
          }
        ]
      }
    ],

    finale: function (s) {
      var p = clamp(0.22 + s.skill * 0.003 + s.energy * 0.0025 + s.edge, 0.1, 0.88);
      if (s.flags.shoulderFlare) p -= 0.05;
      if (s.flags.backupRacquet) p -= 0.01;
      p = clamp(p, 0.1, 0.88);
      var win = Math.random() < p;
      var lines = [
        { text: "Going into the last points, your preparation gave you roughly a " + Math.round(p * 100) + "% chance of winning. That's what training, rest, planning and choices add up to." }
      ];
      var fx = { money: [], rel: {} };

      if (win) {
        lines.push({ text: "Match point. You hit your first serve down the T. Luca's return floats long. You've done it." });
        lines.push({ who: "whitfield", text: "That's what I'm talking about. Two days of preparation, and look at you." });
        lines.push({ who: "tara", text: "Congratulations! Apex is thrilled. Your sponsor bonus is coming through." });
        fx.money.push({ label: "Prize money (first-round win, before taxes)", amount: 1600, taxable: true, cat: "income" });
        fx.rep = 10;
        fx.rel.whitfield = 6;
        fx.rel.tara = 6;
      } else {
        lines.push({ text: "On the last point, Luca's serve is too good. The match is over. You shake hands at the net." });
        lines.push({ who: "luca", text: "Good match. You made me work for it." });
        lines.push({ who: "whitfield", text: "That one hurts. But look at where you started the week and where you ended. We learn, and we go again." });
        fx.money.push({ label: "Prize money (first-round loss, before taxes)", amount: 450, taxable: true, cat: "income" });
        fx.rep = -2;
      }

      var bonusFinal = Math.max(0, s.bonus + (win ? 500 : 0) + (s.rep >= 70 ? 200 : 0));
      if (bonusFinal > 0) {
        fx.money.push({ label: "Sponsor bonus (before taxes)", amount: bonusFinal, taxable: true, cat: "income" });
        lines.push({ text: "Your sponsor bonus pool finished at " + fmt(bonusFinal) + "." });
      }
      s.flags.matchWon = win;
      s.flags.winProb = p;

      return {
        time: "Match result",
        title: win ? "Victory" : "Defeat",
        setting: "Court 2, Riverside Tennis Center.",
        lines: lines,
        fx: fx
      };
    },

    review: function (s) {
      var rels = ["whitfield", "ben", "tara"].map(function (k) { return s.rel[k]; });
      var avg = rels.reduce(function (a, b) { return a + b; }, 0) / rels.length;
      var score = Math.round(0.35 * s.skill + 0.25 * s.rep + 0.2 * avg + 0.2 * s.energy) - 5 * s.lates + (s.flags.matchWon ? 12 : 0);
      score = Math.max(0, Math.min(100, score));
      var lines;
      if (score >= 80) {
        lines = [
          { who: "whitfield", text: "[name], that was a professional week from start to finish. You managed your body, your budget and your nerves. I'd follow that example." },
          { who: "tara", text: "Apex loves what we saw. Let's talk about next year." }
        ];
      } else if (score >= 60) {
        lines = [
          { who: "whitfield", text: "A solid week, [name]. You have the tools. Now we sharpen them." },
          { who: "tara", text: "We're still in your corner. Keep showing up the way you did this week." }
        ];
      } else if (score >= 40) {
        lines = [
          { who: "whitfield", text: "Mixed week, [name]. There were good moments and some avoidable ones. Let's review where the money and energy went." }
        ];
      } else {
        lines = [
          { who: "whitfield", text: "[name], tough week. Pro tennis is unforgiving, and it's okay to find that out. The question is what you want to do with it." }
        ];
      }
      return { score: score, lines: lines };
    },

    reality: "The sim's numbers are fictional, but the pattern is real. Many players outside the very top spend years earning less than they spend on travel, coaching and treatment, and only a small share ever make a living from prize money. The days are mostly repetition, recovery and mental work, not highlights. If you loved the discipline and the daily improvement, there are related careers like coaching, sports medicine, sports management and sports psychology."
  };
})();
