export interface App {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  thumbnailUrl: string;
  screenshotUrls: string[];
  techStack: string[];
  category: string;
  status: 'live' | 'beta' | 'development';
  outcomes: string[];
  buildDate: string;
  hasFullBreakdown: boolean;
  buildPlanAvailable: boolean;
  liveUrl?: string;
  /**
   * Games only: how to play, in a player's words, shown on the game's page in
   * place of the build notes. `on` is what it plays on; each way to play it
   * (touch or a mouse, the keyboard, a controller) lists the things you do and
   * how you do each one. In `how`, a key or controller button goes in
   * backticks (`Space`) and the page draws it as a keycap.
   */
  howToPlay?: {
    on: string;
    ways: { device: string; controls: { action: string; how: string }[] }[];
  };
}

export const apps: App[] = [
  {
    slug: 'samurai-kitchen',
    name: 'Samurai Kitchen',
    description:
      "A food truck's website, where customers order and pay online.",
    longDescription:
      "The ordering site for Samurai Kitchen, a Japanese food truck and catering business, live on its own domain since August 2026. The menu, prices, opening hours and sold-out items all come straight from the owner's Square account — the same system his kiosk runs on — so nothing on the site can go stale. Customers build a cart with the truck's own customisations, pick a pickup time drawn from the live hours, and pay through Square; checkout locks when the truck is closed and stops taking orders half an hour before it shuts. The owner connected his own Square account through OAuth, so no access key ever changed hands, and the catering section takes inquiries for events.",
    thumbnailUrl: '/images/apps/samurai-kitchen-thumbnail.png',
    screenshotUrls: [
      '/images/apps/samurai-kitchen-1.webp',
      '/images/apps/samurai-kitchen-2.png',
      '/images/apps/samurai-kitchen-3.png',
    ],
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Square API',
      'Neon Postgres',
      'Tailwind CSS',
    ],
    category: 'Commerce',
    status: 'live',
    outcomes: [
      "Live since August 2026 — real orders and real payments on the truck's own domain",
      "Menu, prices, hours and sold-outs read live from the owner's Square account, refreshed every minute",
      'Checkout locks outside opening hours and stops 30 minutes before close; scheduled pickups hold until due',
      'Owner connected his own Square account via OAuth — tokens encrypted at rest, renewed automatically',
    ],
    buildDate: '2025-02',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://samuraikitchencatering.com',
  },
  {
    slug: 'pomodoro-timer',
    name: "Patch's Pomodoro",
    description:
      'A pomodoro timer in Patch’s room above a neon city. Wind the tomato to start, watch it ripen while you work, and lock each distraction in a jar.',
    longDescription:
      'You work in the room of Patch, the hacker from the Neo Dojo Cast, high above a neon city. The sky outside follows your real clock from dawn to night, some days it rains, and lo-fi plays on her radio. The timer is a wind-up kitchen tomato: drag its band round to set the minutes and let go to start it. While you work it ripens from green to red and Patch types away at her screens. When it rings she cheers, and the ripe tomato is picked and grows on her windowsill plant, so the plant shows what you got done today. When something pulls you away, tap Distracted? and name the rogue that tried it: a shiny new thing, fake urgency, something that broke, someone else’s request, the scroll, or someday. Patch zaps it into a quarantine jar, you can leave yourself a note for later, and you carry on. On a break you can look out the window, breathe with her, stretch with her, or squash bugs for 45 seconds. You earn embroidered patches for her hoodie along the way, and your week is written up as a changelog. The room answers when you tap it: the window changes the weather, the radio changes the station, and Patch talks back. It works offline, installs like an app, and everything you log stays on your own device.',
    thumbnailUrl: '/images/apps/pomodoro-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/pomodoro-1.webp',
      '/images/apps/pomodoro-2.webp',
      '/images/apps/pomodoro-3.webp',
    ],
    techStack: [
      'HTML5',
      'Canvas',
      'Vanilla JavaScript',
      'Web Audio API',
      'PWA',
    ],
    category: 'Productivity',
    status: 'live',
    outcomes: [
      'The tomato ripens from green to red as the minutes run down, and every one you finish is picked and grows on Patch’s windowsill plant.',
      'The six rogues of the Neo Dojo Cast stand for six kinds of distraction. Naming the one that got you puts it in a jar for later, and the changelog shows which one gets you most.',
      'It is built for an old, slow phone: no framework, no libraries, and the room is drawn once and reused. In a test with the processor slowed six times, a return visit had the timer on screen in under half a second.',
      'Six AI agents built it side by side from one written contract, each owning one part: the timer and its records, the sound, Patch, her room, the tomato and its breaks, and the menus.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-pomodoro-blush.vercel.app',
  },
  {
    slug: 'spacex-mars',
    name: 'Earth–Mars Transfer Simulation',
    description:
      'Shows the path a spacecraft takes from Earth to Mars. You can change the settings and watch the trip play out.',
    longDescription:
      'Earth and Mars are only close enough for a trip every couple of years, and the route between them is a long curve rather than a straight line. This shows both. The planets move at their real speeds and distances, worked out from real orbital calculations rather than drawn by hand, so a launch only becomes possible when the two planets line up properly. You can speed the clock up or slow it down, zoom in and out, turn the orbit lines on and off, and click a planet to see where it is and how fast it is going. A log lists every launch, journey and arrival as they happen.',
    thumbnailUrl: '/images/apps/spacex-mars-thumbnail.png',
    screenshotUrls: [
      '/images/apps/spacex-mars-1.png',
      '/images/apps/spacex-mars-2.png',
      '/images/apps/spacex-mars-3.png',
    ],
    techStack: [
      'HTML5 Canvas',
      'Vanilla JavaScript',
      'CSS3',
      'Orbital Mechanics',
    ],
    category: 'Simulation',
    status: 'live',
    outcomes: [
      'The planets move at their true speeds and distances, so a launch only becomes possible when they line up, the same as in real life.',
      'You can speed the clock up, slow it down, zoom in and out, and click a planet to see where it is and how fast it is going.',
      'A log lists every launch, every journey and every arrival as they happen.',
      'The planet surfaces are drawn by the page rather than photographed, and it works with a mouse or a finger.',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-spacex-mars.vercel.app',
  },
  {
    slug: 'cloth-simulator',
    name: 'Cloth Simulator',
    description:
      'Real cloth you can grab, cut with a katana, burn, pin and stain with ink, in six scenes lit like a film set. Fire, rain and wind all act on it.',
    longDescription:
      'A sheet of cloth you can do almost anything to. Grab it, slice it with a katana, set it alight, pin it down or let ink bleed through it, across six scenes, from a shop curtain at dusk to banners in a gale. Make it rain and it soaks, sags and drips. Then turn it into silk, denim, velvet or chainmail and see what changes.',
    thumbnailUrl: '/images/apps/cloth-simulator-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/cloth-simulator-1.webp',
      '/images/apps/cloth-simulator-2.webp',
      '/images/apps/cloth-simulator-3.webp',
    ],
    techStack: ['WebGL', 'GLSL', 'Vanilla JavaScript', 'Web Audio API', 'Physics Engine'],
    category: 'Simulation',
    status: 'live',
    outcomes: [
      'The cloth is not an animation. A physics solver works out every thread hundreds of times a second, so it sags, swings, tears along the weave, and comes to rest when you leave it alone.',
      'Fire, rain, ink and wind act on each other. Wet cloth gets heavy and won’t burn, ink spreads faster through a soaked weave, and wind fans a flame.',
      'It is built for an old, slow phone: no game engine and no libraries, one 426 KB file. It measures its own frames and lowers its quality until it holds 60 a second. With the processor slowed four times, an average frame takes 4 to 6 milliseconds of the 16.7 it has.',
      'Eight AI agents built it side by side from one written contract, each owning one part: the physics, the look of the fabric, fire, weather, sparks and glow, the six scenes, the sound, and the controls.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-cloth-simulator.vercel.app',
    howToPlay: {
      on: 'Plays on a phone or a computer. On a phone, use up to five fingers at once.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            {
              action: 'Pick a tool',
              how: 'Tap Grab, Slice, Burn, Pin or Dye.',
            },
            {
              action: 'Grab',
              how: 'Pull it. Every finger grabs its own patch.',
            },
            {
              action: 'Slice',
              how: 'Swipe through it. A long, fast cut slows time.',
            },
            {
              action: 'Burn',
              how: 'Tap to light it. Hold to keep the flame on it.',
            },
            {
              action: 'Pin',
              how: 'Tap to pin. Drag a point and let go to pin it there.',
            },
            {
              action: 'Dye',
              how: 'Touch to drop ink. Drag to lay a line of it.',
            },
            { action: 'Weather', how: 'Tap the wind or rain button.' },
            {
              action: 'Tilt',
              how: 'On a phone, turn on Tilt and gravity follows your phone.',
            },
          ],
        },
        {
          device: 'Keyboard',
          controls: [
            {
              action: 'Tools',
              how: '`1` to `5` (Grab, Slice, Burn, Pin, Dye)',
            },
            { action: 'Scene', how: '`[` and `]`' },
            { action: 'Material', how: '`M`' },
            { action: 'Wind', how: '`W`' },
            { action: 'Slow motion', how: '`Space`' },
            { action: 'Reset', how: '`R`' },
          ],
        },
      ],
    },
  },
  {
    slug: 'tether-ball',
    name: 'Tether Ball',
    description:
      'A demo: tether ball on a school playground against the kids from my story King of the Pole, each throwing the special they throw in the story. Swipe up on your half and your fighter flash-steps in to hit it, winding the rope your way first.',
    longDescription:
      'A ball hangs on a rope from a pole on a school playground, and the court painted round it is split down the middle. You play one half and the computer plays the other. You each wind the rope your own way by hitting the ball away from you on your half, so a swipe up is all it takes. You get one hit each time the ball comes round to your side, and so does the computer. The swipe is still yours: the moment it hits the ball, your fighter flash-steps onto it, a dash along the floor or a leap for a high one, with afterimages strung back to where they stood, then flashes back to their spot. How fast you swipe and where you catch the ball, dead centre or a glancing blow, decide how hard it flies, and every hit freezes time for a beat before it whips back to speed. The rope wraps round the pole as the ball circles, the orbit shrinks and speeds up, and the first to wind it all the way up takes the round. It opens on a start menu with Play, a quick match against Milo, and the Arcade. In the Arcade you pick who you play as, you or one of eleven kids from King of the Pole, the story I wrote for this playground, and then you play everyone you meet in the story, one match each, in the order you meet them: Milo first, as he is the day you meet him, then each of the others as they are the last time you face them, up to Yuji with his Double Dragon and, last of all, Rei the champion with her Ray of Light. Yuji and Rei can’t be picked to play as: they are there to be beaten. Every match starts on a versus screen, the two of you slamming in from either side and VS slamming down between you. Each kid throws the special they throw in the story, plays at their own level, waits the way they would (Akira bouncing on his toes with his fists up, Shin with his hands in his hoodie pocket, Rei with one hand behind her back) and talks the way they do. The new kid in the story is you, and nobody draws you. You make them in the character creator, with 37 haircuts from an afro to cornrows to a bowl cut, 16 skin tones, 19 hair colours, eyes, brows and mouths, six tops from a gi to a hoodie, 21 extras from caps to headphones, and a name, every choice drawn as you. Unless you pick someone else, you play as yourself. The start menu plays a hip-hop song about becoming King of the Pole, made with ElevenLabs Music from my prompt (piano and violin over a hard beat, a rapper on the verses and a singer on the chorus), which wrote the words too. Winning a round is a show, and everyone has their own. The winner steps out to the front of their half, does their own victory move, then powers up in their own colour until it goes off in a pillar of light and a shockwave, and celebrates their own way: Big Ben flexes and stomps the ground, Marcus bows to a crowd that isn’t there, Akira shadowboxes, Mei taps her temple and points at you, and the tough ones, Rei, Yuji, Harper, Adaeze and Quan, just keep powering up and looking at you. The loser drops to their knees under a cloud of gloom. The score and the round’s numbers are painted into the background, behind the players. Win the match and it goes further: a second power-up in the air, fireworks, confetti and a fanfare. The computer reads the ball, runs to meet it and leaps for the high ones, talking as it goes. Every hit you make fills your energy bar, and every hit your opponent makes fills theirs: seven hits fill a bar, and an opponent past level 10 needs only six. A full bar is a special, and specials grow with the level too, drawn small against a beginner and huge at the top. Tap the big lightning button in the top corner and your next hit is the special: it answers the moment your finger lands, even mid-swipe or with a second finger. Or swipe in a counter-clockwise curve: the moment your swing has curved enough, your trail burns blue, and that hit is the special. Six of the specials change what the ball does for that turn: a swerve that cuts in toward the pole instead of going round, a spike that flies straight at the other player the moment it leaves the hand and knocks them down, a phantom you can only follow by its shadow, decoys where only the real ball has the rope, a slip that slides off the first touch, and a warp that blinks out as it reaches them and can’t be touched for a split second. Four knock the other player off their feet: a lightning zap that leaps from the ball, a whirlwind that chases them down, a stomp that shakes the screen and the ground and rolls a shockwave across the court, and a power-up that sets the thrower on fire and goes off in a ring of flame that throws them down. Milo’s brings lightning down on the ball and Adaeze’s Shadow Cut crosses it with two shadow blades, and either one hits harder and makes the next touch heavy. And two are bigger. Double Dragon strikes twice in one turn, both in slow motion: the first looks like any hit, then before the ball has gone anywhere you rush in and hit it again, and that second hit lets loose a pair of fire dragons that coil round the ball and burn whatever they pass through for two turns. Ray of Light marks them with a ring of light and brings a giant sunbeam down on them out of the sky, while the ball shines like a small sun. Go six hits back and forth, three each, without a miss, and the ball catches fire. That fire volley burns until one of you lets a ball go by, and whoever hit it last wins a fireball. Tap the flame beside your special button, or swipe in a clockwise curve, to throw it. Yuji’s is a single dragon instead, and Rei’s a beam of light that flies straight at you and shocks you twice. Try to hit a fireball back and you get knocked down in flames, and you are slow for a turn after that. Let it go by and it goes out. The menu also has Graphics (Low, Medium or High for an older phone, or Auto) and a solo time trial. On the court plays an epic violin and piano soundtrack made with ElevenLabs Music. It swells in with your first tap, loops for as long as you play, and muffles when time slows, so a big hit cuts through. The court sits on a school blacktop with four-square and hopscotch painted round it and a brick school wall behind, all drawn by the game itself.',
    thumbnailUrl: '/images/apps/tether-ball-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/tether-ball-1.webp',
      '/images/apps/tether-ball-2.webp',
      '/images/apps/tether-ball-3.webp',
    ],
    techStack: ['HTML5', 'Canvas 2D', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'beta',
    outcomes: [
      'The ball is a real physical thing on a rope, not an animation: it swings like a pendulum, and the rope wraps around the pole and shortens as it goes.',
      'The computer plays by the same rules as your finger. To decide where to swing, it runs the game’s own physics 1.2 seconds ahead, then has to get there on its own feet, with a reaction delay after each of your hits.',
      'Your fighter is drawn, not simulated. The hit is your swipe’s, and they land beside the ball in that same frame with a fist on it, so the camera sees the contact. The flash plays out inside the hit’s freeze, which holds them in the strike with the ball.',
      'Each opponent’s level is a set of real numbers, not tricks: a harder one reacts faster, runs and jumps further and misses less.',
      'Levels run to 20, and levels 1 to 10 play exactly as they did. I played at 10 and kept beating the computer the same two ways, so I had them measured: a simulated player that sends every ball back hard showed that a ball hit just before the centre line reached the computer before it could read the hit and leap for it, and that right after its own swing it was stuck in its follow-through. At 10 it returned 28 % of the quick balls and 46 % of the rally ones. Levels 11 to 20 carry every number on past 10, and by 15 those are 81 % and 93 %.',
      'The specials were balanced by simulation, not by feel. A scripted player went hundreds of rounds against the computer with and without them. The first version handed whoever used them a 20 to 30 point swing in win rate. The shipped one leaves the match where it was when both of you use them.',
      'The fire was balanced the same way, and the simulation caught a design mistake. The first fire burned for a few seconds whatever happened, so letting it go by cost more rope than getting burned, and the smart play was to take the burn. Now a fireball threatens one return and goes out once it is past. Earning one takes six answered hits in a row, about one round in four against the computer at level 5, and with fireballs in play the scripted player’s win rate moves about 7 points.',
      'The supers fool the computer the way they would fool a person. It reads the ball by running the game’s physics ahead, and a swerve’s cut toward the pole is a force that physics never sees, so it reads the round arc and reaches for a ball that isn’t coming. It can’t read a phantom until it is close, and with decoys it chases the one it picked until its swing goes through it.',
      'The knockdown specials were the strongest yet in the simulation. A player knocked off their feet returned almost nothing, and the computer’s whirlwind moved the scripted player’s win rate 17 points. Shorter knockdowns fixed most of it. For the zap, what fixed it was the ball’s speed after the bolt: the ball was gone before the computer got up, however short its fall.',
      'The music is two ElevenLabs Music tracks: an epic violin and piano piece on the court, one of four takes of one prompt, and the King of the Pole song on the start menu, one of five versions. Each is cut into its own loop with the seam crossfaded into the file itself, so the loop never jumps. The song plays all the way through once before it loops from a verse, and a track is only downloaded when you are about to hear it.',
      'There is no results card. The end of a round plays out on the court in about three seconds, four for a match, with the numbers painted behind the players, and a tap skips it. The loser is thrown out to the front of their half by the finish, because at the end of a rally they were often standing behind the pole, where you couldn’t see them lose.',
      'The big specials’ sounds are ElevenLabs sound effects, seven kept out of 28 takes by measuring them, not by ear. The Light Beam’s two shocks on screen land on the two shocks in its sound, 0.84 and 1.36 seconds in.',
      'Every kid from the story is drawn by the same code that draws its cast sheet, so the game and the sheet can’t drift apart. That code got a game mode that splits each drawing into the layers the game animates (the body, and the head in five faces: open, blinking, fierce, happy and sad) and leaves the arms and legs to the game’s rig. The sheet still draws exactly as it did, checked pixel for pixel. A kid costs no more per frame than the ninjas the game started with, and Low graphics take about a third of High’s work.',
      'One page with no game engine and no libraries, and its music in a second file that arrives once you are already playing.',
      'The Arcade’s order is the story’s, not the levels’. The first cut ranked everyone by level, and that was wrong: I set some characters’ levels higher because the way they play makes them easier to beat, so a level isn’t how hard someone is. The story already climbs, so the Arcade follows it, and changing a level in the version I work in changes how someone plays, never where they come.',
      'This page is the version for players. It is built from the same code as the version I work in, which has a settings panel for every number in the game, so a fix lands in both and the two can’t drift apart.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/tether-ball',
  },
  {
    slug: 'ai-diary',
    name: 'AI Diary',
    description:
      'A private journal. It tracks your mood over time and has a companion you can talk to about what you wrote.',
    longDescription:
      'Write about your day the way you would in any notebook. The app reads it back and shows you things you would not spot yourself: how your mood moves over the weeks, which subjects keep coming up, and how your writing changes. There is also a companion you can talk to about an entry, and it can pull out the things you said you would do and turn them into a list. Everything you write is kept on your own device rather than on a server.',
    thumbnailUrl: '/images/apps/ai-diary-thumbnail.png',
    screenshotUrls: [
      '/images/apps/ai-diary-1.png',
      '/images/apps/ai-diary-2.png',
      '/images/apps/ai-diary-3.png',
    ],
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'OpenRouter API',
      'Zod',
    ],
    category: 'Productivity',
    status: 'live',
    outcomes: [
      'A companion you can talk to about an entry. It can also pull out the things you said you would do and turn them into a list.',
      'A mood line across your entries shows how you have been over weeks, not just today.',
      'It builds a picture of your personality from your writing, using the five traits psychologists commonly measure.',
      'Everything you write is kept on your own device rather than on a server.',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-ai-diary.vercel.app',
  },
  {
    slug: 'portfolio-ledger',
    name: 'Portfolio Ledger',
    description:
      'The net-worth tracker I use for my own money. The copy here runs on a made-up portfolio, so you can try every screen.',
    longDescription:
      'I built this to keep track of my own money: every account, every holding, the cash and everything else I own, added up into one net worth. The copy on this site runs on a made-up portfolio, so none of the numbers are mine, and nothing you change is saved. The home screen shows today’s total, how much it moved and a map of every holding, sized by what it’s worth. Trends lets you drag back through a year and a half of history and watch the figure change under your finger. Plan projects the next thirty years and gives the odds of reaching a target. Patch, the hacker from the Neo Dojo Cast, says what changed in plain words. My own copy fills itself from a private GitHub repo, and every evening a scheduled script prices everything and saves the day’s total.',
    thumbnailUrl: '/images/apps/portfolio-ledger-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/portfolio-ledger-1.webp',
      '/images/apps/portfolio-ledger-2.webp',
      '/images/apps/portfolio-ledger-3.webp',
    ],
    techStack: [
      'Vanilla JavaScript',
      'SVG',
      'CSS3',
      'esbuild',
      'GitHub API',
      'GitHub Actions',
    ],
    category: 'Finance',
    status: 'live',
    outcomes: [
      'Drag across the history chart to go back to any day in the last year and a half. The total, the change and the mix all follow your finger.',
      'Plan runs 400 versions of the next thirty years and shows the odds of reaching a target by each year. Lab replays crashes like 2008 and 2020 against the portfolio.',
      'The whole app is one file with no server behind it. In a test that slowed the processor six times over, like an old phone, the first screen still showed in about a second.',
      'One tap hides every dollar amount, so a screenshot never gives the numbers away.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/demo/portfolio-ledger',
  },
  {
    slug: 'broom-blade',
    name: 'Broom & Blade',
    description:
      'Household chores turned into a game. Chores become quests that pay points and gold, and everyone in the family has their own character.',
    longDescription:
      'Built for my household: a candlelit guild hall where the chores hang as parchment quest slips on a board. Completing one pays XP and gold — XP climbs the hero through titles from Dust Squire to Legend of the Loom, gold buys avatar gear in the Armory, and every piece of gear carries a hidden flavor line and origin tale you can only read once you own it. Each family member runs their own hero on the same board; a Tourney Board compares the party on a radar crest and ranked duel bars, and a Skill Grove grows a glowing rune for every chore you master. Sealing a quest takes a held press, not a tap, so a scroll can never claim one by accident. Clear every daily quest and a hooded merchant offers three mystery boxes — a fortune, a gift, or a curse — and every fifth clean-sweep day he bows with a choice: a purse of gold, or a box holding one of thirty relics that cannot be bought, from a booger to Mjölnir. It ships as one HTML file with zero dependencies, installs to the home screen as a PWA, and synthesizes every sound with the Web Audio API.',
    thumbnailUrl: '/images/apps/broom-blade-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/broom-blade-1.webp',
      '/images/apps/broom-blade-2.webp',
      '/images/apps/broom-blade-3.webp',
    ],
    techStack: ['HTML5', 'Vanilla JavaScript', 'CSS3', 'SVG', 'Web Audio API'],
    category: 'Productivity',
    status: 'live',
    outcomes: [
      'Chores become quests with XP, gold, titles, and per-chore skill ranks — a full progression loop in a single HTML file',
      'Hold-to-seal completion and a password-gated reset make it safe in a kid\u2019s hands without an approval queue',
      'Every one of 67 items carries hidden flavor text and an origin tale, revealed only once earned',
      'A nightly mystery-box chance and a five-day clean-sweep milestone turn a finished board into a ritual worth keeping',
    ],
    buildDate: '2026-08',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://broom-blade.vercel.app',
  },
  {
    slug: 'lantern-night',
    name: "Kiru's Lantern Night",
    description:
      'Kiru throws spirit flames into festival lanterns on a moonlit rooftop. Every lantern you light bursts into fireworks on the beat of the music.',
    longDescription:
      'It’s festival night, and every lantern on the rooftops has gone dark. Kiru has thirty spirit flames to light them again. Drop a flame into a lantern and it bursts into fireworks right on the beat, and the band plays fuller with every lantern you light in a row. Light a whole rope and watch it float up into the night sky.',
    thumbnailUrl: '/images/apps/lantern-night-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/lantern-night-1.webp',
      '/images/apps/lantern-night-2.webp',
      '/images/apps/lantern-night-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Every lantern you light sets off fireworks in time with the music, and lighting a whole rope sends it up into the sky.',
      'The music builds as you play well, from a koto and a soft drum up to the full festival band, and all of it is made by the game as you play.',
      'It plays properly on a phone held either way up and on a computer, with touch, a mouse, the keyboard or a game controller.',
      'Eight AI agents built it side by side, each owning one part of the game. Two more went over their work and caught 13 bugs and 12 things that looked wrong before it went live.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/lantern-night',
    howToPlay: {
      on: 'Plays on a phone held either way up, or on a computer.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            {
              action: 'Throw a flame',
              how: 'Drag up and let go. The direction aims it, and the longer the drag, the farther it flies.',
            },
          ],
        },
        {
          device: 'Keyboard',
          controls: [
            { action: 'Aim', how: '`←` `→` or `A` `D`' },
            {
              action: 'Power',
              how: '`↑` `↓` or `W` `S` (hold `Shift` for finer steps)',
            },
            { action: 'Throw', how: '`Space` or `Enter`' },
            { action: 'Pause', how: '`P` or `Esc`' },
          ],
        },
        {
          device: 'Controller',
          controls: [
            { action: 'Aim', how: 'Left stick' },
            { action: 'Throw', how: 'Hold `A` to charge, let go to throw' },
            { action: 'Cancel a throw', how: '`B`' },
            { action: 'Pause', how: '`Start`' },
          ],
        },
      ],
    },
  },
  {
    slug: 'night-parade',
    name: "Kiru's Night Parade",
    description:
      'Yokai rise out of nine spirit wells in a moonlit temple garden. Tap a well and Kiru leaps there and cuts whatever comes up in two.',
    longDescription:
      'Tonight is the parade of a hundred demons, and the yokai are climbing out of nine spirit wells in a moonlit temple garden. Kiru leaps from well to well and cuts them down as they rise. Watch who you swing at, though: a few friends are hiding in the crowd. The night gets faster and stranger as it goes, until the Parade Lord himself rises from the center well.',
    thumbnailUrl: '/images/apps/night-parade-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/night-parade-1.webp',
      '/images/apps/night-parade-2.webp',
      '/images/apps/night-parade-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Every tap is a cut: Kiru leaps to the well and his blade lands within a quarter of a second, and a tap made in time always counts.',
      'The Parade Lord blocks every third strike, so the last fight of each round is a duel: wait for his club to come down, then counter.',
      'It plays properly on a phone held either way up and on a computer. Turned sideways, the garden spreads out and the wells get bigger.',
      'Ten AI agents built it: eight each owned one part of the game, a ninth played it hunting for problems, and a tenth checked every fix before it went live.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/night-parade',
    howToPlay: {
      on: 'Plays on a phone held either way up, or on a computer.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            {
              action: 'Strike',
              how: 'Tap a well, or whatever is rising out of it.',
            },
            {
              action: 'Blue Fire',
              how: 'Tap the BLUE FIRE button once the meter is full.',
            },
          ],
        },
        {
          device: 'Keyboard',
          controls: [
            {
              action: 'Strike',
              how: 'The number pad, laid out like the garden (`7` `8` `9` is the back row), or `Q` `W` `E`, `A` `S` `D`, `Z` `X` `C`',
            },
            {
              action: 'Blue Fire',
              how: '`Space` or `F`, once the meter is full',
            },
            { action: 'Pause', how: '`Esc` or `P`' },
          ],
        },
      ],
    },
  },
  {
    slug: 'tokaido-run',
    name: "Kiru's T\u014dkaid\u014d Run",
    description:
      'Kiru runs the old road from Edo to Ky\u014dto, from morning to night. Swipe to change lanes, jump and roll, and tap to cut whatever gets in his way.',
    longDescription:
      'Run the old road from Edo to Kyōto in a single day, through fifty-three post stations from morning to night. Kiru cuts his way through paper walls, bamboo, lantern ghosts and diving tengu, and stays one step ahead of the Edo constable who gives chase every time he stumbles. Ride a paper crane over the rooftops, catch the lucky cat, and when your run is over, the road sends you off with a haiku.',
    thumbnailUrl: '/images/apps/tokaido-run-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/tokaido-run-1.webp',
      '/images/apps/tokaido-run-2.webp',
      '/images/apps/tokaido-run-3.webp',
    ],
    techStack: ['HTML5', 'Three.js', 'WebGL', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'A 3D runner in one file: the road, the towns, Kiru, every texture and every sound are made in the browser as it loads.',
      'Cutting is the point: walls, barrels and bamboo stakes split in two along the line of the blade, and every yokai cut gets a brush stroke across the screen.',
      'Every stretch of road is checked before it is laid down: a solver proves it can be run from any lane, and 10,000 simulated stretches found none that could not.',
      'Ten AI agents built it side by side, each owning one part of the game. After the first play, the torii hillside was rebuilt so it no longer flashes red at speed, and a flicker test measured all five places against the photosensitivity limit.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/tokaido-run',
    howToPlay: {
      on: 'Plays on a phone held either way up, or on a computer.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            { action: 'Change lanes', how: 'Swipe left or right.' },
            { action: 'Jump', how: 'Swipe up.' },
            { action: 'Roll', how: 'Swipe down.' },
            { action: 'Cut', how: 'Tap.' },
            {
              action: 'Bolt Dash',
              how: 'Double-tap once your Ki meter is full.',
            },
          ],
        },
        {
          device: 'Keyboard',
          controls: [
            { action: 'Change lanes', how: '`←` `→` or `A` `D`' },
            { action: 'Jump', how: '`↑` or `W`' },
            { action: 'Roll', how: '`↓` or `S`' },
            { action: 'Cut', how: '`Space`, `J` or `K`' },
            { action: 'Bolt Dash', how: '`Shift` or `E`' },
            { action: 'Pause', how: '`Esc` or `P`' },
          ],
        },
        {
          device: 'Controller',
          controls: [
            { action: 'Change lanes', how: 'D-pad or left stick' },
            { action: 'Jump', how: '`A`' },
            { action: 'Roll', how: '`B`' },
            { action: 'Cut', how: '`X`, `RB` or `RT`' },
            { action: 'Bolt Dash', how: '`Y`' },
            { action: 'Pause', how: '`Start`' },
          ],
        },
      ],
    },
  },
  {
    slug: 'neo-dojo-survivors',
    name: 'Neo Dojo Survivors',
    description:
      'Tengu-9, the mech samurai of the Neo Dojo, holds a neon rooftop for fifteen minutes against six rogues and their hordes. You only move him: his weapons fire on their own.',
    longDescription:
      'Hold the Neo Dojo’s neon rooftop for fifteen minutes. Tengu-9’s weapons fire on their own, so all you do is keep moving while hundreds of rogues pour in: buzzwords, pitch decks, deepfakes and flocks of em-dashes. Level up, stack your weapons, and stand your ground when each act’s boss arrives.',
    thumbnailUrl: '/images/apps/neo-dojo-survivors-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/neo-dojo-survivors-1.webp',
      '/images/apps/neo-dojo-survivors-2.webp',
      '/images/apps/neo-dojo-survivors-3.webp',
    ],
    techStack: ['HTML5', 'WebGL2', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Hundreds of enemies on screen at once, drawn in WebGL with no game engine and no libraries, and every weapon lights the ground in its own colour.',
      'Six acts and six bosses, each one a rogue from the Neo Dojo Cast with a fight built around its joke.',
      'Ten AI agents built it side by side, each owning one part of the game: the hero, the horde, the bosses, two sets of weapons, levelling up, the world, the effects, the music and the screens.',
      'After the first play it was rebalanced with an autopilot that plays whole runs in fast-forward. It used to reach level 168 by the end; now it reaches about 42, and the last minutes fight back.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/neo-dojo-survivors',
    howToPlay: {
      on: 'Plays on a phone with one thumb, or on a computer. You only steer: the weapons fire on their own.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            {
              action: 'Move',
              how: 'Press anywhere and drag. A joystick appears under your thumb.',
            },
            { action: 'Level up', how: 'Tap the card you want.' },
          ],
        },
        {
          device: 'Keyboard',
          controls: [
            { action: 'Move', how: '`W` `A` `S` `D` or the arrow keys' },
            {
              action: 'Level up',
              how: '`1` to `4` to pick, `R` to reroll, `X` to skip',
            },
            { action: 'Pause', how: '`P` or `Esc`' },
          ],
        },
        {
          device: 'Controller',
          controls: [
            { action: 'Move', how: 'Left stick or D-pad' },
            {
              action: 'Level up',
              how: 'D-pad and `A` to pick, `X` to reroll, `Y` to skip',
            },
            { action: 'Pause', how: '`Start`' },
          ],
        },
      ],
    },
  },
  {
    slug: 'path-not-taken',
    name: 'Path Not Taken (Pre Alpha)',
    description:
      'A rhythm duel I am still building. These are the first gameplay tests: you face a greybox attacker on six film-score battles, and one miss is death.',
    longDescription:
      'A duel to the beat, seen through your own eyes, and an early test of something bigger. Every blow your opponent throws lands on the music: dodge it, slow time when the song goes quiet, and strike back when you see your opening. One miss and the duel is over, but you’re back in the fight in seconds. The story comes later.',
    thumbnailUrl: '/images/apps/path-not-taken-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/path-not-taken-1.webp',
      '/images/apps/path-not-taken-2.webp',
      '/images/apps/path-not-taken-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API', 'ElevenLabs Music'],
    category: 'Game',
    status: 'development',
    outcomes: [
      'Every tile sits on a hit in the recording. I measured each song\u2019s tempo to a thousandth of a beat and its hits slot by slot, and the chart refuses a tile where the music has nothing to hit.',
      'Six songs from 140 to 184 BPM, each shaped as about ten seconds of intro, a minute or more of play and ten seconds of exit. A death restarts the song two seconds before the first tile.',
      'The page is about half a megabyte. Each song is downloaded the first time you pick its level, so playing one battle costs one song, about 2 MB.',
      'One miss is death, judged within 200 ms on the forgiving setting, with a tap-along calibration for Bluetooth headphones and slow screens.',
      'Pre-alpha, and it says so: the attacker is a greybox stand-in, and the game is still being built.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/path-not-taken',
    howToPlay: {
      on: 'Plays on a phone or a computer, and it’s best with the sound up.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            {
              action: 'Dodge',
              how: 'Tap the left, middle or right lane as a line reaches its pad.',
            },
            {
              action: 'Slow time',
              how: 'Hold a blue line, and let go as its tail reaches the pad.',
            },
            {
              action: 'Quick blows',
              how: 'Hold an orange line, then tap the blows in the other lanes, or slide your finger across them.',
            },
            { action: 'Strike', how: 'Tap when the red button comes up.' },
          ],
        },
        {
          device: 'Keyboard',
          controls: [
            { action: 'Dodge', how: '`A` `S` `D`, or `←` `↓` `→`' },
            { action: 'Strike', how: '`W`, `↑` or `Space`' },
            {
              action: 'Blue and orange lines',
              how: 'Hold the lane’s key down',
            },
            { action: 'Pause', how: '`Esc`' },
            { action: 'Try again', how: '`R`' },
          ],
        },
      ],
    },
  },
  {
    slug: 'moondrift',
    name: "Cosmo's Moondrift",
    description:
      'Cosmo, the first kid on the Moon base, boards the dunes of a moon under a ringed giant planet. One button to jump and backflip, a flick for tricks, and glowing orbs to swing from over the gaps.',
    longDescription:
      'Cosmo is the first kid on the Moon base, and the dunes are his playground. Board across a moon under a ringed giant planet: backflip off the crests, grind the cables between antenna masts, and swing over canyons on a line of light. Chain your tricks for a bigger score, but land them clean, because one bad landing ends the run. Every point goes into your bank, and the store sells skins for Cosmo, from cat ears to a board that costs 100 million. A combo multiplies by every trick in it, so long combos are how you afford the best ones.',
    thumbnailUrl: '/images/apps/moondrift-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/moondrift-1.webp',
      '/images/apps/moondrift-2.webp',
      '/images/apps/moondrift-3.webp',
    ],
    techStack: ['HTML5', 'Three.js', 'WebGL', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'A 3D game in one file of about 1.1 MB: the moon, the sky, Cosmo, every texture and every sound are made in the browser as it loads.',
      'The track proves itself. Every chasm is sized from the game’s own physics when a run starts, and a solver that drives the real player code found no section it could not clear in 30,534 tries, while riding straight off the lip clears none of them.',
      'Six AI agents built it side by side on one written contract, each owning one part of the game: the track, the world, the sky, Cosmo, the gameplay and the screens.',
      'After the first play, the sound was rebuilt so a phone can keep up: about 44 synthesised voices at once instead of 90, with the same loudness.',
      'A store of 48 skins, from 100,000 to 100,000,000 points: hats, jackets, shoes, boards and things to hold. Every one is built from code into Cosmo\u2019s own model, so none of them adds to the work of drawing a frame.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/moondrift',
    howToPlay: {
      on: 'Plays on a phone or a computer.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            { action: 'Jump', how: 'Tap.' },
            {
              action: 'Backflip',
              how: 'Hold in the air, and let go to land flat.',
            },
            {
              action: 'Tricks',
              how: 'Flick in the air. Straight flicks are board tricks; diagonal ones are acrobatic.',
            },
            {
              action: 'Swing',
              how: 'Hold when a light orb glows near you, and let go to fly.',
            },
          ],
        },
        {
          device: 'Keyboard',
          controls: [
            {
              action: 'Jump and backflip',
              how: '`Space` (hold it in the air to flip)',
            },
            { action: 'Board tricks', how: 'Arrow keys or `W` `A` `S` `D`' },
            { action: 'Acrobatic tricks', how: '`Q`, `E`, `Z` or `X`' },
            { action: 'Swing', how: 'Hold `Space` when an orb glows' },
            { action: 'Pause', how: '`P` or `Esc`' },
          ],
        },
        {
          device: 'Controller',
          controls: [
            {
              action: 'Jump and backflip',
              how: '`A` (hold it in the air to flip)',
            },
            {
              action: 'Board tricks',
              how: 'Flick the left stick, or the D-pad',
            },
            { action: 'Acrobatic tricks', how: 'Flick the right stick' },
            {
              action: 'Swing',
              how: 'Hold `A` when an orb glows, or press `X`',
            },
            { action: 'Pause', how: '`Start`' },
          ],
        },
      ],
    },
  },
  {
    slug: 'cosmo-outbound',
    name: 'Cosmo Outbound',
    description:
      'Cosmo flies his ship low through sandstone canyons past Mach 1, then straight up through the clouds into orbit. Warp to a new world, dive back down, and shake the raiders who follow you all the way.',
    longDescription:
      "Cosmo's ship is fast and the canyons are tight. Hold boost and break the sound barrier between the walls, then pull up through the clouds and keep climbing until the sky goes black, with no loading screen on the way. From orbit, warp to the next star and dive onto a world nobody has charted: desert, ice, lava, forests, rivers, or an ocean to skim. Some skies have raiders waiting, some canyons have guns on the rims, and one system belongs to Kaida and her dragonfly ship. Cosmo's logbook keeps every world you find, so you can always fly back.",
    thumbnailUrl: '/images/apps/cosmo-outbound-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/cosmo-outbound-1.webp',
      '/images/apps/cosmo-outbound-2.webp',
      '/images/apps/cosmo-outbound-3.webp',
    ],
    techStack: ['HTML5', 'Three.js', 'WebGL', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'A real round planet in one file of about 1.2 MB: the climb from the canyon floor to orbit is one flight, with no loading screen and no cut.',
      'Seven kinds of world, each rebuilt the same from its seed, so a trip back lands on the same planet.',
      'Built by an orchestrator and AI agents working side by side on the ship, space and the warp, the visor and the sound, then grown with dogfights, defended canyons and water.',
      'The star map is a hand-drawn logbook made for a low-end phone: each page is drawn once, and the 3D world stops drawing while it is open.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/cosmo-outbound',
    howToPlay: {
      on: 'Plays on a phone or a computer.',
      ways: [
        {
          device: 'Touch',
          controls: [
            {
              action: 'Steer',
              how: 'Drag on the left half of the screen. Up climbs, down dives.',
            },
            { action: 'Boost', how: 'Hold BOOST.' },
            {
              action: 'Orbit and back',
              how: 'The round button up and to the left of BOOST (above LOOK BACK when the phone is upright): TO ORBIT in a canyon, DIVE in orbit.',
            },
            {
              action: 'Warp',
              how: 'Open STAR MAP at the top when it glows gold, pick a star, and press its WARP.',
            },
            {
              action: 'Fight',
              how: 'The guns fire on their own. Tap MISSILE, or U-TURN to swing round on a raider behind you.',
            },
            { action: 'Cockpit view', how: 'The eye at the top.' },
            { action: 'Look back', how: 'Hold LOOK BACK, right above BOOST.' },
          ],
        },
        {
          device: 'Keyboard',
          controls: [
            { action: 'Steer', how: '`W` `A` `S` `D` or the arrow keys' },
            { action: 'Boost', how: 'Hold `Shift` or `Space`' },
            { action: 'To orbit, and dive', how: '`L`, and `K`' },
            { action: 'Warp', how: '`F` (again to call it off)' },
            { action: 'Star map', how: '`G`' },
            { action: 'Missile, and U-turn', how: '`E`, and `Q`' },
            { action: 'Cockpit view', how: '`V`' },
            { action: 'Look back', how: 'Hold `B`' },
            { action: 'Autopilot', how: '`C`' },
            { action: 'Pause', how: '`Esc` or `P`' },
          ],
        },
        {
          device: 'Controller',
          controls: [
            { action: 'Steer', how: 'The left stick' },
            { action: 'Boost', how: 'Hold `RT` or `A`' },
            { action: 'To orbit, and dive', how: '`X`, and `B`' },
            { action: 'Warp', how: '`Y`' },
            { action: 'Star map', how: '`Back`' },
            { action: 'Missile, and U-turn', how: '`RB`, and `LB`' },
            {
              action: 'Cockpit view',
              how: 'Click the right stick, or D-pad up',
            },
            { action: 'Look back', how: 'Hold `LT`' },
            { action: 'Autopilot', how: 'D-pad down' },
            { action: 'Pause', how: '`Start`' },
          ],
        },
      ],
    },
  },
  {
    slug: 'rubble-rouser',
    name: 'Rubble Rouser',
    description:
      'A rocket launcher, five kinds of warhead and forty buildings of timber, brick, concrete, steel and glass. Find what holds each one up, then bring it all down.',
    longDescription:
      'Every building here stands up the way a real one does. Its weight runs down through the columns and walls, so take out what carries it and everything above comes down. Rockets do most of the work. Inferno rockets set timber burning, cluster rockets burst into six bomblets, bunker busters drill inside before they blow, and demolition charges stick where they land and all go off together. Forty jobs run from a garden shed to a Ferris wheel, a cathedral and a 60-metre skyscraper, each with a set number of shots. Bring enough down and the job earns three stars.',
    thumbnailUrl: '/images/apps/rubble-rouser-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/rubble-rouser-1.webp',
      '/images/apps/rubble-rouser-2.webp',
      '/images/apps/rubble-rouser-3.webp',
    ],
    techStack: ['HTML5', 'Three.js', 'WebGL', 'Rapier Physics', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'A 3D demolition game in one file of about 3.4 MB: three.js, the Rapier physics engine as WebAssembly, and every texture, sound and building made in the browser as it loads.',
      'A structural solver decides what stands: weight has to reach the ground through what is left, and balance over what still holds it, so a building falls the way it is built.',
      'Built in rounds by an orchestrator and AI agents working side by side: the engine first, then five level builders at a time, three buildings each.',
      'The forty jobs are in order of measured difficulty, not judged by eye: each building takes its own loadout fired at random, and its plan thrown up to 1.2 m off, eight times each.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/rubble-rouser',
    howToPlay: {
      on: 'Plays on a phone or a computer.',
      ways: [
        {
          device: 'Touch',
          controls: [
            {
              action: 'Aim',
              how: 'Drag anywhere on the scene. Pinch to zoom in.',
            },
            { action: 'Fire', how: 'Tap FIRE.' },
            {
              action: 'Pick a warhead',
              how: 'Tap one in the row at the bottom left.',
            },
            { action: 'Another view', how: 'The arrows beside VIEW.' },
            {
              action: 'See what holds it up',
              how: 'X-RAY, at the top right, shows the stress.',
            },
            { action: 'Skip the rocket cam', how: 'Tap the screen.' },
          ],
        },
        {
          device: 'Mouse and keyboard',
          controls: [
            { action: 'Aim', how: 'Drag with the mouse. The wheel zooms.' },
            { action: 'Fire', how: '`Space`, or right-click' },
            {
              action: 'Pick a warhead',
              how: '`1` to `5`, as numbered under each one',
            },
            { action: 'Another view', how: '`Q` and `E`, or the arrow keys' },
            { action: 'X-ray', how: '`X`' },
            { action: 'Skip the rocket cam', how: 'Click the screen' },
            { action: 'Pause', how: '`Esc`' },
          ],
        },
      ],
    },
  },
  /*
   * The Escape Rooms: the Arcade's theater on the night market. Each room is a
   * game in Josh's vault (Tools/moon-pearl/ for The Moon Pearl); public/games/<slug>
   * holds the site's copy, built with --site so its sounds load from beside it.
   */
  {
    slug: 'the-moon-pearl',
    name: 'The Moon Pearl',
    description:
      'An escape room starring Mei, all grown up. A magician\u2019s glowing pearl vanishes in a seven-second blackout, the new lighting tech gets the blame, and you have one night locked in the dressing room to find it and prove who took it.',
    longDescription:
      'Every night, Madame Luna makes the Moon Pearl vanish. Tonight, at her farewell show, the lights go out for seven seconds, and it doesn’t come back. Mei, the theater’s new lighting tech, gets the blame and is locked in the dressing room until the police arrive at dawn. You have one night to find the pearl and prove who really took it.',
    thumbnailUrl: '/images/apps/the-moon-pearl-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/the-moon-pearl-1.webp',
      '/images/apps/the-moon-pearl-2.webp',
      '/images/apps/the-moon-pearl-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API', 'ElevenLabs'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Every answer has at least two clues that point to it, and a reason in the story for being there. I wrote the whole story first, with a table that pairs each lock with its clues, before any art existed.',
      'Five voiced characters (37 lines), a theme song and 19 sound effects, all made with ElevenLabs, one take each.',
      'Four AI agents built it side by side on one written contract: the dressing room, the cast and the stage, the cabinet and the props, and the screens with the phone and the intercom.',
      'Measured with the processor slowed four times, every scene\u2019s code takes under 4 ms a frame, so it runs smoothly on an old phone.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/the-moon-pearl',
    howToPlay: {
      on: 'Plays on a phone or a computer.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            {
              action: 'Look around',
              how: 'Tap anything that catches your eye.',
            },
            { action: 'Talk', how: 'Tap to move the conversation along.' },
            {
              action: 'Use what you find',
              how: 'Tap the place it goes. Mei uses whatever she’s carrying.',
            },
            {
              action: 'Case notes',
              how: 'Tap Case to see what you know so far.',
            },
            { action: 'Get a hint', how: 'Stuck? Tap Think.' },
          ],
        },
        {
          device: 'Keyboard shortcuts',
          controls: [
            { action: 'Hint', how: '`H`' },
            { action: 'Case notes', how: '`C` or `J`' },
            { action: 'Back', how: '`Esc`' },
            { action: 'Mute', how: '`M`' },
          ],
        },
      ],
    },
  },
  /*
   * The Broom & Blade Arcade: the five machines of Broom & Blade's games room,
   * free to play here. The games themselves live in Josh's vault
   * (Tools/broom-blade/<booth>/ and Tools/kid-volt/); public/games/<slug> holds
   * the site's copy, rewritten for free play.
   */
  {
    slug: 'hoop-quest',
    name: 'Hoop Quest',
    description:
      'Flick basketballs at a hoop in a candlelit cellar. Thirty balls, a basket that starts moving after ten, and three points for a shot that clears the backboard.',
    longDescription:
      'Thirty balls, one hoop and a candlelit cellar. Sink three in a row and the ball catches fire; keep the streak going and the fire turns blue. After ten balls the hoop starts to move, and Pip the mouse cheers you on from the top of the backboard. Rumor has it there’s a shot worth five, if you can find it.',
    thumbnailUrl: '/images/apps/hoop-quest-thumbnail.webp',
    screenshotUrls: ['/images/apps/hoop-quest-1.webp', '/images/apps/hoop-quest-2.webp', '/images/apps/hoop-quest-3.webp'],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Thirty balls: two points a basket, three for a Sky Shot over the backboard and five for the secret Space Shot, so a perfect round is 150.',
      'The basket holds still for the first ten balls and then slides; three baskets in a row set the ball on fire, and eight turn the fire blue.',
      'Every shot leaves the hand at the same power, so the skill is your aim and how far up you carry the ball: my own tuning, set after I made 20 of 30 on my phone.',
      'Every sound, from the swish and the clank of the rim to Pip’s squeaks, is made by the Web Audio API as you play, with no recordings.',
    ],
    buildDate: '2026-09',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/hoop-quest',
    howToPlay: {
      on: 'Plays on a phone or a computer.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            { action: 'Pick up a ball', how: 'Press on a ball in the rack.' },
            {
              action: 'Shoot',
              how: 'Flick it up at the hoop and let go. The way you flick is the way it flies.',
            },
            {
              action: 'Pause or mute',
              how: 'Tap the buttons in the bottom corners.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'kid-volt-knockout',
    name: 'Kid Volt Knockout',
    description:
      'A boxing game I built for phones. Kid Volt vs Disco Danny on a rooftop: he punches on the beat, a sparkle shows where he’s open, and three knockdowns is a TKO.',
    longDescription:
      'Kid Volt takes on Disco Danny on a rooftop dance floor. Danny throws every punch on the beat, so listen to the music, watch for the sparkle that shows where he’s open, and hit back. Charge up a Volt Hook, save up for a Supernova, and put him down three times before the clock runs out.',
    thumbnailUrl: '/images/apps/kid-volt-knockout-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/kid-volt-knockout-1.webp',
      '/images/apps/kid-volt-knockout-2.webp',
      '/images/apps/kid-volt-knockout-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Danny punches on the beat: 104 beats a minute to start, 116 after his first knockdown and 128 for the last dance.',
      'A counter charges half a super, and saving three charges unlocks the Supernova.',
      'The fight clock starts at 3:00, runs one and a half times faster than real time, and stops while Danny is dizzy.',
      'Three knockdowns is a TKO, and your fastest win is kept on your device as your best KO time.',
    ],
    buildDate: '2026-09',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/kid-volt-knockout',
    howToPlay: {
      on: 'Made for phones, and it plays on a computer too.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            {
              action: 'Punch',
              how: 'Tap JAB to hit high or BODY to hit low, on the left or the right.',
            },
            { action: 'Get out of the way', how: 'Tap DODGE or DUCK.' },
            { action: 'Block', how: 'Hold BLOCK.' },
            { action: 'Super', how: 'Tap SUPER once it’s charged.' },
            {
              action: 'Get back up',
              how: 'Mash any button when you’re knocked down.',
            },
          ],
        },
        {
          device: 'Keyboard',
          controls: [
            { action: 'Jab', how: '`J` and `K` (left and right)' },
            { action: 'Body blow', how: '`N` and `M` (left and right)' },
            { action: 'Dodge', how: '`A` or `←`, `D` or `→`' },
            { action: 'Duck', how: '`S` or `↓`' },
            { action: 'Block', how: 'Hold `W` or `↑`' },
            { action: 'Super', how: '`Space`' },
            { action: 'Get back up', how: 'Mash the punch keys' },
            { action: 'Pause', how: '`Esc` or `P`' },
          ],
        },
      ],
    },
  },
  {
    slug: 'whack-a-dust-bunny',
    name: 'Whack-a-Dust-Bunny',
    description:
      'A booth from the chore game I built for my family. Bonk dust bunnies for 75 seconds, grab the golden ones, survive the Horde, and whatever you do, don’t bonk Pip.',
    longDescription:
      'The cellar is full of dust bunnies, and you have 75 seconds. Bonk them as they pop up, grab the golden ones for extra points, and fill the sign for FEVER before the Horde arrives in the final seconds. Pip pops up too. Don’t bonk Pip.',
    thumbnailUrl: '/images/apps/whack-a-dust-bunny-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/whack-a-dust-bunny-1.webp',
      '/images/apps/whack-a-dust-bunny-2.webp',
      '/images/apps/whack-a-dust-bunny-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'A round is 75 seconds across nine holes, and the last 12 are the frenzy, when the Horde arrives: eight bonks turn it to dust for a 10-point bonus.',
      'Twenty bonks fill the sign (a broken streak knocks four off), and tapping it gives six seconds of FEVER, when every bunny is gold.',
      'Each round plays three surprise events drawn from four: Golden Rush, Lights Out, Pip’s Cousins and the Conga Line.',
      'Five brooms, four of them unlocked by playing well, from bonking 50 bunnies in a round to a streak of 40.',
    ],
    buildDate: '2026-09',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/whack-a-dust-bunny',
    howToPlay: {
      on: 'Plays on a phone or a computer.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            { action: 'Bonk', how: 'Tap a dust bunny while it’s up.' },
            {
              action: 'Grab a power-up',
              how: 'Tap it when it pops out of a hole.',
            },
            {
              action: 'FEVER',
              how: 'Tap the sign at the bottom once it’s full.',
            },
            {
              action: 'Pause or mute',
              how: 'Tap the buttons in the bottom corners.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'ring-toss',
    name: 'Ring Toss',
    description:
      'Flick rings onto twenty bottles under a striped awning. Thirty rings, a golden bottle worth ten, bonuses for rows, columns and corners, and a BLACKOUT for all twenty.',
    longDescription:
      'Twenty bottles, thirty rings, and Pip running the booth. Ring the bottles one by one, fill a row, a column or all four corners for a bonus, and go for the golden bottle worth ten. Ring all twenty for a BLACKOUT, and the whole fair goes wild.',
    thumbnailUrl: '/images/apps/ring-toss-thumbnail.webp',
    screenshotUrls: ['/images/apps/ring-toss-1.webp', '/images/apps/ring-toss-2.webp', '/images/apps/ring-toss-3.webp'],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Twenty bottles in four rows worth 2, 3, 4 and 5, plus a golden bottle worth 10 that is never in the front row.',
      'A full row pays five times its value, a column 15 and the four corners 20, so the bonuses can outscore the bottles.',
      'Ringing all twenty ends the round in a BLACKOUT worth 50, plus 5 for every ring you didn’t need, so a perfect round is 342.',
      'The blackout is a six-second show: the lights cut out, a spotlight snaps on, the word stamps in letter by letter, then fireworks, disco beams and confetti.',
    ],
    buildDate: '2026-09',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/ring-toss',
    howToPlay: {
      on: 'Plays on a phone or a computer.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            {
              action: 'Pick up a ring',
              how: 'Press on the peg at the bottom.',
            },
            {
              action: 'Toss',
              how: 'Flick up and let go. Flick harder to reach the back rows; the slant of your flick steers it.',
            },
            {
              action: 'Pause or mute',
              how: 'Tap the buttons in the bottom corners.',
            },
          ],
        },
      ],
    },
  },
  {
    slug: 'milk-bottle-knockdown',
    name: 'Milk Bottle Knockdown',
    description:
      'Twenty balls, three pyramids of milk bottles. Clear a pyramid with one ball for a CLEAN KNOCK, find the secret golden bottle, and clear the whole shelf.',
    longDescription:
      'Three pyramids of milk bottles, twenty balls, and Pip watching from the counter. Knock a whole pyramid down with one ball for a CLEAN KNOCK, hunt for the one bottle that’s secretly gold, and clear the whole shelf. Keep your eyes open: now and then a bottle flies straight back at you.',
    thumbnailUrl: '/images/apps/milk-bottle-knockdown-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/milk-bottle-knockdown-1.webp',
      '/images/apps/milk-bottle-knockdown-2.webp',
      '/images/apps/milk-bottle-knockdown-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Twenty balls at three pyramids of six: a bottle knocked off the shelf is a point, and one ball through a whole pyramid is a CLEAN KNOCK worth 5 more.',
      'One of the first eighteen bottles is secretly golden and worth 5, and you only find out which when it falls.',
      'Clearing all three pyramids lights the lamps for a FULL SHELF worth 10, and a perfect round is 284.',
      'A CLEAN KNOCK or a FULL SHELF rolls an instant replay at a third of the speed, and about one direct hit in seven (twice a round at most) sends a bottle into the screen.',
    ],
    buildDate: '2026-09',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/milk-bottle-knockdown',
    howToPlay: {
      on: 'Plays on a phone or a computer.',
      ways: [
        {
          device: 'Touch or mouse',
          controls: [
            {
              action: 'Pick up a ball',
              how: 'Press anywhere below the counter.',
            },
            {
              action: 'Throw',
              how: 'Flick up and let go. Flick harder to hit higher; the slant of your flick steers it.',
            },
            { action: 'Skip a replay', how: 'Tap the screen.' },
            {
              action: 'Pause or mute',
              how: 'Tap the buttons in the bottom corners.',
            },
          ],
        },
      ],
    },
  },
];

