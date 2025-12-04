import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plane, Target, Shield, Award, Map, Compass, Star, Crown, Heart } from 'lucide-react';

// Hero's Journey chapter structure
interface JourneyChapter {
  id: string;
  title: string;
  subtitle: string;
  dateRange: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  episodes: Episode[];
}

interface Episode {
  id: string;
  date: string;
  title: string;
  location?: string;
  description: string;
  quote?: string;
  significance: 'milestone' | 'action' | 'reflection' | 'personal';
  flightHours?: string;
  aircraft?: string;
}

const journeyData: JourneyChapter[] = [
  {
    id: 'call',
    title: 'The Call to Adventure',
    subtitle: 'Training & Preparation',
    dateRange: 'January - May 1944',
    icon: <Compass className="w-6 h-6" />,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-900/30 to-emerald-950/10',
    episodes: [
      {
        id: 'call-1',
        date: 'January 4, 1944',
        title: 'A New Beginning',
        description: 'Robin\'s previous logbook was stolen, forcing him to start fresh. What remained were the approximate totals of his flying experience: 331 hours across Tiger Moths, Harvards, Masters, and Spitfires.',
        significance: 'milestone',
        flightHours: '331:00 total',
      },
      {
        id: 'call-2',
        date: 'March - April 1944',
        title: 'Advanced Fighter Training',
        location: 'I.T.E.U. Tealing, Scotland',
        description: 'Intensive training on Spitfire Is and Vs, Hurricane IIs. Practiced formation flying, aerobatics, dive bombing, and air-to-ground firing. This was the final preparation before joining a frontline squadron.',
        significance: 'action',
        flightHours: '24:45',
        aircraft: 'Spitfire I & V, Hurricane II',
      },
      {
        id: 'call-3',
        date: 'May 26, 1944',
        title: 'Assessment Complete',
        description: 'Final flying assessment before operational posting. Rated "Good Average" as a Fighter Pilot, "Above Average" with Rocket Projectiles. Total flying hours now exceeded 370.',
        quote: 'Assessment: AS A F. PILOT: Good Average. IN S.B.A. w. R.P.: Above Average. Any Points in Flying or Airmanship Which Should Be Watched: None.',
        significance: 'milestone',
      },
      {
        id: 'call-4',
        date: 'May 30, 1944',
        title: 'Joining 313 Squadron',
        location: 'Appledram, England',
        description: 'Posted to 313 Czech Squadron in the 2nd Tactical Air Force. Robin arrived on a grey Spitfire Mk. IX at a temporary airfield, just days before the greatest amphibious invasion in history.',
        quote: 'I\'d had my pilot\'s wings for 30 months - and arrived on a Grey Spitfire Mk. IX at a temporary airfield at Appledram... We were there about a week before the Invasion.',
        significance: 'milestone',
        aircraft: 'Spitfire Mk. IX',
      },
    ],
  },
  {
    id: 'threshold',
    title: 'Crossing the Threshold',
    subtitle: 'D-Day & The Trial by Fire',
    dateRange: 'June 1944',
    icon: <Target className="w-6 h-6" />,
    color: 'text-red-400',
    bgGradient: 'from-red-900/30 to-red-950/10',
    episodes: [
      {
        id: 'threshold-1',
        date: 'June 2, 1944',
        title: 'Eve of Invasion',
        location: 'English Channel',
        description: 'Robin flew convoy patrol over what would become the invasion fleet. Thousands of ships gathering in the Channel, preparing for the greatest amphibious assault in history.',
        quote: 'This "Convoy" was in Part - the Invasion Fleet.',
        significance: 'action',
        aircraft: 'Spitfire IX',
      },
      {
        id: 'threshold-2',
        date: 'June 5, 1944',
        title: 'The Briefing',
        description: 'At the comprehensive pre-invasion briefing, pilots were told the stark reality: victory required the armies to get ashore at all costs. The 2nd Tactical Air Force was prepared for catastrophic losses.',
        quote: 'There were enough pilots and aircraft in close reserve for all squadrons to suffer 90% casualties on the first day - and they\'d be fully up to strength and operational pilots and planes on Day 2.',
        significance: 'reflection',
      },
      {
        id: 'threshold-3',
        date: 'June 5-6, 1944',
        title: 'D-Day: Beach Head Patrol',
        location: 'Normandy, France',
        description: 'After 30 months of training and waiting, Robin\'s first combat mission was flying over the Normandy beaches on D-Day itself. For the next weeks, he flew daily patrols over the tiny beachhead where Allied forces struggled to gain a foothold.',
        quote: '30 months elapsed from the time I got my pilots "wings" to getting to a squadron - and what could be a more dramatic way of starting on ops\' than to fly daily over the tiny beach head where the Allies struggled to get ashore and open up the second front.',
        significance: 'milestone',
        flightHours: '1:50',
        aircraft: 'Spitfire IX',
      },
      {
        id: 'threshold-4',
        date: 'June 19, 1944',
        title: 'Striking Back: V-1 Sites',
        description: 'Robin participated in dive bombing attacks on German V-1 rocket launching sites - the "Doodlebugs" that were terrorizing London.',
        quote: 'Attack on V.1 Rocket launching site - with 500 lb bomb. (Spitfire Mk IX was capable of carrying a 1000 lb bomb)',
        significance: 'action',
        aircraft: 'Spitfire IX',
      },
      {
        id: 'threshold-5',
        date: 'June 24, 1944',
        title: 'Under Fire',
        location: 'Forward ALG B.10, France',
        description: 'Robin spent his first nights just behind the front lines in France, under shellfire. His aircraft was hit by anti-aircraft fire, sustaining damage to the tailplane. Despite this, he continued operations.',
        quote: 'The first of 2 nights just behind the Front Line - under shellfire. Got shot up - my plane\'s tailplane sustaining Ack Ack damage.',
        significance: 'action',
        aircraft: 'Spitfire IX',
      },
    ],
  },
  {
    id: 'trials',
    title: 'The Road of Trials',
    subtitle: 'Deep Into Enemy Territory',
    dateRange: 'July 1944 - February 1945',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-amber-400',
    bgGradient: 'from-amber-900/30 to-amber-950/10',
    episodes: [
      {
        id: 'trials-1',
        date: 'July 2, 1944',
        title: 'The Thousand Bomber Raids',
        location: 'Caen, France',
        description: 'Robin escorted massive bombing raids on German positions. The scale of destruction was unlike anything seen before in warfare.',
        quote: 'The V.1 A.A.F (German show) 700-800 per hour daylight-raids on Caen. The pattern bombing was devastating. So was the ack ack.',
        significance: 'action',
        aircraft: 'Spitfire IX',
      },
      {
        id: 'trials-2',
        date: 'July 8, 1944',
        title: 'Low-Level Combat',
        location: 'Occupied France',
        description: 'A daring low-level sweep deep into occupied France. Flying at treetop height, Robin engaged enemy ground forces, destroying an anti-aircraft gun crew as they scrambled to their positions.',
        quote: 'We flew well into occupied France at about 15,000ft and flew low level sweep in open formation. At one point we swept across an airfield and I wiped out the crew of an A.A. gun scrambling to train on landing planes.',
        significance: 'action',
        aircraft: 'Spitfire IX',
      },
      {
        id: 'trials-3',
        date: 'August 1944',
        title: 'Northern Patrol',
        location: 'Orkney Islands, Scotland',
        description: 'The squadron was transferred to RAF Skeabrae in the Orkneys. From here, Robin flew patrols protecting the Royal Navy\'s Home Fleet at anchor in Scapa Flow.',
        quote: 'Looking down on the Fleet in Scapa Flow.',
        significance: 'reflection',
        aircraft: 'Spitfire V',
      },
      {
        id: 'trials-4',
        date: 'October 1944',
        title: 'Return to the Front',
        location: 'North Weald, England',
        description: 'The squadron moved from the remote Orkneys to North Weald, northeast of London. This peacetime RAF station became Robin\'s favorite posting, conveniently close to London by Underground.',
        quote: 'North Weald - a peacetime airfield (Regular RAF Station) was just a low, decent underground (Tube) journey from The flat at 27, Upper Addison Gdns - off Holland Park Road. It was here I got my Commission. North Weald was definitely my favourite RAF Station.',
        significance: 'milestone',
      },
      {
        id: 'trials-5',
        date: 'October - November 1944',
        title: 'Escorting the Heavies',
        location: 'Over Germany',
        description: 'Robin flew bomber escort missions deep into the German heartland - to Duisburg, Hamburg, Münster, Dortmund, and Bottrop. These 1,000-bomber raids brought unprecedented destruction.',
        quote: 'These Bomber Escort trips took place in all weather... But sometimes we never saw the target – God knew where it was by the ack ack aimed at the bombers. Even the clouds were red – and fires were raging underneath.....',
        significance: 'action',
        flightHours: '22:15',
        aircraft: 'Spitfire IX',
      },
      {
        id: 'trials-6',
        date: 'December 8, 1944',
        title: 'Mission Abort Over Brussels',
        location: 'Brussels Area',
        description: 'Flying at 15,000 feet, Robin relayed the abort message as weather deteriorated rapidly. Of the 37 Spitfires in his wing, only 2 made it back to England. Robin landed at Bradwell Bay; only the Wing Commander made it back to North Weald.',
        quote: 'Of the 37 Spitfires in our wing, I was one of only two who made it across the sea back to England.',
        significance: 'action',
        aircraft: 'Spitfire IX',
      },
      {
        id: 'trials-7',
        date: 'Winter 1944-45',
        title: 'The Bitter Winter',
        location: 'Bradwell Bay, England',
        description: 'The squadron moved to Bradwell Bay in mid-December. After the relative comfort of North Weald, Bradwell Bay was bleak - a bitterly cold winter with no fuel for fires, officers billeted in a large country house.',
        quote: 'After the luxury and sophistication of our base, Bradwell Bay certainly didn\'t live up to North Weald. It was a bitterly cold winter and no fuel for the fire.',
        significance: 'reflection',
      },
    ],
  },
  {
    id: 'transformation',
    title: 'The Transformation',
    subtitle: 'Victory in Europe',
    dateRange: 'March - May 1945',
    icon: <Award className="w-6 h-6" />,
    color: 'text-blue-400',
    bgGradient: 'from-blue-900/30 to-blue-950/10',
    episodes: [
      {
        id: 'transform-1',
        date: 'March 1945',
        title: 'The Final Push',
        location: 'Over Germany',
        description: 'Robin flew his most intensive period of combat operations - bomber escorts to Cologne, Bottrop, Gelsenkirchen, Recklinghausen. These were his 44th through 51st operational missions.',
        significance: 'action',
        flightHours: '26:15',
        aircraft: 'Spitfire IX',
      },
      {
        id: 'transform-2',
        date: 'April 19, 1945',
        title: 'Heligoland',
        location: 'North Sea',
        description: 'Robin provided fighter cover as Bomber Command pounded the island fortress of Heligoland. It was clear the war was ending.',
        quote: 'What a spectacle! Heligoland is a tiny island Fortress in North Sea - and to see it receive everything Bomber Command could dump on it.',
        significance: 'action',
        aircraft: 'Spitfire IX',
      },
      {
        id: 'transform-3',
        date: 'April 1945',
        title: 'Volunteering for the Far East',
        description: 'With the European war winding down, Robin volunteered for service in the Far East. His first application was rejected for not giving a reason. His second application was accepted.',
        quote: 'While there were many tens of thousands British and allied prisoners of war still in Japanese hands I would consider it a disgrace to stay in England.',
        significance: 'milestone',
      },
      {
        id: 'transform-4',
        date: 'May 7, 1945',
        title: 'Victory in Europe',
        description: 'VE Day. The war in Europe was over. Robin had completed over 50 operational missions with 313 Czech Squadron, logging 133 hours and 5 minutes of operational flying time.',
        significance: 'milestone',
        flightHours: '133:05 ops',
      },
      {
        id: 'transform-5',
        date: 'May 22, 1945',
        title: 'Liberation Flight',
        location: 'Guernsey, Channel Islands',
        description: 'Robin flew solo to St. Peter Port, Guernsey, carrying an urgent package to the newly liberated Channel Islands.',
        quote: 'This trip I did alone - to take an urgent package.',
        significance: 'action',
        aircraft: 'Spitfire IX',
      },
      {
        id: 'transform-6',
        date: 'June 7, 1945',
        title: 'Royal Escort',
        location: 'Jersey to Poole',
        description: 'A great honor: 313 Squadron escorted Their Majesties King George VI and Queen Elizabeth from Jersey back to England. The long flight nearly ran them out of fuel.',
        quote: 'A great honour for the Squadron to escort Their Majesties - but we all just about ran out of gas!',
        significance: 'milestone',
        aircraft: 'Spitfire IX',
      },
    ],
  },
  {
    id: 'return',
    title: 'The Return',
    subtitle: 'India & the Journey Home',
    dateRange: 'July 1945 - March 1946',
    icon: <Map className="w-6 h-6" />,
    color: 'text-purple-400',
    bgGradient: 'from-purple-900/30 to-purple-950/10',
    episodes: [
      {
        id: 'return-1',
        date: 'June 1945',
        title: 'The Call from Biggin Hill',
        description: 'A WAAF from the legendary Biggin Hill asked if Robin would be interested in ferrying Spitfires to the Far East. He didn\'t need to be asked twice.',
        quote: 'And then a W.A.A.F. from no less Biggin Hill to ask if I\'d be interested in ferrying Spitfires to the Far East. Ferrying Spitfires! I didn\'t have to be asked twice.',
        significance: 'milestone',
      },
      {
        id: 'return-2',
        date: 'July 11-13, 1945',
        title: 'England to India',
        location: 'Lyneham to Karachi',
        description: 'Robin traveled by Dakota transport across continents: England to Sardinia to North Africa to Egypt to Iraq to the Persian Gulf to Karachi. 30 hours of flying over 3 days, mailing over 500 postcards along the way.',
        quote: '30 hours flying - over 3 days London - Karachi. I mailed over 500 postcards.',
        significance: 'action',
        flightHours: '30:00',
      },
      {
        id: 'return-3',
        date: 'July 1945',
        title: 'RAF Drigh Road',
        location: 'Karachi, India',
        description: 'Robin was based at RAF Station Drigh Road, about 6 miles outside Karachi, for the duration of his service in India. Here he joined 202 Special Ferry Flight.',
        significance: 'reflection',
      },
      {
        id: 'return-4',
        date: 'July 25-26, 1945',
        title: 'Finding Family',
        location: 'Calcutta, India',
        description: 'Only 2½ weeks after arriving in India, Robin tracked down his Uncle Frank in Calcutta. Family connections across the Empire.',
        quote: 'Only 2½ weeks after arriving in India got to track down Uncle Frank in Calcutta.',
        significance: 'personal',
      },
      {
        id: 'return-5',
        date: 'August 11-18, 1945',
        title: 'The Binning Family Home',
        location: 'Ranchi to Calcutta',
        description: 'Robin navigated a ferry flight via Ranchi, paying a surprise visit to his Aunt Freda at Mesra - the old Binning family home. After a night there, he flew on to Calcutta to visit Uncle Frank again.',
        quote: 'Just a month after arriving in India I "navigated" a trip via Ranchi - and paid a surprise visit to Aunt Freda at Mesra - the old Binning family home.',
        significance: 'personal',
      },
      {
        id: 'return-6',
        date: 'August 26, 1945',
        title: 'Monsoon Disaster',
        location: 'Allahabad, India',
        description: 'Flying at zero feet through a monsoon storm, Robin landed on an aerodrome under inches of water. The water got into his brakes, and before he could stop, he had destroyed his Lysander, a Beaufighter, and seriously damaged a Spitfire. Fortunately, the war had just ended.',
        quote: 'Flew at zero feet through a monsoon storm and on landing the whole aerodrome was under inches of water. This got into my brakes and before I finally stopped I\'d written off my Lysander, a Beaufighter and seriously damaged a Spitfire! Luckily, the war had just finished.',
        significance: 'action',
        aircraft: 'Lysander V.9512',
      },
      {
        id: 'return-7',
        date: 'November 1945',
        title: 'To Bangkok',
        location: 'India to Thailand',
        description: 'Robin ferried Spitfire XIVs across the subcontinent and into Southeast Asia, reaching Bangkok and passing within 50 miles of the Khyber Pass.',
        quote: 'Kohat - about 50 miles from the Khyber Pass.',
        significance: 'action',
        aircraft: 'Spitfire XIV',
      },
      {
        id: 'return-8',
        date: 'December 1945',
        title: 'Christmas with Family',
        location: 'Ranchi, India',
        description: 'When Robin\'s aircraft developed "engine trouble" in Calcutta, he took the train to Ranchi for Christmas with family. Upon returning, his commanders asked why he hadn\'t stayed an extra week.',
        quote: 'Developed engine trouble (!) in Calcutta - so took the train to Ranchi for Christmas. (Who could ask for anything more) And when I got back to base on New Years Eve they asked why I hadn\'t stayed with my family for an extra week!',
        significance: 'personal',
      },
      {
        id: 'return-9',
        date: 'February 6-7, 1946',
        title: 'Final Visit to Ranchi',
        location: 'Allahabad to Ranchi',
        description: 'Delivering a Spitfire to Ranchi gave Robin another opportunity to stay with his family. He spent 10 days with the F.P.O. at Ranchi.',
        quote: 'Had to deliver a Spitfire to Ranchi - of all places - so stayed on with F.P.O. at Ranchi for 10 Days. What a life.',
        significance: 'personal',
        aircraft: 'Spitfire XIV',
      },
      {
        id: 'return-10',
        date: 'March 1946',
        title: 'Journey Home',
        location: 'India to England',
        description: 'Robin said his final goodbye to Uncle Frank, his last visit before demobilization. He traveled to Bombay by train and home by sea on the M.V. "Durham Castle" - ending over 6 years of service in the Royal Air Force.',
        quote: 'Said goodbye to Frank. This was my last visit - as my "demob" ticket was coming up. Travelled to Bombay by train and back home by sea - on the M.V. "Durham Castle" - after over 6 years in RAF.',
        significance: 'milestone',
      },
    ],
  },
];

