import React, { useState, useRef, useEffect } from 'react';
import { 
  Plane, 
  Target, 
  Shield, 
  Award, 
  Compass,
  Flame,
  Crown,
  Home,
  ChevronDown,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Quote
} from 'lucide-react';

interface JourneyChapter {
  id: string;
  phase: string;
  title: string;
  subtitle: string;
  dateRange: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  summary: string;
  keyMoments: {
    date: string;
    title: string;
    description: string;
    quote?: string;
    significance?: 'high' | 'critical';
  }[];
  stats?: {
    label: string;
    value: string;
  }[];
}

const journeyChapters: JourneyChapter[] = [
  {
    id: 'training',
    phase: 'ACT I',
    title: 'The Making of a Pilot',
    subtitle: 'Training & Preparation',
    dateRange: '1941 - May 1944',
    icon: <Plane className="w-6 h-6" />,
    color: 'text-sky-400',
    bgGradient: 'from-sky-900/40 to-sky-950/60',
    summary: 'Robin Glen earned his pilot wings and spent 30 months in intensive training before ever seeing combat. He mastered the Tiger Moth, Harvard, Master, and finally the legendary Spitfire.',
    keyMoments: [
      {
        date: 'January 1944',
        title: 'The Lost Logbook',
        description: 'Robin\'s original logbook was stolen on January 4th, 1944. He meticulously reconstructed his flying times from memory - over 330 hours across multiple aircraft types.',
      },
      {
        date: 'March 1944',
        title: 'Mastering the Spitfire',
        description: 'At I.T.E.U. Tealing, Robin began his transition to the Spitfire. Familiarization flights, aerobatics, formation flying, and sector reconnaissance prepared him for combat.',
      },
      {
        date: 'April 1944',
        title: 'Combat Training',
        description: 'Hurricane training brought dive bombing, air-to-ground firing, and low-level cross-country missions. Robin was assessed as "Good Average" as a fighter pilot with "Above Average" rocket proficiency.',
      },
      {
        date: 'May 26, 1944',
        title: 'Ready for War',
        description: 'With 273 hours as pilot, Robin completed his assessment. Four days later, he would join an operational squadron just in time for the greatest invasion in history.',
        significance: 'high'
      }
    ],
    stats: [
      { label: 'Training Hours', value: '273' },
      { label: 'Aircraft Types', value: '6' },
      { label: 'Months Training', value: '30' }
    ]
  },
  {
    id: 'dday',
    phase: 'ACT II',
    title: 'Trial by Fire',
    subtitle: 'D-Day & The Normandy Campaign',
    dateRange: 'June 1944',
    icon: <Flame className="w-6 h-6" />,
    color: 'text-orange-500',
    bgGradient: 'from-orange-900/40 to-red-950/60',
    summary: 'After 30 months of preparation, Robin\'s first combat operations came during the most consequential military operation in history - the D-Day invasion of Normandy.',
    keyMoments: [
      {
        date: 'May 30, 1944',
        title: 'Posted to 313 Squadron',
        description: 'Robin arrived at the temporary airfield at Appledram in a grey Spitfire Mk. IX. He joined the Czech 313 Squadron of the 2nd Tactical Air Force, just one week before the invasion.',
        quote: 'I\'d had my pilot\'s wings for 30 months - and arrived on a Grey Spitfire Mk. IX at a temporary airfield at Appledean.',
        significance: 'high'
      },
      {
        date: 'June 5, 1944',
        title: 'The Briefing',
        description: 'At the comprehensive pre-invasion briefing, pilots were told the outcome of the war required armies to get safely ashore at all costs. The 2nd TAF had enough reserves for all squadrons to suffer 90% casualties on Day 1 and be fully operational on Day 2.',
        quote: 'There were enough pilots and aircraft in close reserve for all squadrons to suffer 90% casualties on the first day - and they\'d be fully up to strength on Day 2.',
        significance: 'critical'
      },
      {
        date: 'June 6, 1944',
        title: 'D-Day: Beach Head Patrol',
        description: 'Robin flew two hours over the tiny beachhead where Allied forces struggled to get ashore. His Spitfire provided vital air cover as history unfolded below.',
        quote: 'What could be a more dramatic way of starting on ops than to fly daily over the tiny beach head where the Allies struggled to get ashore and open up the second front.',
        significance: 'critical'
      },
      {
        date: 'June 19, 1944',
        title: 'Attacking the V-1 Sites',
        description: 'Robin participated in dive bombing attacks on V-1 "Doodlebug" rocket launching sites with 500 lb bombs, helping defend Britain from Hitler\'s terror weapons.',
      },
      {
        date: 'June 24, 1944',
        title: 'Shot Up Over France',
        description: 'During two nights behind enemy lines, Robin\'s Spitfire sustained Ack-Ack damage to the tailplane. He survived and flew back to base.',
        quote: 'Got shot up - my plane\'s tailplane sustaining Ack Ack damage.',
        significance: 'high'
      }
    ],
    stats: [
      { label: 'Combat Sorties', value: '20+' },
      { label: 'Hours Over Normandy', value: '36' },
      { label: 'Days in Combat', value: '24' }
    ]
  },
  {
    id: 'bomber-escort',
    phase: 'ACT III',
    title: 'Into the Reich',
    subtitle: 'Bomber Escort & Deep Penetration',
    dateRange: 'July 1944 - March 1945',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-red-500',
    bgGradient: 'from-red-900/40 to-red-950/60',
    summary: 'As the war progressed, Robin flew escort missions protecting massive bomber formations striking deep into Nazi Germany - witnessing both the devastating power and terrible cost of strategic bombing.',
    keyMoments: [
      {
        date: 'July 2, 1944',
        title: 'Witnessing Devastation',
        description: 'Robin witnessed the massive Allied bombing raids on Caen - 700-800 bombers per hour in daylight. The pattern bombing was devastating, as was the anti-aircraft fire.',
        quote: 'The V.1 A.A.F (German show) 700-800 per hour daylight-raids on Caen. The pattern bombing was devastating. So was the ack ack.',
      },
      {
        date: 'July 8, 1944',
        title: 'Low-Level Strike',
        description: 'On a low-level sweep deep into occupied France at 15,000 feet, then dropping to tree-top level, Robin strafed an airfield and engaged an anti-aircraft gun crew.',
        quote: 'At one point we swept across an airfield and I wiped out the crew of an A.A. port scrambling to train landing planes.',
        significance: 'high'
      },
      {
        date: 'October 1944',
        title: 'The Move North',
        description: 'The squadron relocated from the Orkneys to RAF North Weald, northeast of London. Robin flew the long journey south, later remembering the sight of the squadron\'s final formation over Scotland.',
      },
      {
        date: 'November 27, 1944',
        title: 'Thousand Bomber Raid',
        description: 'On a gloomy but clear day, Robin provided escort for a 1000+ bomber raid on Germany. The destruction was overwhelming.',
        quote: 'Gloomy but a clear day was a 1000 Bomber Raid. What devastation.',
        significance: 'high'
      },
      {
        date: 'December 8, 1944',
        title: 'The Brussels Relay',
        description: 'Flying at 15,000 feet over Brussels to relay radio messages, Robin helped abort a mission due to rapidly deteriorating weather. Of the 37 Spitfires in the wing, only two made it back to England.',
        quote: 'Of the 37 Spitfires in our wing, I was one of only two who made it across the sea back to England.',
        significance: 'critical'
      },
      {
        date: 'Winter 1944-45',
        title: 'The Brutal Winter',
        description: 'Based at Bradwell Bay during a bitterly cold winter with no fuel for fires, pilots were billeted in a large country house with fellow officers sharing rooms.',
      }
    ],
    stats: [
      { label: 'Escort Missions', value: '51' },
      { label: 'Target Cities', value: '12+' },
      { label: 'Combat Hours', value: '133' }
    ]
  },
  {
    id: 'victory',
    phase: 'ACT IV',
    title: 'Victory in Europe',
    subtitle: 'The Final Push & VE Day',
    dateRange: 'April - June 1945',
    icon: <Crown className="w-6 h-6" />,
    color: 'text-amber-400',
    bgGradient: 'from-amber-900/40 to-amber-950/60',
    summary: 'As the Third Reich crumbled, Robin flew his final combat missions over Europe, witnessed the spectacular destruction of the Heligoland fortress, and received the honor of escorting the King and Queen.',
    keyMoments: [
      {
        date: 'April 19, 1945',
        title: 'Volunteering for the Far East',
        description: 'With victory in Europe imminent, Robin volunteered for service in the Far East. His first application was rejected for not providing a reason.',
        quote: 'I wrote that while there were many tens of thousands British and allied prisoners of war still in Japanese hands I would consider it a disgrace to stay in England.',
        significance: 'high'
      },
      {
        date: 'April 19-25, 1945',
        title: 'Heligoland Attacks',
        description: 'Robin provided fighter cover for the massive bombing raids on Heligoland, a tiny island fortress in the North Sea. He watched as Bomber Command unleashed everything they had.',
        quote: 'What a spectacle! Heligoland is a tiny island Fortress in North Sea - and to see it receive everything Bomber Command could dump on it.',
      },
      {
        date: 'May 7, 1945',
        title: 'VE Day Eve',
        description: 'Robin flew a height climb on the eve of Victory in Europe. The war that had consumed six years of his life was finally ending.',
      },
      {
        date: 'May 22, 1945',
        title: 'Solo to Guernsey',
        description: 'Robin flew solo to St. Peter Port, Guernsey to deliver an urgent package - a sign of the post-war period beginning.',
      },
      {
        date: 'June 7, 1945',
        title: 'Escorting Royalty',
        description: 'In a great honor for 313 Squadron, Robin helped escort King George VI and Queen Elizabeth from Jersey to Warmwell to Poole. The squadron nearly ran out of fuel.',
        quote: 'A great honour for the Squadron to escort Their Majesties - but we all just about ran out of gas!',
        significance: 'critical'
      },
      {
        date: 'June 19, 1945',
        title: 'Farewell to 313 Squadron',
        description: 'After 133 hours of operational flying and 51 combat missions with the Czech 313 Squadron, Robin received orders to ferry Spitfires to the Far East.',
      }
    ],
    stats: [
      { label: 'Total Ops Hours', value: '133' },
      { label: 'With 313 Sqn', value: '13 months' },
      { label: 'VE Day Rank', value: 'F/Lt' }
    ]
  },
  {
    id: 'india',
    phase: 'ACT V',
    title: 'Journey to the East',
    subtitle: 'India, Burma & Beyond',
    dateRange: 'July 1945 - March 1946',
    icon: <Compass className="w-6 h-6" />,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-900/40 to-emerald-950/60',
    summary: 'While the war with Japan ended, Robin embarked on an epic journey ferrying aircraft across the vast expanse of India, Burma, and Thailand - reconnecting with family and witnessing a subcontinent on the cusp of independence.',
    keyMoments: [
      {
        date: 'July 11-13, 1945',
        title: 'London to Karachi',
        description: 'In just three days and 30 hours of flying, Robin traveled from England to Karachi via Sardinia, North Africa, Egypt, Iraq, and the Persian Gulf.',
        quote: '30 hours flying - over 3 days London - Karachi.',
      },
      {
        date: 'July 25, 1945',
        title: 'Reunion with Uncle Frank',
        description: 'Only 2½ weeks after arriving in India, Robin tracked down his Uncle Frank in Calcutta - the beginning of several family reunions during his time in the East.',
        significance: 'high'
      },
      {
        date: 'August 1945',
        title: 'Victory over Japan',
        description: 'The war ended while Robin was ferrying aircraft across India. "Luckily, the war had just finished" he would later note about a crash.',
      },
      {
        date: 'August 11-18, 1945',
        title: 'Surprise Visit to Mesra',
        description: 'Robin navigated to Ranchi and paid a surprise visit to Aunt Freda at Mesra - the old Binning family home - before continuing to Calcutta to visit Uncle Frank again.',
        quote: 'Just a month after arriving in India I navigated a trip via Ranchi - and paid a surprise visit to Aunt Freda at Mesra - the old Binning family home.',
        significance: 'high'
      },
      {
        date: 'August 26, 1945',
        title: 'The Monsoon Crash',
        description: 'Flying at zero feet through a monsoon storm, Robin landed at a flooded aerodrome. Water got into his brakes and before he stopped, he had written off his Lysander, a Beaufighter, and damaged a Spitfire.',
        quote: 'Flew at zero feet through a monsoon storm... before I finally stopped I\'d written off my Lysander, a Beautifighter and seriously damaged a spitfire! Luckily, the war had just finished.',
        significance: 'high'
      },
      {
        date: 'November 1945',
        title: 'To Bangkok and Back',
        description: 'Robin ferried Spitfire XIVs across the subcontinent - Karachi to Bangkok via Calcutta, Akyab, and Rangoon - then returned via Sunderland flying boats.',
      },
      {
        date: 'December 1945',
        title: 'Christmas at Ranchi',
        description: 'When Robin\'s aircraft developed "engine trouble" in Calcutta, he conveniently took the train to Ranchi to spend Christmas with family. His base later asked why he hadn\'t stayed an extra week!',
        quote: 'Developed engine trouble (!) in Calcutta - so took the train to Ranchi for Christmas. Who could ask for anything more.',
      }
    ],
    stats: [
      { label: 'Aircraft Ferried', value: '20+' },
      { label: 'Countries', value: '7' },
      { label: 'Family Reunions', value: '5' }
    ]
  },
  {
    id: 'return',
    phase: 'EPILOGUE',
    title: 'Return with Honor',
    subtitle: 'The Journey Home',
    dateRange: 'March 1946',
    icon: <Home className="w-6 h-6" />,
    color: 'text-violet-400',
    bgGradient: 'from-violet-900/40 to-violet-950/60',
    summary: 'After more than six years of service to King and Country, Flight Lieutenant R.A. Glen said goodbye to family in India and began the long journey home by sea aboard the M.V. Durham Castle.',
    keyMoments: [
      {
        date: 'March 6, 1946',
        title: 'Last Flight to Ranchi',
        description: 'Dennis Yeardly flew Robin to Ranchi for one final visit. Robin showed him Mesra and stayed on with Uncle Frank for another week.',
      },
      {
        date: 'March 17, 1946',
        title: 'Final Flight',
        description: 'Robin\'s last recorded flight - aboard an Empire Flying Boat from Gwalior to Karachi. After 697 hours in the air, his flying days in the RAF were over.',
        significance: 'high'
      },
      {
        date: 'March 1946',
        title: 'Journey Home',
        description: 'Robin traveled to Bombay by train and boarded the M.V. Durham Castle for the sea voyage home to England - closing the chapter on over six years in the Royal Air Force.',
        quote: 'Said goodbye to Frank. This was my last visit - as my "demob" ticket was coming up. Travelled to Bombay by train and back home by sea - on the M.V. "Durham Castle" - after over 6 years in RAF.',
        significance: 'critical'
      }
    ],
    stats: [
      { label: 'Total Flying Hours', value: '697' },
      { label: 'Aircraft Types', value: '15+' },
      { label: 'Years of Service', value: '6+' }
    ]
  }
];

