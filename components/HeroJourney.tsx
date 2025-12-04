import React, { useState, useRef, useEffect } from 'react';
import { 
  Plane, 
  Shield, 
  Star, 
  MapPin, 
  Calendar, 
  Award,
  ChevronDown,
  ChevronRight,
  Quote,
  Clock,
  Target,
  Compass,
  Users,
  Heart,
  Home,
  Globe
} from 'lucide-react';

// Hero's Journey chapter structure
interface JourneyChapter {
  id: string;
  title: string;
  subtitle: string;
  dateRange: string;
  phase: 'origin' | 'call' | 'training' | 'threshold' | 'trial' | 'ordeal' | 'reward' | 'road' | 'return';
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  summary: string;
  details: string[];
  quotes: { text: string; source: string }[];
  stats?: { label: string; value: string }[];
  image?: string;
  locations?: string[];
}

const JOURNEY_CHAPTERS: JourneyChapter[] = [
  {
    id: 'origin',
    title: 'The Ordinary World',
    subtitle: 'Wings Earned, Destiny Awaited',
    dateRange: '1941 - January 1944',
    phase: 'origin',
    icon: Home,
    color: 'text-stone-400',
    bgGradient: 'from-stone-800 to-stone-900',
    summary: 'Robin Glen earned his pilot wings, spending 30 months in training before his first squadron posting.',
    details: [
      'Trained on Tiger Moth, Harvard II, and Masters aircraft',
      'Accumulated over 330 flying hours before combat duty',
      'His original logbook was stolen on January 4, 1944 — the surviving record begins here',
      'Qualified as First Pilot (day only) with rank of Warrant Officer (W/O)',
    ],
    quotes: [
      { text: 'Previous Log Book Stolen on 4th January 1944. The following flying times are approximately correct.', source: 'Logbook Entry, January 1944' }
    ],
    stats: [
      { label: 'Training Hours', value: '~331' },
      { label: 'Aircraft Types', value: '6' },
      { label: 'Months Training', value: '30' },
    ],
    locations: ['Various RAF Training Bases, UK'],
  },
  {
    id: 'training',
    title: 'Preparation',
    subtitle: 'Forged in Fire Before the Storm',
    dateRange: 'March - May 1944',
    phase: 'training',
    icon: Target,
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-900/30 to-stone-900',
    summary: 'Advanced tactical training at I.T.E.U. Tealing — mastering Spitfires, Hurricanes, and the art of combat.',
    details: [
      'First solo on Spitfire I, then progressed to Spitfire V',
      'Training included aerobatics, formation flying, dive bombing, and air-to-ground firing',
      'Low-level cross-country navigation exercises',
      'Assessment: "Good Average" as a Fighter Pilot, "Above Average" with R.P. (Rocket Projectiles)',
    ],
    quotes: [
      { text: 'Assessment of Ability: (i) AS A F. PILOT: Good Average... (v) IN S.B.A. w. R.P.: Above Average', source: 'Flying Assessment Form 414A, May 1944' }
    ],
    stats: [
      { label: 'Hours Added', value: '42.45' },
      { label: 'Aircraft Types', value: '4' },
      { label: 'Total Hours', value: '~374' },
    ],
    image: '/report-card.png',
    locations: ['I.T.E.U. Tealing', 'Scotland'],
  },
  {
    id: 'threshold',
    title: 'Crossing the Threshold',
    subtitle: 'Posted to 313 Czech Squadron',
    dateRange: 'May 30, 1944',
    phase: 'threshold',
    icon: Compass,
    color: 'text-blue-400',
    bgGradient: 'from-blue-900/30 to-stone-900',
    summary: 'Robin arrived at 313 Squadron just one week before the greatest amphibious invasion in history.',
    details: [
      'Posted from 84 G.S.U. (RAF Aston Down) to 313 Squadron in 2nd Tactical Air Force',
      'Arrived on a grey Spitfire Mk. IX at temporary airfield Appledram',
      'The squadron was preparing for Operation Overlord',
      'About a week before the Invasion — the calm before the storm',
    ],
    quotes: [
      { 
        text: "On May 30 1944 I was posted from 84 G.S.U. (RAF Aston Down) to 313 Squadron in 2 Tactical Air Force. I'd had my pilot's wings for 30 months - and arrived on a Grey Spitfire Mk. IX at a temporary airfield at Appledean - S.A.T. Billet. We were there about a week before the Invasion.", 
        source: 'Pilot Notes, May 1944' 
      }
    ],
    stats: [
      { label: 'Days to D-Day', value: '7' },
      { label: 'Squadron', value: '313 Czech' },
    ],
    locations: ['RAF Appledram', 'Near Chichester'],
  },
  {
    id: 'trial',
    title: 'Trial by Fire',
    subtitle: 'D-Day and the Normandy Campaign',
    dateRange: 'June 1944',
    phase: 'trial',
    icon: Shield,
    color: 'text-red-500',
    bgGradient: 'from-red-900/40 to-stone-900',
    summary: 'Robin\'s first combat operations came during the most dramatic moment of the war — D-Day and the desperate struggle for the Normandy beach head.',
    details: [
      'June 2: Convoy Patrol — unknowingly escorting the Invasion Fleet',
      'June 5: Beach Head Patrol begins — flying daily over Normandy',
      'Told at briefing: "enough pilots and aircraft in reserve for squadrons to suffer 90% casualties on Day 1"',
      'June 19: Dive bombing attack on V-1 rocket launching site',
      'June 24: Shot up — tailplane sustained Ack Ack damage; spent nights under shell-fire behind front lines',
      'June 28-29: Based at B.10 ALG in France — flew Armed Recce and Front Line Patrols',
    ],
    quotes: [
      { 
        text: "30 mths elapsed from the time I got my pilots 'wings' to getting to a squadron - and what could be a more dramatic way of starting on ops' than to fly daily over the tiny beach head where the Allies struggled to get ashore and open up the second front.", 
        source: 'Pilot Notes, June 1944' 
      },
      {
        text: "At our very detailed and comprehensive 'briefing' on the morning before the invasion - we were told that the outcome of the war required the armies to get safely ashore at all costs - and there were enough pilots and aircraft in close reserve for all squadrons to suffer 90% casualties on the first day - and they'd be fully up to strength and operational pilots and planes on Day 2.",
        source: 'Pilot Notes, D-Day Briefing'
      },
      {
        text: "The first of 2 nights just behind the Front Line - under self/fire. Got shot up - my plane's tailplane sustaining Ack Ack damage.",
        source: 'Pilot Notes, June 24, 1944'
      }
    ],
    stats: [
      { label: 'Beach Head Patrols', value: '15+' },
      { label: 'Hours in June', value: '51.15' },
      { label: 'Operational Flights', value: '20+' },
    ],
    image: '/dday-full.jpg',
    locations: ['RAF Appledram', 'RAF Tangmere', 'Normandy Beach Head', 'B.10 ALG France'],
  },
  {
    id: 'ordeal',
    title: 'The Supreme Ordeal',
    subtitle: 'Bomber Escort Deep into Germany',
    dateRange: 'October 1944 - March 1945',
    phase: 'ordeal',
    icon: Plane,
    color: 'text-orange-500',
    bgGradient: 'from-orange-900/30 to-stone-900',
    summary: 'Month after month of dangerous bomber escort missions deep into the heart of Nazi Germany — witnessing the devastating 1,000 bomber raids.',
    details: [
      'October 13: Bomber Escort to Duisburg — witnessed V-1 Ack Ack barrage',
      'November: Multiple escorts to Homberg, Munster, Hamburg, Dortmund, Bottrop',
      'Witnessed 1,000 bomber raids: "What devastation... Even the clouds were red"',
      'December 8: Of 37 Spitfires in the wing, Robin was one of only two who made it back to England',
      'March 1945: Continued escorts to Cologne, Gelsenkirchen, Recklinghausen, Osnabruck',
      'By war\'s end: 51+ operational flights completed',
    ],
    quotes: [
      { 
        text: "Gloomy but a clear day was a 1000 Bomber Raid. What devastation.", 
        source: 'Pilot Notes, November 1944' 
      },
      {
        text: "These Bomber Escort trips took place in all weather. This day was cloudless, the covering flights had a fantastic view of power bombing by ± 1000 bombers. But sometimes we never saw the target – God knew where it was by the ack ack aimed at the bombers. I need a comment in a fellow pilot's log book. Even the clouds were red – and fires were raging underneath...",
        source: 'Pilot Notes, November 1944'
      },
      {
        text: "My mission was to fly over Brussels at 15000' to relay radio messages from Wing Commander... Of the 37 Spitfires in our wing, I was one of only two who made it across the sea back to England.",
        source: 'Pilot Notes, December 8, 1944'
      }
    ],
    stats: [
      { label: 'Bomber Escorts', value: '30+' },
      { label: 'Operational Total', value: '133.05 hrs' },
      { label: 'German Targets', value: '12+' },
    ],
    image: '/ack-ack-notes.png',
    locations: ['RAF North Weald', 'RAF Bradwell Bay', 'Over Germany'],
  },
  {
    id: 'reward',
    title: 'The Reward',
    subtitle: 'VE Day and a Royal Honor',
    dateRange: 'April - June 1945',
    phase: 'reward',
    icon: Award,
    color: 'text-amber-400',
    bgGradient: 'from-amber-900/30 to-stone-900',
    summary: 'The war in Europe ends — but not before one final honor: escorting the King and Queen of England.',
    details: [
      'April: Heligoland bombing missions — "What a spectacle!"',
      'May 7: VE Day — the war in Europe officially ends',
      'June 7, 1945: Selected to escort Their Majesties from Jersey to Warmwell to Poole',
      'Immediately volunteered for Far East duty despite war ending',
      'His reason: "while there were tens of thousands of British and allied prisoners of war still in Japanese hands I would consider it a disgrace to stay in England"',
    ],
    quotes: [
      { 
        text: "What a spectacle! Heligoland is a tiny island Fortress in North Sea - and to see it receive everything Bomber Command could dump on it.", 
        source: 'Pilot Notes, April 1945' 
      },
      {
        text: "With the war in Europe obviously about to end I volunteered for the Far East. Incredibly my application was turned down as I had not given any reason. I then wrote that while there were many tens of thousands of British and allied prisoners of war still in Japanese hands I would consider it a disgrace to stay in England.",
        source: 'Pilot Notes, April 1945'
      },
      {
        text: "A great honour for the Squadron to escort Their Majesties - but we all just about ran out of gas!",
        source: 'Pilot Notes, June 7, 1945'
      }
    ],
    stats: [
      { label: 'European Service', value: '~1 year' },
      { label: 'Hours (313 Sqdn)', value: '216.35' },
      { label: 'Royal Escort', value: 'King & Queen' },
    ],
    locations: ['RAF Bradwell Bay', 'Jersey', 'Warmwell', 'Poole'],
  },
  {
    id: 'road',
    title: 'The Road Back',
    subtitle: 'Ferrying Spitfires Across India',
    dateRange: 'July 1945 - March 1946',
    phase: 'road',
    icon: Globe,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-900/30 to-stone-900',
    summary: 'A new adventure begins — ferrying Spitfires across the vast subcontinent of India, reconnecting with family along the way.',
    details: [
      'July: 30 hours flying in 3 days — London to Karachi via Sardinia, North Africa, Egypt, Iraq, Persian Gulf',
      'Based at R.A.F. Station Drigh Road, Karachi',
      'Ferried Spitfire XIVs across India: Jodhpur, Delhi, Allahabad, Calcutta, Rangoon, Bangkok',
      'Visited Uncle Frank in Calcutta multiple times — "By now Frank was getting used to his flying nephew!"',
      'Christmas at Ranchi with Aunt Freda at Mesra — the old Binning family home',
      'August 26: The monsoon crash — "wrote off my Lysander, a Beaufighter and seriously damaged a Spitfire!"',
    ],
    quotes: [
      { 
        text: "30 hours flying - over 3 days London - Karachi.", 
        source: 'Pilot Notes, July 1945' 
      },
      {
        text: "Just a month after arriving in India I 'navigated' a trip via Ranchi - and paid a surprise visit to Aunt Freda at Mesra - the old Binning family home.",
        source: 'Pilot Notes, August 1945'
      },
      {
        text: "Flew at zero feet through a monsoon storm and on landing the whole aerodrome was under inches of water. This got into my brakes and before I finally stopped I'd written off my Lysander, a Beaufighter and seriously damaged a Spitfire! Luckily, the war had just finished.",
        source: 'Pilot Notes, August 26, 1945'
      },
      {
        text: "Developed engine trouble (!) in Calcutta - so took the train to Ranchi for Christmas. (Who could ask for anything more) (And when I got back to base on New Years Eve they asked why I hadn't stayed with my family for an extra week!)",
        source: 'Pilot Notes, December 1945'
      }
    ],
    stats: [
      { label: 'India Service', value: '9 months' },
      { label: 'Ferry Flights', value: '50+' },
      { label: 'New Aircraft', value: 'Spitfire XIV' },
    ],
    image: '/empire-flying-boat.png',
    locations: ['Karachi', 'Jodhpur', 'Delhi', 'Allahabad', 'Calcutta', 'Ranchi', 'Rangoon', 'Bangkok'],
  },
  {
    id: 'return',
    title: 'Return with the Elixir',
    subtitle: 'A Hero Comes Home',
    dateRange: 'March 1946',
    phase: 'return',
    icon: Heart,
    color: 'text-rose-400',
    bgGradient: 'from-rose-900/30 to-stone-900',
    summary: 'After over six years of service, Robin Glen returns home — carrying with him memories, bonds, and a story for the ages.',
    details: [
      'Final goodbye to Uncle Frank in Calcutta',
      'Over 6 years of RAF service complete',
      'Total flying hours: ~700+',
      'Travelled to Bombay by train',
      'Sailed home on the M.V. "Durham Castle"',
      'A young pilot who became a veteran — from training to D-Day to India',
    ],
    quotes: [
      { 
        text: "Said goodbye to Frank. This was my last visit - as my 'demob' ticket was coming up. Travelled to Bombay by train and back home by sea - on the M.V. 'Durham Castle' - after over 6 years in RAF.", 
        source: 'Final Logbook Entry, March 1946' 
      }
    ],
    stats: [
      { label: 'Total Service', value: '6+ years' },
      { label: 'Total Hours', value: '~700' },
      { label: 'Aircraft Types', value: '15+' },
    ],
    locations: ['Bombay', 'M.V. Durham Castle', 'Home'],
  },
];