// Stats summary
const careerStats = {
  totalHours: '700+',
  operationalMissions: '51',
  operationalHours: '133:05',
  squadrons: ['313 Czech Squadron', '202 SP Ferry Flight'],
  aircraft: ['Tiger Moth', 'Harvard', 'Master', 'Hurricane', 'Spitfire I/V/IX/XIV', 'Lysander', 'Auster', 'Dakota'],
  theatres: ['Western Europe', 'India', 'Southeast Asia'],
  yearsService: '6+',
};

const EpisodeCard: React.FC<{ episode: Episode; isExpanded: boolean; onClick: () => void }> = ({ 
  episode, 
  isExpanded, 
  onClick 
}) => {
  const significanceColors = {
    milestone: 'border-l-amber-500 bg-amber-500/5',
    action: 'border-l-red-500 bg-red-500/5',
    reflection: 'border-l-blue-500 bg-blue-500/5',
    personal: 'border-l-purple-500 bg-purple-500/5',
  };

  const significanceIcons = {
    milestone: <Star className="w-4 h-4 text-amber-500" />,
    action: <Target className="w-4 h-4 text-red-500" />,
    reflection: <Compass className="w-4 h-4 text-blue-500" />,
    personal: <Heart className="w-4 h-4 text-purple-500" />,
  };

  return (
    <div 
      className={`border-l-4 ${significanceColors[episode.significance]} rounded-r-lg p-4 cursor-pointer transition-all duration-300 hover:bg-stone-700/50`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {significanceIcons[episode.significance]}
            <span className="text-xs font-mono text-stone-400">{episode.date}</span>
            {episode.location && (
              <span className="text-xs text-stone-500">• {episode.location}</span>
            )}
          </div>
          <h4 className="text-lg font-semibold text-stone-100 mb-2">{episode.title}</h4>
          
          {isExpanded && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-stone-300 leading-relaxed">{episode.description}</p>
              
              {episode.quote && (
                <blockquote className="border-l-2 border-stone-600 pl-4 italic text-stone-400 text-sm">
                  "{episode.quote}"
                </blockquote>
              )}
              
              <div className="flex flex-wrap gap-3 pt-2">
                {episode.aircraft && (
                  <span className="inline-flex items-center gap-1 text-xs bg-stone-700 text-stone-300 px-2 py-1 rounded">
                    <Plane className="w-3 h-3" /> {episode.aircraft}
                  </span>
                )}
                {episode.flightHours && (
                  <span className="inline-flex items-center gap-1 text-xs bg-stone-700 text-stone-300 px-2 py-1 rounded">
                    ⏱ {episode.flightHours}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <button className="shrink-0 p-1 text-stone-500 hover:text-stone-300 transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

const ChapterSection: React.FC<{ chapter: JourneyChapter; isActive: boolean; onActivate: () => void }> = ({ 
  chapter, 
  isActive,
  onActivate 
}) => {
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isActive]);

  return (
    <div 
      ref={sectionRef}
      className={`relative rounded-xl border transition-all duration-500 ${
        isActive 
          ? 'border-stone-600 bg-gradient-to-br ' + chapter.bgGradient
          : 'border-stone-800 bg-stone-800/30 hover:border-stone-700'
      }`}
    >
      {/* Chapter Header */}
      <button
        onClick={onActivate}
        className="w-full p-6 text-left flex items-center gap-4"
      >
        <div className={`p-3 rounded-full bg-stone-800 ${chapter.color}`}>
          {chapter.icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${chapter.color}`}>{chapter.title}</h3>
          <p className="text-stone-400 text-sm">{chapter.subtitle}</p>
          <p className="text-stone-500 text-xs font-mono mt-1">{chapter.dateRange}</p>
        </div>
        <div className={`transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>
          <ChevronDown className={`w-6 h-6 ${chapter.color}`} />
        </div>
      </button>

      {/* Episodes */}
      {isActive && (
        <div className="px-6 pb-6 space-y-3 animate-fadeIn">
          {chapter.episodes.map((episode) => (
            <EpisodeCard
              key={episode.id}
              episode={episode}
              isExpanded={expandedEpisode === episode.id}
              onClick={() => setExpandedEpisode(expandedEpisode === episode.id ? null : episode.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TimelineNav: React.FC<{ 
  chapters: JourneyChapter[]; 
  activeChapter: string | null;
  onSelect: (id: string) => void;
}> = ({ chapters, activeChapter, onSelect }) => {
  return (
    <div className="hidden lg:flex flex-col gap-2 sticky top-8">
      <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 px-2">Journey Stages</h4>
      {chapters.map((chapter, index) => (
        <button
          key={chapter.id}
          onClick={() => onSelect(chapter.id)}
          className={`flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
            activeChapter === chapter.id
              ? `bg-stone-800 ${chapter.color}`
              : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/50'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            activeChapter === chapter.id ? 'bg-stone-700' : 'bg-stone-800'
          }`}>
            {index + 1}
          </div>
          <span className="text-sm font-medium">{chapter.title}</span>
        </button>
      ))}
    </div>
  );
};

export const HeroJourney: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<string | null>('call');

  return (
    <div className="flex-1 overflow-y-auto bg-stone-900">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-stone-800 to-stone-900 border-b border-stone-800">
        <div className="absolute inset-0 bg-[url('/standing-by-spitfire.png')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1 mb-6">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-amber-500 text-sm font-medium">A Pilot's Journey</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-stone-100 mb-4">
            Flight Lieutenant Robin A. Glen
          </h1>
          <p className="text-xl text-stone-400 mb-8 max-w-2xl mx-auto">
            From the beaches of Normandy to the skies over India — the extraordinary story of a Spitfire pilot's war.
          </p>
          
          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="text-center px-4">
              <div className="text-3xl font-bold text-amber-500">{careerStats.totalHours}</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">Flying Hours</div>
            </div>
            <div className="text-center px-4 border-l border-stone-700">
              <div className="text-3xl font-bold text-red-500">{careerStats.operationalMissions}</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">Combat Missions</div>
            </div>
            <div className="text-center px-4 border-l border-stone-700">
              <div className="text-3xl font-bold text-blue-500">{careerStats.yearsService}</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">Years Service</div>
            </div>
            <div className="text-center px-4 border-l border-stone-700">
              <div className="text-3xl font-bold text-purple-500">3</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">Theatres</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* Timeline Navigation */}
          <aside className="w-64 shrink-0">
            <TimelineNav 
              chapters={journeyData} 
              activeChapter={activeChapter}
              onSelect={setActiveChapter}
            />
          </aside>

          {/* Chapter Content */}
          <main className="flex-1 space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-stone-200 mb-2">The Hero's Journey</h2>
              <p className="text-stone-400">
                Click each chapter to explore the pivotal moments that shaped Robin Glen's wartime experience. 
                From rigorous training to the chaos of D-Day, from escort missions over burning Germany to 
                ferrying Spitfires across India — this is his story.
              </p>
            </div>

            {journeyData.map((chapter) => (
              <ChapterSection
                key={chapter.id}
                chapter={chapter}
                isActive={activeChapter === chapter.id}
                onActivate={() => setActiveChapter(activeChapter === chapter.id ? null : chapter.id)}
              />
            ))}

            {/* Closing Summary */}
            <div className="mt-12 p-8 bg-gradient-to-br from-stone-800 to-stone-850 rounded-xl border border-stone-700">
              <h3 className="text-xl font-bold text-stone-200 mb-4">The Legacy</h3>
              <p className="text-stone-400 leading-relaxed mb-6">
                After more than six years in the Royal Air Force, Flight Lieutenant Robin A. Glen returned home 
                aboard the M.V. "Durham Castle." He had witnessed the greatest invasion in history from above the 
                Normandy beaches, escorted thousand-bomber raids into the heart of Nazi Germany, and flown 
                Spitfires across three continents. His logbook — a collection of dates, times, and duties — 
                tells a story of courage, skill, and an unwavering sense of duty.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-stone-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-stone-300 mb-2">Aircraft Flown</h4>
                  <div className="flex flex-wrap gap-1">
                    {careerStats.aircraft.slice(0, 5).map((a) => (
                      <span key={a} className="text-xs bg-stone-600 text-stone-300 px-2 py-0.5 rounded">{a}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-stone-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-stone-300 mb-2">Squadrons</h4>
                  {careerStats.squadrons.map((s) => (
                    <p key={s} className="text-xs text-stone-400">{s}</p>
                  ))}
                </div>
                <div className="bg-stone-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-stone-300 mb-2">Theatres</h4>
                  {careerStats.theatres.map((t) => (
                    <p key={t} className="text-xs text-stone-400">{t}</p>
                  ))}
                </div>
                <div className="bg-stone-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-stone-300 mb-2">Operational Hours</h4>
                  <p className="text-2xl font-bold text-amber-500">{careerStats.operationalHours}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HeroJourney;