export function getAppBySlug(slug: string): App | undefined {
  return apps.find((app) => app.slug === slug);
}

/**
 * The Arcade line-up, in cabinet order. Josh's call on the ordering.
 *
 * Since 2026-10-05 the Arcade's front room is Kiru's games and Neo Dojo
 * Survivors, right below them (Josh's call); every other game moved to the
 * archive at /games/archive, linked from the bottom of /games. Path Not Taken,
 * a rhythm duel in pre-alpha, is the last cabinet before the archive's door
 * (Josh's call, the same day).
 *
 * These live here rather than in the games page because /built reads them too:
 * anything in the arcade, front room or archive, is deliberately absent from
 * the catalogue, so the pages must not keep separate lists that can drift apart.
 */
export const ARCADE_SLUGS = ['lantern-night', 'night-parade', 'tokaido-run', 'neo-dojo-survivors', 'path-not-taken', 'moondrift', 'cosmo-outbound', 'rubble-rouser'];

/**
 * The Broom & Blade Arcade, the last room on /games before the archive's door
 * (Josh's call, 2026-10-05): the five machines of Broom & Blade's games room,
 * hosted by Pip the guild mouse, in machine order.
 */
export const BROOM_BLADE_ARCADE_SLUGS = [
  'hoop-quest',
  'kid-volt-knockout',
  'whack-a-dust-bunny',
  'ring-toss',
  'milk-bottle-knockdown',
];

