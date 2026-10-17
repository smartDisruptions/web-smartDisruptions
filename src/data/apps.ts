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
      'A piece of real cloth in a lit 3D scene, and you can do almost anything to it. Pick a scene: a shop curtain at dusk with the lamps behind it, carp streamers that swim when the wind fills them, banners in a gale, a silk sheet over a glowing moon, a cloth in a night courtyard that wants a match, or a tarp in the rainy season. Then grab it with up to five fingers, swipe through it with a katana and time slows for a beat, set it alight, pin it, or drop ink on it and watch the ink spread along the threads. The light shines through the fabric and lands on the ground in its colours. Fire chars the cloth ahead of the flame and eats holes in it. Rain soaks in, so wet cloth darkens, sags, fills with water and drips, and it won’t burn: the fire hisses into steam. Switch between cotton, silk, denim, velvet, chainmail that glows red-hot instead of burning, and a film that shifts colour as it moves. Turn on Tilt and gravity follows your phone. Every sound, from the rip to the rain, is made as it happens.',
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
  },
  {
    slug: 'tether-ball',
    name: 'Tether Ball',
    description:
      'A demo: Kiru against Kage-X on a school playground’s tether ball court. Swipe up on your half and Kiru flash-steps in to hit it, winding the rope your way before Kage winds it his.',
    longDescription:
      'A ball hangs on a rope from a pole on a school playground, and the court painted round it is split down the middle. You play one half as Kiru, and Kage-X, the cyber ninja from Kiru’s Neo Dojo Cast, plays the other. You each wind the rope your own way by hitting the ball away from you on your half, so a swipe up is all it takes. The swipe is still yours: the moment it hits the ball, Kiru flash-steps onto it, a dash along the floor or a leap for a high one, with afterimages strung back to where he stood, then flashes back to his spot. How fast you swipe and where you catch the ball, dead centre or a glancing blow, decide how hard it flies, and every hit freezes time for a beat before it whips back to speed. The rope wraps round the pole as the ball circles, the orbit shrinks and speeds up, and the first to wind it all the way up takes the round. Winning a round is a show. The winner steps out to the front of their half: Kiru throws a spinning uppercut that pulls lightning down onto his fist, and Kage cuts the air twice in an X. They power up until it goes off in a pillar of light and a shockwave, then cheer, while the loser drops to their knees under a cloud of gloom. The score and the round’s numbers are painted into the background, behind the players. Win the match and it goes further: a second power-up in the air, fireworks, confetti and a fanfare. Kage reads the ball, runs to meet it and leaps for the high ones, trash-talking as he goes. Keep a rally going and you both fill an energy bar. A full one is a special. Tap the big lightning button in the corner (bottom left unless you move it) and your next hit is the special: it answers the moment your finger lands, even mid-swipe or with a second finger. Or swipe in a counter-clockwise curve: the moment your swing has curved enough, your trail burns blue, and that hit is the special. Kiru’s brings lightning down on the ball, Kage’s crosses it with two shadow blades, and either one hits harder and makes the other player’s next touch heavy. Then it is a plain ball again. Or swap either special for one of six supers that change what the ball does for that turn: a swerve that cuts in toward the pole instead of going round, a spike that flies straight at the other player the moment it leaves the hand and knocks them down, a phantom you can only follow by its shadow, decoys where only the real ball has the rope, a slip that slides off the first touch, and a warp that blinks out as it reaches them and can’t be touched for a split second. Or pick one of four that knock the other player off their feet: a lightning zap that leaps from the ball, a whirlwind that chases them down, a stomp that shakes the screen and the ground and rolls a shockwave across the court, or a power-up that sets you on fire and goes off in a ring of flame that throws them down and powers your next hit. Or pick one of the three big ones. Double Dragon strikes twice in one turn, both in slow motion: the hit, then you rush in and hit it again, and a pair of fire dragons coils round the ball and burns whatever it passes through for two turns. Ray of Light marks them with a ring of light and brings a giant sunbeam down on them out of the sky, while the ball shines like a small sun. Black Hole has no hit at all: it waits, and the moment the other player throws their special it swallows it, holds the ball, and spits their own special back at them twice as strong. Each one has its own settings for how it moves, and they can all go a lot faster than they start. Go six hits back and forth, three each, without a miss, and the ball catches fire. That fire volley burns until one of you lets a ball go by, and whoever hit it last wins a fireball. Tap the flame beside your special button, or swipe in a clockwise curve, to throw it. With Double Dragon picked it is a single dragon instead, and with Ray of Light it is a beam of light that flies straight at them and shocks them twice. Try to hit a fireball back and you get knocked down in flames, and you are slow for a turn after that. Let it go by and it goes out. A settings panel opens to fill the screen: Kiru’s flash moves, Kage’s difficulty (1 to 20) and accuracy, how fast he reacts, how quickly he’s back on guard after a swing and how high he jumps, how many rounds a match lasts and who serves, the court’s look, the short delay after two quick hits that keeps you from hammering the ball, the specials (or none), which one each of you throws, which corner the power-up buttons sit in, how big they are and whether they are round or wide, and a Specials tab where you pick a special to see its settings, the fire, its colour and how many hits it takes, the pole, rope and ball themselves, how the end of a round plays out, the music, four deeper hit sounds made with ElevenLabs, and a soundboard: every sound in the game and every music track on a pad you can tap to hear, each with its own pitch, volume and tone that hold in the game. Under it all plays an epic violin and piano soundtrack made with ElevenLabs Music, four takes of it to pick from in the settings. It swells in with your first tap, loops for as long as you play, and muffles when time slows, so a big hit cuts through. There is a solo time trial too. The court sits on a school blacktop with four-square and hopscotch painted round it and a brick school wall behind, all drawn by the game itself. It started as a dark greybox stage to get the feel right, and that stage is still a setting.',
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
      'Kage plays by the same rules as your finger. To decide where to swing, he runs the game’s own physics 1.2 seconds ahead, then has to get there on his own feet, with a reaction delay after each of your hits.',
      'Kiru is drawn, not simulated. The hit is your swipe’s, and he lands beside the ball in that same frame with his fist on it, so the camera sees the contact. His flash plays out inside the hit’s freeze, which holds him in the strike with the ball.',
      'His difficulty and accuracy are settings, not tricks: a harder Kage reacts faster, runs and jumps further and misses less, and the panel shows every number.',
      'Difficulty runs to 20, and levels 1 to 10 play exactly as they did. I played at 10 and kept beating Kage the same two ways, so I had them measured: a simulated player that sends every ball back hard showed that a ball hit just before the centre line reached Kage before he could read the hit and leap for it, and that right after his own swing he was stuck in his follow-through. At 10 he returned 28 % of the quick balls and 46 % of the rally ones. Levels 11 to 20 carry every number on past 10, and by 15 those are 81 % and 93 %.',
      'The specials were balanced by simulation, not by feel. A scripted player went hundreds of rounds against Kage with and without them. The first version handed whoever used them a 20 to 30 point swing in win rate. The shipped one leaves the match where it was when both of you use them.',
      'The fire was balanced the same way, and the simulation caught a design mistake. The first fire burned for a few seconds whatever happened, so letting it go by cost more rope than getting burned, and the smart play was to take the burn. Now a fireball threatens one return and goes out once it is past. Earning one takes six answered hits in a row, about one round in four against Kage at his default level, and with fireballs in play the scripted player’s win rate moves about 7 points.',
      'The supers fool Kage the way they would fool a person. He reads the ball by running the game’s physics ahead, and a swerve’s cut toward the pole is a force that physics never sees, so he reads the round arc and reaches for a ball that isn’t coming. He can’t read a phantom until it is close, and with decoys he chases the one he picked until his swing goes through it.',
      'The knockdown specials were the strongest yet in the simulation. A player knocked off their feet returned almost nothing, and Kage’s whirlwind moved the scripted player’s win rate 17 points. Shorter knockdowns fixed most of it. For the zap, what fixed it was the ball’s speed after the bolt: the ball was gone before Kage got up, however short his fall.',
      'The music is four ElevenLabs Music takes of one prompt. The default was picked by measurement: the steadiest level, and a tempo locked to 128 BPM. Each take is cut into its own loop with the seam crossfaded into the file itself, so the loop never jumps, and only the one you pick is downloaded.',
      'The soundboard edits were checked by measuring the sound, not by ear. An octave up moves a pole clack’s note by exactly double, a volume of 0.5 is 6.02 dB quieter, and with every pad at zero the whole game is silent, which shows every sound it makes is on the board. A sound nobody has edited is the same audio as before.',
      'There is no results card. The end of a round plays out on the court in about three seconds, four for a match, with the numbers painted behind the players, and a tap skips it. The loser is thrown out to the front of their half by the finish, because at the end of a rally they were often standing behind the pole, where you couldn’t see them lose.',
      'The three big specials’ sounds are ElevenLabs sound effects, seven kept out of 28 takes by measuring them, not by ear. The Light Beam’s two shocks on screen land on the two shocks in its sound, 0.84 and 1.36 seconds in. The black hole doubles whatever it swallows in that special’s own terms: a knockdown twice as long, a trick ball for two turns instead of one, dragons that stay for four.',
      'One page with no game engine and no libraries, and its music in a second file that arrives once you are already playing. Kiru and Kage are drawn from the cast sheet’s own shapes on one shared rig, so they look the way they do everywhere else.',
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
      'It is the night of a festival and the lanterns have gone dark. Kiru stands on a rooftop with 30 spirit flames to light them with. You drag up to throw: the longer the drag, the farther the flame flies, and it only catches if it drops into the top of a lantern. Every lantern you light bursts into fireworks on the beat, and lighting every lantern on a rope sends the whole rope up into the sky. Light several in a row and the band joins in, from a koto and a soft drum up to the full festival band. When the flames run out there is a finale of fireworks, and the night’s score is tallied on a paper slip. The game plays all of its own music while you play: koto, shamisen, taiko drums and a bamboo flute, with no recordings to download. It plays on a phone held either way up and on a computer, with touch, a mouse, the keyboard or a game controller. It remembers your best score, and it is one file.',
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
  },
  {
    slug: 'night-parade',
    name: "Kiru's Night Parade",
    description:
      'Yokai rise out of nine spirit wells in a moonlit temple garden. Tap a well and Kiru leaps there and cuts whatever comes up in two.',
    longDescription:
      'It is the night of the Hyakki Yagy\u014d, the parade of a hundred demons, and the yokai are coming up through nine spirit wells in a moonlit temple garden. Tap a well and Kiru leaps there and cuts whatever is rising out of it in two. Most of them are small oni worth a point and the golden kitsune are worth three, but two are friends you must not cut: the Moon Rabbit, and a tanuki hiding behind an oni mask. A round lasts 75 seconds and speeds up as it goes. Along the way come three of four events (a golden night, a new moon where only their eyes show, a moon-viewing night full of rabbits, and a parade round the wells), powers that slow time, double your points or send shadow clones down the row, and a meter that fills into BLUE FIRE. In the last twelve seconds the Parade Lord rises from the centre well, and he blocks every third strike with his club: wait for him to bring it down, and the first strike in the opening is a counter. The game plays all of its own music and sound while you play, with no recordings to download. It plays on a phone held either way up and on a computer, with touch, a mouse or the keyboard. It remembers your best score and the blades you unlock, and it is one file.',
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
  },
  {
    slug: 'tokaido-run',
    name: "Kiru's T\u014dkaid\u014d Run",
    description:
      'Kiru runs the old road from Edo to Ky\u014dto, from morning to night. Swipe to change lanes, jump and roll, and tap to cut whatever gets in his way.',
    longDescription:
      'The T\u014dkaid\u014d was the great road of Edo Japan, from Nihonbashi to Ky\u014dto through 53 post stations, and Kiru runs all of it. Swipe left or right to change lanes, up to jump and down to roll, and tap to cut. Paper sh\u014dji walls, barrels and bamboo stakes split in two along the line of the blade, and so do lantern ghosts and diving tengu. A rival ninja leaves a log behind when cut, an oni bursts into beans and runs off crying, and fox fires fill the Ki meter for a Bolt Dash. Every stumble lights one of an Edo constable\u2019s three paper lanterns and puts him on your heels until it goes out; light the third and he has you. The road runs from morning to night through five places: a post town, a hillside of a thousand vermilion torii, a bamboo grove, a mountain temple in autumn and a night festival, with rain and snow at the stations Hiroshige painted that way. Along it come a lucky cat that pulls in coins, a paper crane to ride over the rooftops and a daruma for double score. When the run ends, the game writes it up as a farewell haiku. It is drawn in 3D in the browser and makes all of its own music as you play, taiko and shamisen, with no recordings to download. It plays on a phone held either way up and on a computer, with touch, a mouse, the keyboard or a game controller, and it is one file.',
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
  },
  {
    slug: 'neo-dojo-survivors',
    name: 'Neo Dojo Survivors',
    description:
      'Tengu-9, the mech samurai of the Neo Dojo, holds a neon rooftop for fifteen minutes against six rogues and their hordes. You only move him: his weapons fire on their own.',
    longDescription:
      'A horde game in the style of Vampire Survivors, starring Tengu-9 from the Neo Dojo Cast, the heroes and rogues I drew on Kiru\u2019s rig. You only steer him, his weapons fire on their own, and for fifteen minutes the dojo roof fills with hundreds of rogues. Each act belongs to one rogue, and its minions are its jokes: buzzwords that pivot when you hit them, pitch decks shouting 10\u00d7, porcelain deepfakes of Tengu-9 that bow to him, flocks of em-dashes and six-fingered hands. At the end of each act the rogue arrives as its boss. Bagu splits every time it is patched, Bazu runs a keynote with sweeping spotlights, Kusarigumo fences you in and charges an exit fee, and Emperor Kemuri hides behind a COMING SOON shield whose release date slips with every pillar you cut. Each level up offers a new weapon or an upgrade, and from six minutes on, a weapon at its top level with its partner upgrade turns into something bigger when you open a chest. The game makes all of its own music as you play, taiko drums and synthesizers that build with each act, with no recordings to download. It plays on a phone with one thumb and on a computer with the keyboard, a mouse or a game controller, and it is one file.',
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
  },
  {
    slug: 'path-not-taken',
    name: 'Path Not Taken (Pre Alpha)',
    description:
      'A rhythm duel I am still building. These are the first gameplay tests: you face a greybox attacker on six film-score battles, and one miss is death.',
    longDescription:
      'A first-person rhythm duel, and a pre-alpha: what is here are the first gameplay tests, with a greybox attacker standing in for the real one. Every glowing line that falls down the three lanes is a hit in the music. Dodge left, down or right as it touches its pad, hold a blue line for bullet time while one slow blow crawls in, dodge a burst of quick blows after an orange one, and strike when the red button comes up. One miss is death, and a death skips the intro, so you are straight back in. The six songs are short battle cues I made with ElevenLabs Music: three film-score fights, and three darker ones with Japanese instruments, each with a quiet stretch you play in bullet time. Every one has about ten seconds of intro, a minute or more of fighting and ten seconds to close. The story comes later.',
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
      'Hoop Quest started the fair in Broom & Blade, the chore game I built for my family: it felt like a carnival game, so the guild hall grew a booth for each game. You drag a ball up off the rack and flick it at the hoop: thirty balls, two points a basket, and three for a Sky Shot thrown from down low that flies over the backboard. The basket holds still for the first ten balls, then starts to slide from side to side. Three baskets in a row set the ball on fire, eight turn the fire blue, and the callouts climb from NICE! to LEGENDARY!. Pip the guild mouse rides the top of the backboard: he watches the ball, cheers every make, backflips for a swish, waves a pennant on a streak and hides his eyes when you miss. A secret Space Shot, flicked so hard it leaves the top of the screen and still drops in, is worth five and turns Pip into a giant hype man. Every sound is made by the game as you play, with no recordings, and the whole game is one file. Here every round is free.',
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
  },
  {
    slug: 'kid-volt-knockout',
    name: 'Kid Volt Knockout',
    description:
      'A boxing game I built for phones. Kid Volt vs Disco Danny on a rooftop: he punches on the beat, a sparkle shows where he’s open, and three knockdowns is a TKO.',
    longDescription:
      'A boxing game I built for phones, from a study of the 16-bit boxing classics. Kid Volt fights Disco Danny on a rooftop dance floor. Danny throws every punch on the beat of a disco loop, and during a real wind-up a sparkle marks where he’s open. Punch that spot to counter and charge your super: one charge is a Volt Hook, three is a Supernova. Dodge, duck or hold block, hit him as he sways back to center when he’s dizzy, and put him down three times for a TKO before the fight clock runs out. Every pixel is drawn into a 120 by 140 frame, and every sound is synthesised in the browser.',
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
  },
  {
    slug: 'whack-a-dust-bunny',
    name: 'Whack-a-Dust-Bunny',
    description:
      'A booth from the chore game I built for my family. Bonk dust bunnies for 75 seconds, grab the golden ones, survive the Horde, and whatever you do, don’t bonk Pip.',
    longDescription:
      'At home this is a booth in Broom & Blade, the chore game I built for my family: a finished chore earns a ticket, and a ticket buys a round. Here every round is free. Dust bunnies pop out of nine holes in a candlelit cellar and you have 75 seconds to bonk them. Golden ones are worth three, helmets take two bonks, and two bonks in a flash is a DOUBLE BONK. Sneezy bunnies, hoppers, mama bunnies, socks and three surprise events a round keep it changing, your bonks fill the sign for FEVER, and the last twelve seconds bring the Horde. Pip pops up too. Don’t bonk Pip.',
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
  },
  {
    slug: 'ring-toss',
    name: 'Ring Toss',
    description:
      'Flick rings onto twenty bottles under a striped awning. Thirty rings, a golden bottle worth ten, bonuses for rows, columns and corners, and a BLACKOUT for all twenty.',
    longDescription:
      'A carnival ring toss, the second booth at the Broom & Blade fair, and Pip runs it. You grab a ring off the peg and flick it at a table of twenty bottles: a soft flick lands up front, a hard one reaches the back row, and the slant of the flick carries it sideways. The rows are worth two to five, one bottle is golden and worth ten, and each bottle takes one ring. A full row pays five times its value, a column pays 15 and the four corners 20. Three rows in, the string lights go rainbow and a heartbeat starts under the last bottles. Ring all twenty and the round ends in a BLACKOUT: the lights cut out, a spotlight snaps on, the word stamps in letter by letter, and the fair goes wild while Pip screams. Every sound is made by the game as you play, and the whole game is one file. Here every round is free.',
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
  },
  {
    slug: 'milk-bottle-knockdown',
    name: 'Milk Bottle Knockdown',
    description:
      'Twenty balls, three pyramids of milk bottles. Clear a pyramid with one ball for a CLEAN KNOCK, find the secret golden bottle, and clear the whole shelf.',
    longDescription:
      'The carnival milk-bottle throw from the Broom & Blade fair. You drag a ball up and flick it at three pyramids of six bottles: a soft flick hits low, a hard one hits high, and too soft falls short. A bottle only counts once it leaves the shelf. One ball through a whole pyramid is a CLEAN KNOCK, one bottle is secretly golden, and clearing all three pyramids lights the lamps for a FULL SHELF. The bottles fly in 3D: they bowl each other over, land on the shelf or drop to the booth floor, and a hard landing smashes them into glass and milk. Now and then one flies straight at you and cracks the screen, and a clean knock rolls an instant replay at a third of the speed. Pip watches from the counter and ducks when bottles come his way. Every sound is made by the game as you play, and the whole game is one file. Here every round is free.',
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
export const ARCADE_SLUGS = ['lantern-night', 'night-parade', 'tokaido-run', 'neo-dojo-survivors', 'path-not-taken'];

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
 * Every game on the site, the front room, the Broom & Blade Arcade and the
 * archive: what the catalogue, the search index and the home page's counts
 * treat as a game.
 */
export const GAME_SLUGS = [...ARCADE_SLUGS, ...BROOM_BLADE_ARCADE_SLUGS, ...ARCADE_ARCHIVE_SLUGS];

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
