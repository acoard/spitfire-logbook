import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plane, Target, Shield, Crown, Globe, Home, Award, Zap, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';

// Types for the Hero's Journey
interface JourneyMoment {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  description: string;
  quote?: string;
  quoteSource?: string;
  significance: 'major' | 'minor' | 'milestone';
  type: 'training' | 'combat' | 'personal' | 'honor' | 'adventure';
  location?: string;
  stats?: {
    label: string;
    value: string;
  }[];
}

interface JourneyChapter {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  dateRange: string;
  summary: string;
  moments: JourneyMoment[];
}

// The complete Hero's Journey data
const HERO_JOURNEY: JourneyChapter[] = [
  {
    id: 'training',
    title: 'The Training',
    subtitle: 'Forging a Fighter Pilot',
    icon: <Award className="w-6 h-6" />,
    color: 'amber',
    dateRange: '1941 - May 1944',
    summary: 'Robin Glen earned his pilot wings and waited 30 months before finally joining an operational squadron—a long period of preparation that would prove invaluable.',
    moments: [
      {
        id: 'training-1',
        date: 'January 4, 1944',
        title: 'The Stolen Logbook',
        description: 'Robin\'s original logbook was stolen, erasing the official record of his early training. He meticulously reconstructed his flight times from memory—over 331 hours across Tiger Moths, Harvards, Masters, and Spitfires.',
        significance: 'minor',
        type: 'personal',
        stats: [
          { label: 'Tiger Moth', value: '53 hrs' },
          { label: 'Harvard II', value: '93 hrs' },
          { label: 'Spitfire', value: '92 hrs' },
        ]
      },
      {
        id: 'training-2',
        date: 'March - April 1944',
        title: 'Advanced Training at Tealing',
        subtitle: 'I.T.E.U. (Instrument Training & Evaluation Unit)',
        description: 'Intensive training on Spitfires I & V, Hurricanes, and Masters. Robin honed his skills in formation flying, dive bombing, air-to-ground firing, and low-level cross country navigation.',
        significance: 'major',
        type: 'training',
        location: 'RAF Tealing, Scotland',
        stats: [
          { label: 'Aircraft Types', value: '4' },
          { label: 'Hours Logged', value: '24.75' },
        ]
      },
      {
        id: 'training-3',
        date: 'May 26, 1944',
        title: 'Final Assessment',
        description: 'Robin received his final pilot assessment: "Good Average" as a fighter pilot, "Average" in bombing and gunnery, and "Above Average" with Rocket Projectiles. No points to watch in flying or airmanship.',
        quote: 'Any Points in Flying or Airmanship Which Should Be Watched: None',
        quoteSource: 'Form 414A Assessment',
        significance: 'milestone',
        type: 'training',
        stats: [
          { label: 'Total Hours', value: '273.55' },
          { label: 'Assessment', value: 'Good Average' },
        ]
      },
    ]
  },
  {
    id: 'dday',
    title: 'Trial by Fire',
    subtitle: 'D-Day and the Normandy Campaign',
    icon: <Target className="w-6 h-6" />,
    color: 'red',
    dateRange: 'May 30 - June 1944',
    summary: 'After 30 months of waiting, Robin\'s first operational mission came at the most dramatic moment possible—providing air cover for the D-Day invasion.',
    moments: [
      {
        id: 'dday-1',
        date: 'May 30, 1944',
        title: 'Joining 313 Squadron',
        subtitle: 'The Czech Squadron',
        description: 'Robin was posted from 84 G.S.U. to 313 Squadron in the 2nd Tactical Air Force. He arrived in a grey Spitfire Mk. IX at a temporary airfield at Appledram—just one week before the invasion.',
        quote: "I'd had my pilot's wings for 30 months—and arrived on a Grey Spitfire Mk. IX at a temporary airfield at Appledean.",
        quoteSource: 'Robin Glen',
        significance: 'milestone',
        type: 'combat',
        location: 'Appledram, Sussex',
      },
      {
        id: 'dday-2',
        date: 'June 5, 1944',
        title: 'Eve of Invasion',
        subtitle: 'Convoy Patrol',
        description: 'Robin flew patrol over what would be revealed as the invasion fleet. The next morning would change the course of history.',
        quote: "This 'Convoy' was in Part—the Invasion Fleet.",
        quoteSource: 'Logbook note',
        significance: 'major',
        type: 'combat',
        location: 'English Channel',
      },
      {
        id: 'dday-3',
        date: 'June 5, 1944',
        title: 'The Sobering Briefing',
        description: 'At the detailed pre-invasion briefing, pilots were told the cold truth: the 2nd Tactical Air Force had enough reserves for all squadrons to suffer 90% casualties on Day 1 and still be fully operational on Day 2.',
        quote: "There were enough pilots and aircraft—in close reserve for all squadrons to suffer 90% casualties on the first day—and they'd be fully up to strength and operational pilots and planes on Day 2.",
        quoteSource: 'D-Day Briefing',
        significance: 'major',
        type: 'combat',
      },
      {
        id: 'dday-4',
        date: 'June 6, 1944',
        title: 'D-Day: Beach Head Patrol',
        subtitle: 'Operation Overlord',
        description: 'Robin flew his first combat mission on the most consequential day of the war—patrolling above the Normandy beaches as Allied forces stormed ashore.',
        quote: "What could be a more dramatic way of starting on ops' than to fly daily over the tiny beach head where the Allies struggled to get ashore and open up the second front.",
        quoteSource: 'Robin Glen',
        significance: 'milestone',
        type: 'combat',
        location: 'Normandy, France',
        stats: [
          { label: 'Mission Duration', value: '2 hours' },
          { label: 'Mission Type', value: 'Beach Head Patrol' },
        ]
      },
      {
        id: 'dday-5',
        date: 'June 6-19, 1944',
        title: 'Two Weeks Over Normandy',
        description: 'Robin flew Beach Head Patrols almost daily for two weeks, protecting the fragile Allied foothold in France. Each mission lasted 1.5-2 hours over the contested beaches.',
        significance: 'major',
        type: 'combat',
        location: 'Normandy, France',
        stats: [
          { label: 'Patrols Flown', value: '12+' },
          { label: 'Total Hours', value: '24+' },
        ]
      },
    ]
  },
  {
    id: 'combat',
    title: 'The Long Fight',
    subtitle: 'From V-1 Sites to the Heart of Germany',
    icon: <Shield className="w-6 h-6" />,
    color: 'orange',
    dateRange: 'June 1944 - May 1945',
    summary: 'Robin flew dive bombing missions against V-1 launch sites, endured nights under shellfire in France, and escorted thousand-bomber raids deep into Germany.',
    moments: [
      {
        id: 'combat-1',
        date: 'June 19, 1944',
        title: 'Hunting the Doodlebugs',
        subtitle: 'V-1 Launch Site Attack',
        description: 'Robin\'s first dive bombing mission targeted the V-1 "Doodlebug" rocket launching sites that were terrorizing London. The Spitfire Mk IX could carry a 500lb bomb—or even a 1000lb bomb.',
        significance: 'major',
        type: 'combat',
        location: 'Northern France',
        stats: [
          { label: 'Ordnance', value: '500 lb bomb' },
        ]
      },
      {
        id: 'combat-2',
        date: 'June 24-29, 1944',
        title: 'Behind Enemy Lines',
        subtitle: 'Advanced Landing Ground B.10',
        description: 'Robin spent nights at an advanced landing ground just behind the front lines, under shellfire. His plane\'s tailplane was damaged by anti-aircraft fire.',
        quote: "The first of 2 nights just behind the Front Line—under self/fire. Got shot up—my plane's tailplane sustaining Ack Ack damage.",
        quoteSource: 'Logbook note',
        significance: 'milestone',
        type: 'combat',
        location: 'ALG B.10, France',
      },
      {
        id: 'combat-3',
        date: 'July 2, 1944',
        title: 'The Fury Over Caen',
        description: 'Robin witnessed the devastating Allied bombing of Caen—700-800 bombers per hour in daylight raids. The pattern bombing was devastating, but so was the anti-aircraft fire.',
        quote: "The V.1 A.A.F (German show) 700-800 per hour daylight-raids on Caen. The pattern bombing was devastating. So was the ack ack.",
        quoteSource: 'Logbook note',
        significance: 'major',
        type: 'combat',
        location: 'Caen, France',
      },
      {
        id: 'combat-4',
        date: 'July 8, 1944',
        title: 'Low Level Sweep',
        description: 'During a low-level sweep across occupied France, Robin\'s formation swept across a German airfield. In that moment, he engaged an anti-aircraft crew scrambling to defend against the attacking aircraft.',
        quote: "At one point we swept across an airfield and I wiped out the crew of an A.A. port scrambling to train landing planes.",
        quoteSource: 'Logbook note',
        significance: 'major',
        type: 'combat',
        location: 'Northern France',
      },
      {
        id: 'combat-5',
        date: 'October - November 1944',
        title: 'Bomber Escort: Into the Reich',
        subtitle: 'Thousand Bomber Raids',
        description: 'From North Weald, Robin escorted massive bomber formations deep into Germany—Duisburg, Homberg, Munster, Hamburg, Dortmund, Bottrop. He witnessed devastation on an industrial scale.',
        quote: "Even the clouds were red—and fires were raging underneath.",
        quoteSource: 'Fellow pilot\'s logbook',
        significance: 'milestone',
        type: 'combat',
        location: 'Germany',
        stats: [
          { label: 'Major Raids', value: '8+' },
          { label: 'Deepest Target', value: 'Hamburg' },
        ]
      },
      {
        id: 'combat-6',
        date: 'December 8, 1944',
        title: 'The Lucky Two',
        subtitle: 'Radio Relay Mission',
        description: 'Tasked with relaying radio messages from the Wing Commander at 15,000 feet over Brussels, Robin passed on the order to abort due to deteriorating weather. Of the 37 Spitfires in the wing, only two made it back across the sea to England. Robin was one of them.',
        quote: "Of the 37 Spitfires in our wing, I was one of only two who made it across the sea back to England. I made it to Bradwell Bay.",
        quoteSource: 'Robin Glen',
        significance: 'milestone',
        type: 'combat',
        location: 'Brussels / Bradwell Bay',
      },
      {
        id: 'combat-7',
        date: 'April 19, 1945',
        title: 'Volunteering for the Far East',
        description: 'With the war in Europe nearing its end, Robin volunteered to continue fighting in the Far East. His initial application was rejected for not stating a reason.',
        quote: "While there were many tens of thousand British and allied prisoners of war still in Japanese hands I would consider it a disgrace to stay in England.",
        quoteSource: 'Robin Glen\'s reapplication',
        significance: 'major',
        type: 'personal',
      },
      {
        id: 'combat-8',
        date: 'April 25, 1945',
        title: 'Heligoland',
        subtitle: 'The Island Fortress',
        description: 'Robin provided fighter cover as Bomber Command pounded Heligoland, the tiny but heavily fortified German island fortress in the North Sea.',
        quote: "What a spectacle! Heligoland is a tiny island Fortress in North Sea—and to see it receive everything Bomber Command could dump on it.",
        quoteSource: 'Logbook note',
        significance: 'major',
        type: 'combat',
        location: 'Heligoland, North Sea',
      },
    ]
  },
  {
    id: 'honor',
    title: 'Royal Recognition',
    subtitle: 'End of the European War',
    icon: <Crown className="w-6 h-6" />,
    color: 'yellow',
    dateRange: 'May - June 1945',
    summary: 'As the war in Europe ended, 313 Squadron received the supreme honor of escorting the King and Queen—though they nearly ran out of fuel doing it.',
    moments: [
      {
        id: 'honor-1',
        date: 'May 7, 1945',
        title: 'Victory in Europe',
        description: 'The day before VE Day, Robin flew a height climb mission—one of his last combat-related flights in Europe. The long fight was finally over.',
        significance: 'milestone',
        type: 'honor',
        stats: [
          { label: 'Operational Sorties', value: '51+' },
          { label: 'Total Hours', value: '584+' },
        ]
      },
      {
        id: 'honor-2',
        date: 'May 22, 1945',
        title: 'Solo to Guernsey',
        description: 'Robin flew a solo mission to St. Peter Port, Guernsey, carrying an urgent package—one of the first flights to the newly liberated Channel Islands.',
        significance: 'minor',
        type: 'honor',
        location: 'Guernsey, Channel Islands',
      },
      {
        id: 'honor-3',
        date: 'June 7, 1945',
        title: 'Escorting Their Majesties',
        subtitle: 'King George VI and Queen Elizabeth',
        description: '313 Squadron received the supreme honor of escorting the King and Queen from Jersey to the mainland. The mission was so long that the Spitfires nearly ran out of fuel.',
        quote: "A great honour for the Squadron to escort Their Majesties—but we all just about ran out of gas!",
        quoteSource: 'Logbook note',
        significance: 'milestone',
        type: 'honor',
        location: 'Jersey → Warmwell → Poole',
        stats: [
          { label: 'Mission Duration', value: '3 hrs 5 min' },
        ]
      },
      {
        id: 'honor-4',
        date: 'June 1945',
        title: 'The Call East',
        description: 'A WAAF from Biggin Hill contacted Robin about ferrying Spitfires to the Far East. He didn\'t have to be asked twice.',
        quote: "Ferrying Spitfires! I didn't have to be asked twice.",
        quoteSource: 'Robin Glen',
        significance: 'major',
        type: 'adventure',
      },
    ]
  },
  {
    id: 'india',
    title: 'The Eastern Adventure',
    subtitle: 'Ferrying Spitfires Across India',
    icon: <Globe className="w-6 h-6" />,
    color: 'emerald',
    dateRange: 'July 1945 - March 1946',
    summary: 'Robin ferried Spitfires across the vast expanse of India, Burma, and Thailand—reconnecting with family along the way and experiencing one memorable monsoon landing disaster.',
    moments: [
      {
        id: 'india-1',
        date: 'July 11-13, 1945',
        title: 'London to Karachi',
        subtitle: '30 Hours, 3 Days',
        description: 'An epic journey by Dakota transport: England → Sardinia → North Africa → Egypt → Iraq → Persian Gulf → Karachi. Robin mailed over 500 postcards along the route.',
        significance: 'milestone',
        type: 'adventure',
        location: 'Multiple Countries',
        stats: [
          { label: 'Flight Time', value: '30 hours' },
          { label: 'Days', value: '3' },
          { label: 'Continents', value: '3' },
        ]
      },
      {
        id: 'india-2',
        date: 'July 25, 1945',
        title: 'Finding Uncle Frank',
        subtitle: 'Calcutta Reunion',
        description: 'Just 2½ weeks after arriving in India, Robin tracked down his Uncle Frank in Calcutta. Throughout his time in India, he would visit Frank multiple times.',
        significance: 'major',
        type: 'personal',
        location: 'Calcutta, India',
      },
      {
        id: 'india-3',
        date: 'August 1945',
        title: 'The Mesra Visit',
        subtitle: 'The Old Binning Family Home',
        description: 'Robin "navigated" a ferry trip via Ranchi to pay a surprise visit to Aunt Freda at Mesra—the old Binning family home. After a night with her, he flew on to visit Uncle Frank again.',
        quote: "Just a month after arriving in India got to track down Uncle Frank in Calcutta.",
        quoteSource: 'Logbook note',
        significance: 'major',
        type: 'personal',
        location: 'Mesra / Ranchi, India',
      },
      {
        id: 'india-4',
        date: 'August 26, 1945',
        title: 'The Monsoon Disaster',
        subtitle: 'Three Aircraft Down',
        description: 'Flying at zero feet through a monsoon storm, Robin landed at an aerodrome covered in inches of water. The water got into his brakes, and before he could stop, he had written off his Lysander, a Beaufighter, and seriously damaged a Spitfire.',
        quote: "Luckily, the war had just finished.",
        quoteSource: 'Robin Glen',
        significance: 'milestone',
        type: 'adventure',
        location: 'Allahabad, India',
        stats: [
          { label: 'Aircraft Destroyed', value: '2' },
          { label: 'Aircraft Damaged', value: '1' },
        ]
      },
      {
        id: 'india-5',
        date: 'November 4, 1945',
        title: 'Bangkok Delivery',
        description: 'Robin ferried a Spitfire XIV all the way from Karachi to Bangkok, via Calcutta, Akyab, and Rangoon—a journey spanning the width of the subcontinent and beyond.',
        significance: 'major',
        type: 'adventure',
        location: 'Karachi → Bangkok',
      },
      {
        id: 'india-6',
        date: 'November 16, 1945',
        title: 'Near the Khyber Pass',
        description: 'Robin delivered a Spitfire to Kohat, just 50 miles from the legendary Khyber Pass on the Northwest Frontier.',
        quote: "Kohat + about 50 miles from the Khyber Pass.",
        quoteSource: 'Logbook note',
        significance: 'minor',
        type: 'adventure',
        location: 'Kohat, Northwest Frontier',
      },
      {
        id: 'india-7',
        date: 'December 1945',
        title: 'Christmas at Ranchi',
        description: 'When Robin "developed engine trouble" in Calcutta, he took the train to Ranchi to spend Christmas with family. When he returned, his superiors asked why he hadn\'t stayed an extra week.',
        quote: "Developed engine trouble (!) in Calcutta—so took the train to Ranchi for Christmas. (Who could ask for anything more)",
        quoteSource: 'Logbook note',
        significance: 'major',
        type: 'personal',
        location: 'Ranchi, India',
      },
    ]
  },
  {
    id: 'homecoming',
    title: 'The Return',
    subtitle: 'Six Years Complete',
    icon: <Home className="w-6 h-6" />,
    color: 'sky',
    dateRange: 'March 1946',
    summary: 'After more than six years of service, Robin Glen said goodbye to the RAF and sailed home to England on the M.V. Durham Castle.',
    moments: [
      {
        id: 'home-1',
        date: 'March 1946',
        title: 'Final Flights',
        description: 'Robin flew his last ferry missions—delivering Spitfires and flying to visit Uncle Frank one final time. His demob ticket was coming up.',
        significance: 'major',
        type: 'personal',
        location: 'India',
      },
      {
        id: 'home-2',
        date: 'March 1946',
        title: 'Goodbye to Frank',
        subtitle: 'Last Visit',
        description: 'Robin said goodbye to Uncle Frank in Calcutta, then traveled to Bombay by train to begin his journey home.',
        quote: "Said goodbye to Frank. This was my last visit—as my 'demob' ticket was coming up.",
        quoteSource: 'Logbook note',
        significance: 'major',
        type: 'personal',
        location: 'Calcutta / Bombay',
      },
      {
        id: 'home-3',
        date: 'March 1946',
        title: 'The Journey Home',
        subtitle: 'M.V. Durham Castle',
        description: 'After over six years in the RAF, Robin Glen sailed home to England. His logbook recorded 697+ hours of flight time, 51+ operational missions, and adventures spanning three continents.',
        quote: "Travelled to Bombay by train and back home by sea—on the M.V. 'Durham Castle'—after over 6 years in RAF.",
        quoteSource: 'Robin Glen',
        significance: 'milestone',
        type: 'personal',
        stats: [
          { label: 'Years of Service', value: '6+' },
          { label: 'Total Flying Hours', value: '697+' },
          { label: 'Operational Missions', value: '51+' },
        ]
      },
    ]
  },
];