const ChapterCard: React.FC<{ 
  chapter: JourneyChapter; 
  isExpanded: boolean; 
  onToggle: () => void;
  index: number;
}> = ({ chapter, isExpanded, onToggle, index }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="relative">
      {/* Timeline connector */}
      {index < journeyChapters.length - 1 && (
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-stone-600 to-stone-700 z-0" />
      )}
      
      <div 
        className={`relative z-10 bg-gradient-to-br ${chapter.bgGradient} rounded-xl border border-stone-700/50 overflow-hidden transition-all duration-500 hover:border-stone-600/70 ${isExpanded ? 'ring-1 ring-amber-500/30' : ''}`}
      >
        {/* Header - Always visible */}
        <button
          onClick={onToggle}
          className="w-full text-left p-6 focus:outline-none group"
        >
          <div className="flex items-start gap-4">
            {/* Icon Circle */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-stone-800/80 border-2 border-stone-600 flex items-center justify-center ${chapter.color} group-hover:border-stone-500 transition-colors`}>
              {chapter.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold tracking-widest text-stone-500 uppercase">
                  {chapter.phase}
                </span>
                <span className="text-xs text-stone-600">•</span>
                <span className="text-xs text-stone-500 font-mono">
                  {chapter.dateRange}
                </span>
              </div>
              
              <h3 className={`text-xl font-bold ${chapter.color} mb-1 group-hover:brightness-110 transition-all`}>
                {chapter.title}
              </h3>
              
              <p className="text-sm text-stone-400">
                {chapter.subtitle}
              </p>
            </div>
            
            <div className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-amber-500/20 rotate-180' : 'bg-stone-700/50 group-hover:bg-stone-700'}`}>
              <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-amber-400' : 'text-stone-400'}`} />
            </div>
          </div>
          
          {/* Summary - Always visible */}
          <p className="mt-4 text-stone-300 leading-relaxed text-sm">
            {chapter.summary}
          </p>
          
          {/* Stats Pills */}
          {chapter.stats && (
            <div className="flex flex-wrap gap-2 mt-4">
              {chapter.stats.map((stat, i) => (
                <div key={i} className="px-3 py-1 bg-stone-800/60 rounded-full border border-stone-700/50">
                  <span className="text-xs text-stone-500">{stat.label}: </span>
                  <span className={`text-xs font-bold ${chapter.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          )}
        </button>
        
        {/* Expandable Content */}
        <div
          ref={contentRef}
          className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-6 pb-6">
            <div className="border-t border-stone-700/50 pt-6">
              <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Key Moments
              </h4>
              
              <div className="space-y-4">
                {chapter.keyMoments.map((moment, i) => (
                  <div 
                    key={i}
                    className={`relative pl-6 border-l-2 ${
                      moment.significance === 'critical' 
                        ? 'border-amber-500' 
                        : moment.significance === 'high'
                        ? 'border-amber-600/50'
                        : 'border-stone-700'
                    }`}
                  >
                    {/* Date marker */}
                    <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full ${
                      moment.significance === 'critical'
                        ? 'bg-amber-500 ring-2 ring-amber-500/30'
                        : moment.significance === 'high'
                        ? 'bg-amber-600'
                        : 'bg-stone-600'
                    }`} />
                    
                    <div className="text-xs font-mono text-stone-500 mb-1">
                      {moment.date}
                    </div>
                    
                    <h5 className={`font-semibold mb-2 ${
                      moment.significance === 'critical' 
                        ? 'text-amber-400' 
                        : moment.significance === 'high'
                        ? 'text-stone-200'
                        : 'text-stone-300'
                    }`}>
                      {moment.title}
                    </h5>
                    
                    <p className="text-sm text-stone-400 leading-relaxed">
                      {moment.description}
                    </p>
                    
                    {moment.quote && (
                      <blockquote className="mt-3 pl-4 border-l-2 border-amber-500/30 italic text-sm text-stone-400">
                        <Quote className="w-4 h-4 text-amber-500/50 mb-1" />
                        "{moment.quote}"
                        <cite className="block text-xs text-stone-500 mt-1 not-italic">
                          — Robin Glen's Logbook
                        </cite>
                      </blockquote>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeroJourney: React.FC = () => {
  const [expandedChapter, setExpandedChapter] = useState<string | null>('training');
  const [showAllExpanded, setShowAllExpanded] = useState(false);
  
  const handleToggle = (id: string) => {
    if (showAllExpanded) return;
    setExpandedChapter(expandedChapter === id ? null : id);
  };
  
  const toggleAll = () => {
    setShowAllExpanded(!showAllExpanded);
    if (!showAllExpanded) {
      setExpandedChapter(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('/standing-by-spitfire.png')] bg-cover bg-center opacity-10" />
        
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20 mb-6">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              The Hero's Journey
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-stone-100 mb-4">
            Flight Lieutenant <span className="text-amber-400">R.A. Glen</span>
          </h1>
          
          <p className="text-xl text-stone-400 mb-2">
            313 (Czech) Squadron • Royal Air Force
          </p>
          
          <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed">
            From eager trainee to battle-hardened veteran of D-Day, from the skies over the Third Reich 
            to the vast expanse of India — this is the extraordinary wartime journey of one Spitfire pilot.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">697</div>
              <div className="text-xs text-stone-500 uppercase tracking-wide">Flying Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">51</div>
              <div className="text-xs text-stone-500 uppercase tracking-wide">Combat Missions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">6+</div>
              <div className="text-xs text-stone-500 uppercase tracking-wide">Years Service</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">15+</div>
              <div className="text-xs text-stone-500 uppercase tracking-wide">Aircraft Types</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline Controls */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-stone-300 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Timeline
          </h2>
          <button
            onClick={toggleAll}
            className="text-sm text-stone-400 hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            {showAllExpanded ? 'Collapse All' : 'Expand All'}
            <ChevronRight className={`w-4 h-4 transition-transform ${showAllExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Journey Timeline */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="space-y-6">
          {journeyChapters.map((chapter, index) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              isExpanded={showAllExpanded || expandedChapter === chapter.id}
              onToggle={() => handleToggle(chapter.id)}
              index={index}
            />
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800/50 rounded-full border border-stone-700/50">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-stone-400">
              Explore the Flight Book & Map to see each mission in detail
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroJourney;