// Individual chapter component
const ChapterCard: React.FC<{ 
  chapter: JourneyChapter; 
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ chapter, index, isExpanded, onToggle }) => {
  const Icon = chapter.icon;
  const contentRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="relative">
      {/* Timeline connector */}
      {index < JOURNEY_CHAPTERS.length - 1 && (
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-stone-600 to-stone-700 -z-10" />
      )}
      
      <div 
        className={`relative mb-8 transition-all duration-500 ${isExpanded ? 'mb-12' : ''}`}
      >
        {/* Timeline dot */}
        <div className={`absolute left-0 top-0 w-12 h-12 rounded-full bg-stone-800 border-2 border-stone-600 flex items-center justify-center z-10 ${chapter.color} transition-all duration-300 ${isExpanded ? 'scale-110 border-amber-500' : 'hover:scale-105'}`}>
          <Icon size={20} />
        </div>
        
        {/* Card */}
        <div 
          className={`ml-20 bg-gradient-to-br ${chapter.bgGradient} rounded-xl border border-stone-700 overflow-hidden cursor-pointer transition-all duration-300 hover:border-stone-500 ${isExpanded ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : ''}`}
          onClick={onToggle}
        >
          {/* Header */}
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${chapter.color}`}>
                    Chapter {index + 1}
                  </span>
                  <span className="text-stone-500 text-xs">•</span>
                  <span className="text-stone-400 text-xs font-mono flex items-center gap-1">
                    <Calendar size={10} />
                    {chapter.dateRange}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-stone-100 mb-1">{chapter.title}</h3>
                <p className="text-stone-400 text-sm italic">{chapter.subtitle}</p>
              </div>
              <button className={`p-2 rounded-lg transition-all duration-300 ${isExpanded ? 'bg-amber-500/20 text-amber-400 rotate-180' : 'bg-stone-700/50 text-stone-400 hover:bg-stone-700'}`}>
                <ChevronDown size={20} />
              </button>
            </div>
            
            <p className="mt-4 text-stone-300 leading-relaxed">{chapter.summary}</p>
            
            {/* Stats preview */}
            {chapter.stats && !isExpanded && (
              <div className="flex gap-4 mt-4 pt-4 border-t border-stone-700/50">
                {chapter.stats.slice(0, 3).map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-lg font-bold ${chapter.color}`}>{stat.value}</div>
                    <div className="text-xs text-stone-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Expanded content */}
          <div 
            ref={contentRef}
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="px-5 pb-5 space-y-6">
              {/* Image */}
              {chapter.image && (
                <div className="relative rounded-lg overflow-hidden border border-stone-600">
                  <img 
                    src={chapter.image} 
                    alt={chapter.title}
                    className="w-full h-48 object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />
                </div>
              )}
              
              {/* Details */}
              <div>
                <h4 className="text-sm font-semibold text-stone-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ChevronRight size={14} className={chapter.color} />
                  Key Events
                </h4>
                <ul className="space-y-2">
                  {chapter.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-3 text-stone-300 text-sm">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${chapter.color.replace('text-', 'bg-')} shrink-0`} />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Quotes */}
              {chapter.quotes.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                    <Quote size={14} className={chapter.color} />
                    From the Logbook
                  </h4>
                  {chapter.quotes.map((quote, i) => (
                    <blockquote key={i} className="relative pl-4 border-l-2 border-amber-500/50">
                      <p className="text-stone-200 italic text-sm leading-relaxed">"{quote.text}"</p>
                      <cite className="block mt-2 text-xs text-stone-500 not-italic">— {quote.source}</cite>
                    </blockquote>
                  ))}
                </div>
              )}
              
              {/* Stats */}
              {chapter.stats && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-stone-800/50 rounded-lg">
                  {chapter.stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className={`text-2xl font-bold ${chapter.color}`}>{stat.value}</div>
                      <div className="text-xs text-stone-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Locations */}
              {chapter.locations && (
                <div className="flex flex-wrap gap-2">
                  {chapter.locations.map((location, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-stone-700/50 rounded text-xs text-stone-300">
                      <MapPin size={10} className={chapter.color} />
                      {location}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Hero's Journey component
export const HeroJourney: React.FC = () => {
  const [expandedChapter, setExpandedChapter] = useState<string | null>('trial');
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      setScrollProgress(progress);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-stone-900">
      {/* Progress bar */}
      <div className="fixed top-12 left-0 right-0 h-1 bg-stone-800 z-30">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-150"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
      
      {/* Hero header */}
      <div className="relative bg-gradient-to-b from-stone-950 via-stone-900 to-stone-900 py-16 px-8 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
          }} />
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center">
              <Star size={32} className="text-amber-500" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-stone-100 tracking-tight">
                The Hero's Journey
              </h1>
              <p className="text-stone-400 text-lg mt-1">F/Lt Robin A. Glen, RAF</p>
            </div>
          </div>
          
          <p className="text-xl text-stone-300 leading-relaxed max-w-3xl mb-8">
            From training fields to the beaches of Normandy, from the skies over Germany to the vast expanse of India — 
            this is the story of one pilot's extraordinary journey through World War II.
          </p>
          
          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Clock, label: 'Total Service', value: '6+ Years' },
              { icon: Plane, label: 'Flying Hours', value: '~700' },
              { icon: Target, label: 'Combat Missions', value: '51+' },
              { icon: Users, label: 'Squadrons', value: '313 Czech + Ferry' },
            ].map((stat, i) => (
              <div key={i} className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
                <stat.icon size={20} className="text-amber-500 mb-2" />
                <div className="text-2xl font-bold text-stone-100">{stat.value}</div>
                <div className="text-xs text-stone-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="relative">
          {JOURNEY_CHAPTERS.map((chapter, index) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              index={index}
              isExpanded={expandedChapter === chapter.id}
              onToggle={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
            />
          ))}
        </div>
        
        {/* Epilogue */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/30 mb-6">
            <Star size={16} className="text-amber-500" />
            <span className="text-amber-400 text-sm font-medium">Per Ardua Ad Astra</span>
            <Star size={16} className="text-amber-500" />
          </div>
          <blockquote className="text-xl text-stone-300 italic max-w-2xl mx-auto">
            "Through Adversity to the Stars"
          </blockquote>
          <p className="text-stone-500 mt-4 text-sm">
            The motto of the Royal Air Force — embodied in the service of F/Lt Robin A. Glen
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroJourney;