/**
 * The Escape Rooms, the Arcade's theater on the night market (Josh's call,
 * 2026-10-23): between the front room's cabinets and the stair down to the
 * Broom & Blade Arcade, one room per game, in the order they opened.
 */
export const ESCAPE_ROOM_SLUGS = ['the-moon-pearl'];

/** The Arcade's archive, /games/archive: the older cabinets, in their old order. */
export const ARCADE_ARCHIVE_SLUGS = ['cloth-simulator', 'broom-blade'];

/**
 * The archive's Demo section, /games/archive (Josh's call, 2026-10-14):
 * experiments and greybox builds that can be played but aren't finished
 * things. Deliberately NOT in GAME_SLUGS, and kept out of the catalogue
 * (src/data/built.ts), so /about's list of what I've built, the home page's
 * counts and the search index's games never include them.
 */
export const ARCADE_DEMO_SLUGS = ['tether-ball'];

/**
 * Every game on the site, the front room, the Escape Rooms, the Broom & Blade
 * Arcade and the archive: what the catalogue, the search index and the home
 * page's counts treat as a game.
 */
export const GAME_SLUGS = [...ARCADE_SLUGS, ...ESCAPE_ROOM_SLUGS, ...BROOM_BLADE_ARCADE_SLUGS, ...ARCADE_ARCHIVE_SLUGS];

/** Projects with a full write-up on /websites, so they skip the catalogue. */
// Slugs that live on /websites as a full write-up and are therefore filtered out
// of the /apps catalogue, so nothing is listed twice.
//
// Emptied 2026-08-26: Samurai Kitchen came off /websites (replaced by the
// Kitsune Kitchen demo), so it returns to the catalogue here rather than
// disappearing from the site altogether — this list is the only thing that was
// hiding it.
export const WEBSITE_SLUGS: string[] = [];

export function getAppCategories(): string[] {
  return Array.from(new Set(apps.map((app) => app.category)));
}