// Utility function to get color classes
const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; border: string; text: string; glow: string; bgLight: string }> = {
    amber: { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-500', glow: 'shadow-amber-500/30', bgLight: 'bg-amber-500/10' },
    red: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-500', glow: 'shadow-red-500/30', bgLight: 'bg-red-500/10' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-500', glow: 'shadow-orange-500/30', bgLight: 'bg-orange-500/10' },
    yellow: { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-500', glow: 'shadow-yellow-500/30', bgLight: 'bg-yellow-500/10' },
    emerald: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-500', glow: 'shadow-emerald-500/30', bgLight: 'bg-emerald-500/10' },
    sky: { bg: 'bg-sky-500', border: 'border-sky-500', text: 'text-sky-500', glow: 'shadow-sky-500/30', bgLight: 'bg-sky-500/10' },
  };
  return colors[color] || colors.amber;
};

// Icon for moment type
const getMomentIcon = (type: JourneyMoment['type']) => {
  switch (type) {
    case 'training': return <Award className="w-4 h-4" />;
    case 'combat': return <Target className="w-4 h-4" />;
    case 'personal': return <Home className="w-4 h-4" />;
    case 'honor': return <Crown className="w-4 h-4" />;
    case 'adventure': return <Globe className="w-4 h-4" />;
    default: return <Plane className="w-4 h-4" />;
  }
};

// Chapter Card Component
const ChapterCard: React.FC<{
  chapter: JourneyChapter;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: boolean;
}> = ({ chapter, isExpanded, onToggle, isActive }) => {
  const colors = getColorClasses(chapter.color);
  const contentRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      className={`relative transition-all duration-500 ${isActive ? 'scale-100' : 'scale-98 opacity-90'}`}
    >
      {/* Chapter Header */}
      <button
        onClick={onToggle}
        className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
          isExpanded 
            ? `${colors.border} ${colors.bgLight} shadow-lg ${colors.glow}` 
            : 'border-stone-700 bg-stone-800/50 hover:border-stone-600 hover:bg-stone-800'
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-lg ${isExpanded ? colors.bg : 'bg-stone-700'} transition-colors duration-300`}>
            <span className={isExpanded ? 'text-stone-900' : 'text-stone-300'}>
              {chapter.icon}
            </span>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className={`text-xl font-bold ${isExpanded ? colors.text : 'text-stone-200'} transition-colors duration-300`}>
                {chapter.title}
              </h2>
              <span className="text-xs text-stone-500 font-mono">{chapter.dateRange}</span>
            </div>
            <p className="text-stone-400 text-sm mb-2">{chapter.subtitle}</p>
            <p className="text-stone-500 text-sm line-clamp-2">{chapter.summary}</p>
          </div>
          
          {/* Expand Icon */}
          <div className={`p-2 rounded-full ${isExpanded ? colors.bgLight : 'bg-stone-700/50'} transition-all duration-300`}>
            {isExpanded ? (
              <ChevronUp className={`w-5 h-5 ${colors.text}`} />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )}
          </div>
        </div>
      </button>
      
      {/* Expanded Content */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div ref={contentRef} className="pt-4 pl-8">
          {/* Timeline */}
          <div className="relative border-l-2 border-stone-700 pl-8 space-y-6">
            {chapter.moments.map((moment, idx) => (
              <MomentCard 
                key={moment.id} 
                moment={moment} 
                color={chapter.color}
                isLast={idx === chapter.moments.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Moment Card Component
const MomentCard: React.FC<{
  moment: JourneyMoment;
  color: string;
  isLast: boolean;
}> = ({ moment, color, isLast }) => {
  const colors = getColorClasses(color);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline Dot */}
      <div className={`absolute -left-8 top-0 transform -translate-x-1/2 transition-all duration-300 ${
        moment.significance === 'milestone' 
          ? `w-5 h-5 ${colors.bg} shadow-lg ${colors.glow}` 
          : moment.significance === 'major'
            ? `w-4 h-4 ${colors.bg} opacity-80`
            : 'w-3 h-3 bg-stone-600'
      } rounded-full border-4 border-stone-900`} />
      
      {/* Content Card */}
      <div className={`p-5 rounded-lg border transition-all duration-300 ${
        isHovered 
          ? `border-stone-600 bg-stone-800 shadow-lg` 
          : 'border-stone-800 bg-stone-850'
      } ${moment.significance === 'milestone' ? `${colors.bgLight} ${colors.border}` : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`${colors.text} opacity-80`}>{getMomentIcon(moment.type)}</span>
              <span className="text-xs font-mono text-stone-500">{moment.date}</span>
              {moment.significance === 'milestone' && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} text-stone-900 font-semibold`}>
                  MILESTONE
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-stone-200">{moment.title}</h3>
            {moment.subtitle && (
              <p className="text-sm text-stone-400">{moment.subtitle}</p>
            )}
          </div>
          {moment.location && (
            <div className="flex items-center gap-1 text-xs text-stone-500 shrink-0">
              <MapPin className="w-3 h-3" />
              {moment.location}
            </div>
          )}
        </div>
        
        {/* Description */}
        <p className="text-stone-300 text-sm leading-relaxed mb-3">
          {moment.description}
        </p>
        
        {/* Quote */}
        {moment.quote && (
          <blockquote className={`border-l-2 ${colors.border} pl-4 my-4 italic text-stone-400`}>
            "{moment.quote}"
            {moment.quoteSource && (
              <cite className="block text-xs text-stone-500 mt-1 not-italic">— {moment.quoteSource}</cite>
            )}
          </blockquote>
        )}
        
        {/* Stats */}
        {moment.stats && moment.stats.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-stone-700/50">
            {moment.stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-stone-500">{stat.label}:</span>
                <span className={`text-sm font-semibold ${colors.text}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Progress indicator showing chapters
const ProgressIndicator: React.FC<{
  chapters: JourneyChapter[];
  activeIndex: number;
  onSelect: (index: number) => void;
}> = ({ chapters, activeIndex, onSelect }) => {
  return (
    <div className="sticky top-0 z-10 bg-stone-900/95 backdrop-blur-sm border-b border-stone-800 py-3 px-4 mb-6">
      <div className="flex items-center justify-center gap-2 overflow-x-auto">
        {chapters.map((chapter, idx) => {
          const colors = getColorClasses(chapter.color);
          const isActive = idx === activeIndex;
          const isPast = idx < activeIndex;
          
          return (
            <button
              key={chapter.id}
              onClick={() => onSelect(idx)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 shrink-0 ${
                isActive 
                  ? `${colors.bgLight} ${colors.border} border` 
                  : isPast
                    ? 'bg-stone-800 border border-stone-700'
                    : 'bg-stone-800/50 border border-stone-800 hover:border-stone-700'
              }`}
            >
              <span className={isActive ? colors.text : isPast ? 'text-stone-400' : 'text-stone-500'}>
                {chapter.icon}
              </span>
              <span className={`text-sm font-medium hidden sm:block ${
                isActive ? colors.text : isPast ? 'text-stone-400' : 'text-stone-500'
              }`}>
                {chapter.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Hero Section
const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 border border-stone-700 mb-8">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>
      
      <div className="relative p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Left: Text Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-amber-500/80 text-sm font-mono mb-4">
              <Plane className="w-4 h-4" />
              <span>1941 - 1946</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-100 mb-4">
              The Hero's Journey
            </h1>
            <p className="text-xl text-amber-500 font-medium mb-4">
              Flight Lieutenant Robin A. Glen
            </p>
            <p className="text-stone-400 text-lg leading-relaxed max-w-xl">
              From the training fields of Scotland to the beaches of Normandy, from bomber escorts over 
              Germany to ferrying Spitfires across India—this is the remarkable story of one pilot's 
              six years of service in the Royal Air Force.
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500">6+</div>
                <div className="text-xs text-stone-500 uppercase tracking-wide">Years of Service</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">51+</div>
                <div className="text-xs text-stone-500 uppercase tracking-wide">Combat Missions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-500">697+</div>
                <div className="text-xs text-stone-500 uppercase tracking-wide">Flying Hours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-500">3</div>
                <div className="text-xs text-stone-500 uppercase tracking-wide">Continents</div>
              </div>
            </div>
          </div>
          
          {/* Right: Squadron Badge or Image placeholder */}
          <div className="shrink-0">
            <div className="relative w-48 h-48 md:w-56 md:h-56">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-red-500/20 rounded-full blur-2xl" />
              <div className="relative w-full h-full rounded-full border-2 border-stone-700 bg-stone-800/80 flex items-center justify-center overflow-hidden">
                <img 
                  src="./robin-insignia.png" 
                  alt="313 Squadron Insignia" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="text-center p-4">
                        <div class="text-6xl font-bold text-amber-500 mb-2">313</div>
                        <div class="text-sm text-stone-400 uppercase tracking-wider">Squadron</div>
                        <div class="text-xs text-stone-500 mt-1">Czech Wing</div>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export const HeroJourney: React.FC = () => {
  const [expandedChapter, setExpandedChapter] = useState<string | null>('dday');
  const [activeIndex, setActiveIndex] = useState(1); // Start with D-Day chapter
  
  const handleChapterToggle = (chapterId: string) => {
    setExpandedChapter(prev => prev === chapterId ? null : chapterId);
    const newIndex = HERO_JOURNEY.findIndex(c => c.id === chapterId);
    if (newIndex !== -1) setActiveIndex(newIndex);
  };
  
  const handleProgressSelect = (index: number) => {
    const chapter = HERO_JOURNEY[index];
    setExpandedChapter(chapter.id);
    setActiveIndex(index);
    
    // Scroll to chapter
    const element = document.getElementById(`chapter-${chapter.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  return (
    <div className="flex-1 overflow-y-auto bg-stone-900">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Progress Indicator */}
        <ProgressIndicator 
          chapters={HERO_JOURNEY} 
          activeIndex={activeIndex}
          onSelect={handleProgressSelect}
        />
        
        {/* Chapters */}
        <div className="space-y-4">
          {HERO_JOURNEY.map((chapter, idx) => (
            <div key={chapter.id} id={`chapter-${chapter.id}`}>
              <ChapterCard
                chapter={chapter}
                isExpanded={expandedChapter === chapter.id}
                onToggle={() => handleChapterToggle(chapter.id)}
                isActive={idx === activeIndex}
              />
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-12 p-6 rounded-xl bg-stone-800/50 border border-stone-700 text-center">
          <p className="text-stone-400 text-sm italic">
            "After over 6 years in RAF... Travelled to Bombay by train and back home by sea—on the M.V. 'Durham Castle'"
          </p>
          <p className="text-stone-500 text-xs mt-2">— Robin Glen's final logbook entry, March 1946</p>
        </div>
      </div>
    </div>
  );
};

export default HeroJourney;
