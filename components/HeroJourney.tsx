import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plane, Target, Shield, Crown, Globe, Home, Award, MapPin, BookOpen } from 'lucide-react';
import { LOCATIONS } from '../services/flightData';
import { TypewriterText } from './TypewriterText';

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
  coordinates?: { lat: number; lng: number };
  logbookEntryId?: string;
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
  dateRange: string;
  summary: string;
  moments: JourneyMoment[];
  stampText?: string;
}

// The complete Hero's Journey data
const HERO_JOURNEY: JourneyChapter[] = [
  {
    id: 'training',
    title: 'The Training',
    subtitle: 'Forging a Fighter Pilot',
    icon: <Award className="w-5 h-5" />,
    dateRange: '1940 - May 1944',
    summary: 'Robin Glen earned his pilot wings and waited 30 months before finally joining an operational squadron—a long period of preparation that would prove invaluable.',
    stampText: 'QUALIFIED',
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
        logbookEntryId: '4',
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
    icon: <Target className="w-5 h-5" />,
    dateRange: 'May 30 - June 1944',
    summary: 'After 30 months of waiting, Robin\'s first operational mission came at the most dramatic moment possible—providing air cover for the D-Day invasion.',
    stampText: 'OPERATIONAL',
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
        coordinates: LOCATIONS.APPLEDRAM,
      },
      {
        id: 'dday-2',
        date: 'June 2, 1944',
        title: 'The Invasion Fleet',
        subtitle: 'Convoy Patrol',
        description: 'Robin flew patrol over what would be revealed as the invasion fleet gathering in the channel.',
        quote: "This 'Convoy' was in Part—the Invasion Fleet.",
        quoteSource: 'Logbook note',
        significance: 'major',
        type: 'combat',
        location: 'English Channel',
        logbookEntryId: 'c-062-1',
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
        logbookEntryId: 'c-062-2',
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
        coordinates: LOCATIONS.NORMANDY_BEACH,
        logbookEntryId: 'c-062-3',
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
        coordinates: LOCATIONS.NORMANDY_BEACH,
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
    icon: <Shield className="w-5 h-5" />,
    dateRange: 'June 1944 - May 1945',
    summary: 'Robin flew dive bombing missions against V-1 launch sites, endured nights under shellfire in France, and escorted thousand-bomber raids deep into Germany.',
    stampText: 'COMBAT',
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
        coordinates: LOCATIONS.V1_SITE,
        logbookEntryId: 'c-062-5',
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
        coordinates: LOCATIONS.B10_PLUMETOT,
        logbookEntryId: 'c-063-2',
      },
      {
        id: 'combat-3',
        date: 'July 2, 1944',
        title: 'The Fury Over Caen',
        description: 'Robin witnessed the devastating Allied bombing of Caen—700-800 bombers per hour in daylight raids. The pattern bombing was devastating, but so was the anti-aircraft fire.',
        quote: "700-800 per hour daylight-raids on Caen. The pattern bombing was devastating. So was the ack ack.",
        quoteSource: 'Logbook note',
        significance: 'major',
        type: 'combat',
        location: 'Caen, France',
        coordinates: LOCATIONS.CAEN,
        logbookEntryId: 'c-064-1',
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
        logbookEntryId: 'c-064-2',
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
        logbookEntryId: 'c-068-4',
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
        coordinates: LOCATIONS.BRADWELL_BAY,
        logbookEntryId: 'c-069-1',
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
        logbookEntryId: 'c-072-1',
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
        coordinates: LOCATIONS.HELIGOLAND,
        logbookEntryId: 'c-072-2',
      },
    ]
  },
  {
    id: 'honor',
    title: 'Royal Recognition',
    subtitle: 'End of the European War',
    icon: <Crown className="w-5 h-5" />,
    dateRange: 'May - June 1945',
    summary: 'As the war in Europe ended, 313 Squadron received the supreme honor of escorting the King and Queen—though they nearly ran out of fuel doing it.',
    stampText: 'DISTINGUISHED',
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
        coordinates: { lat: 49.45, lng: -2.53 },
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
        logbookEntryId: 'c-074-1',
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
    icon: <Globe className="w-5 h-5" />,
    dateRange: 'July 1945 - March 1946',
    summary: 'Robin ferried Spitfires across the vast expanse of India, Burma, and Thailand—reconnecting with family along the way and experiencing one memorable monsoon landing disaster.',
    stampText: 'FAR EAST',
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
        coordinates: LOCATIONS.KARACHI,
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
        coordinates: LOCATIONS.CALCUTTA,
      },
      {
        id: 'india-3',
        date: 'August 1945',
        title: 'The Mesra Visit',
        subtitle: 'The Old Binning Family Home',
        description: 'Robin "navigated" a ferry trip via Ranchi to pay a surprise visit to Aunt Freda at Mesra—the old Binning family home. After a night with her, he flew on to visit Uncle Frank again.',
        quote: "Just a month after arriving in India I 'navigated' a trip via Ranchi—and paid a surprise visit to Aunt Freda at Mesra.",
        quoteSource: 'Logbook note',
        significance: 'major',
        type: 'personal',
        location: 'Mesra / Ranchi, India',
        coordinates: LOCATIONS.RANCHI,
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
        coordinates: LOCATIONS.ALLAHABAD,
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
        coordinates: LOCATIONS.BANGKOK,
        logbookEntryId: 'f-080-4',
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
        coordinates: LOCATIONS.KOHAT,
        logbookEntryId: 'f-080-6',
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
        coordinates: LOCATIONS.RANCHI,
      },
    ]
  },
  {
    id: 'homecoming',
    title: 'The Return',
    subtitle: 'Six Years Complete',
    icon: <Home className="w-5 h-5" />,
    dateRange: 'March 1946',
    summary: 'After more than six years of service, Robin Glen said goodbye to the RAF and sailed home to England on the M.V. Durham Castle.',
    stampText: 'DEMOBBED',
    moments: [
      {
        id: 'home-1',
        date: 'March 1946',
        title: 'Final Flights',
        description: 'Robin flew his last ferry missions—delivering Spitfires and flying to visit Uncle Frank one final time. His demob ticket was coming up.',
        significance: 'major',
        type: 'personal',
        location: 'India',
        logbookEntryId: 'f-083-2',
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
        coordinates: LOCATIONS.BOMBAY,
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

// Vintage Stamp Component
const OfficialStamp: React.FC<{ text: string; rotate?: number }> = ({ text, rotate = -12 }) => (
  <div 
    className="absolute -right-2 -top-2 sm:right-4 sm:top-4 pointer-events-none select-none"
    style={{ transform: `rotate(${rotate}deg)` }}
  >
    <div className="border-4 border-red-800/60 rounded px-2 py-1 sm:px-3 sm:py-1">
      <span className="font-typewriter text-red-800/60 text-[10px] sm:text-xs font-bold tracking-widest">
        {text}
      </span>
    </div>
  </div>
);

// Chapter Tab Component for the top navigation
const ChapterTab: React.FC<{
  chapter: JourneyChapter;
  isActive: boolean;
  onClick: () => void;
}> = ({ chapter, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={chapter.title}
      className={`
        relative flex items-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 
        font-typewriter text-xs sm:text-sm whitespace-nowrap
        border-t-2 border-l border-r rounded-t-sm
        transition-all duration-300 ease-out
        ${isActive 
          ? 'bg-[#f4f1ea] border-amber-900/30 text-amber-900 -mb-px z-10 shadow-sm px-3 sm:px-4' 
          : 'bg-[#e8e4d9] border-amber-900/20 text-amber-800/60 hover:bg-[#ebe7dc] hover:text-amber-900/80'
        }
        ${!isActive && isHovered ? 'px-3 sm:px-4 z-20' : !isActive ? 'px-2.5 sm:px-4' : ''}
      `}
    >
      <span className={isActive ? 'text-amber-800' : 'text-amber-700/50'}>{chapter.icon}</span>
      
      {/* Desktop: always show text */}
      <span className="hidden sm:inline">{chapter.title}</span>
      
      {/* Mobile: show truncated text by default, full text on hover */}
      <span className={`
        sm:hidden transition-all duration-300 ease-out
        ${isActive || isHovered ? '' : 'max-w-12 truncate'}
      `}>
        {chapter.title}
      </span>
    </button>
  );
};

// Chapter Card Component
const ChapterCard: React.FC<{
  chapter: JourneyChapter;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ chapter, isExpanded, onToggle }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="relative">
      {/* Paper texture background */}
      <div className="absolute inset-0 bg-[#f4f1ea] rounded-sm shadow-md" />
      
      {/* Aged paper edge effect */}
      <div className="absolute inset-0 rounded-sm shadow-inner pointer-events-none" 
           style={{ boxShadow: 'inset 0 0 30px rgba(139, 119, 101, 0.15)' }} />
      
      {/* Official Stamp */}
      {chapter.stampText && <OfficialStamp text={chapter.stampText} rotate={-8 + Math.random() * 6} />}
      
      {/* Content */}
      <div className="relative">
        {/* Chapter Header */}
        <button
          onClick={onToggle}
          className="w-full text-left p-4 sm:p-6 rounded-sm transition-colors hover:bg-amber-50/30 active:bg-amber-100/30"
        >
          <div className="flex items-start gap-3 sm:gap-4 pr-16 sm:pr-20">
            {/* Icon with circle border */}
            <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-amber-900/40 bg-amber-50 flex items-center justify-center">
              <span className="text-amber-900">{chapter.icon}</span>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-1">
                <h2 className="font-old-print text-xl sm:text-2xl font-bold text-amber-950 leading-tight">
                  {chapter.title}
                </h2>
                <span className="font-typewriter text-xs text-amber-700/70">{chapter.dateRange}</span>
              </div>
              <p className="font-old-print text-sm sm:text-base text-amber-900/80 italic mb-2">{chapter.subtitle}</p>
              <p className="font-typewriter text-xs sm:text-sm text-amber-800/70 leading-relaxed line-clamp-2 sm:line-clamp-none">
                {chapter.summary}
              </p>
            </div>
            
            {/* Expand Icon */}
            <div className="absolute right-4 top-4 sm:right-6 sm:top-6 w-8 h-8 rounded-full border border-amber-900/30 bg-amber-50 flex items-center justify-center">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-amber-900" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amber-800/60" />
              )}
            </div>
          </div>
        </button>
        
        {/* Divider line when expanded */}
        {isExpanded && (
          <div className="mx-4 sm:mx-6 border-t border-dashed border-amber-900/20" />
        )}
        
        {/* Expanded Content */}
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div ref={contentRef} className="p-4 sm:p-6 pt-4">
            {/* Timeline */}
            <div className="relative ml-2 sm:ml-4 border-l-2 border-amber-900/20 pl-4 sm:pl-8 space-y-4 sm:space-y-6">
              {chapter.moments.map((moment, idx) => (
                <MomentCard 
                  key={moment.id} 
                  moment={moment} 
                  isLast={idx === chapter.moments.length - 1}
                  index={idx}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Moment Card Component
const MomentCard: React.FC<{
  moment: JourneyMoment;
  isLast: boolean;
  index?: number; // Position in list for staggered animations
}> = ({ moment, isLast, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (moment.coordinates) {
      navigate(`/?lat=${moment.coordinates.lat}&lng=${moment.coordinates.lng}&zoom=8`);
    }
  };

  const handleLogbookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (moment.logbookEntryId) {
      navigate(`/?entryId=${moment.logbookEntryId}`);
    }
  };
  
  // Significance styling
  const isMilestone = moment.significance === 'milestone';
  const isMajor = moment.significance === 'major';
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline Dot */}
      <div className={`
        absolute -left-4 sm:-left-8 top-1 transform -translate-x-1/2 
        border-2 sm:border-[3px] border-[#f4f1ea] rounded-full
        ${isMilestone 
          ? 'w-4 h-4 sm:w-5 sm:h-5 bg-red-800' 
          : isMajor
            ? 'w-3 h-3 sm:w-4 sm:h-4 bg-amber-700'
            : 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-600/60'
        }
      `} />
      
      {/* Content Card - looks like a logbook entry */}
      <div className={`
        relative p-3 sm:p-4 rounded-sm transition-all duration-200 
        border shadow-sm
        ${isMilestone 
          ? 'bg-amber-100/80 border-amber-800/30 shadow-amber-900/10' 
          : isHovered 
            ? 'bg-white border-amber-700/40 shadow-md shadow-amber-900/10 -translate-y-0.5' 
            : 'bg-[#faf8f4] border-amber-800/20'
        }
      `}>
        {/* Red "important" marker for milestones */}
        {isMilestone && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-800/70 rounded-l-sm" />
        )}
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-amber-800/70">{getMomentIcon(moment.type)}</span>
              <span className="font-typewriter text-[10px] sm:text-xs text-amber-700/80 bg-amber-100/50 px-1.5 py-0.5 rounded">
                {moment.date}
              </span>
              {isMilestone && (
                <span className="font-typewriter text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-red-800/80 text-amber-50 rounded tracking-wider">
                  KEY MOMENT
                </span>
              )}
            </div>
            <h3 className="font-old-print text-base sm:text-lg font-semibold text-amber-950 leading-tight">
              {moment.title}
            </h3>
            {moment.subtitle && (
              <p className="font-old-print text-xs sm:text-sm text-amber-800/70 italic">{moment.subtitle}</p>
            )}
          </div>
          {moment.location && (
            <button 
              onClick={handleLocationClick}
              disabled={!moment.coordinates}
              className={`
                flex items-center gap-1 font-typewriter text-[10px] sm:text-xs shrink-0 
                px-2 py-1 rounded transition-colors
                ${moment.coordinates 
                  ? 'text-amber-800/70 hover:text-amber-900 hover:bg-amber-100/50 active:bg-amber-200/50 cursor-pointer' 
                  : 'text-amber-700/50 cursor-default'
                }
              `}
            >
              <MapPin className="w-3 h-3" />
              <span className="max-w-24 sm:max-w-none truncate">{moment.location}</span>
            </button>
          )}
        </div>
        
        {/* Description */}
        <p className="font-typewriter text-xs sm:text-sm text-amber-900/80 leading-relaxed mb-3">
          {moment.description}
        </p>
        
        {/* Quote - styled like handwritten note with typewriter effect */}
        {moment.quote && (
          <div className="relative my-3 sm:my-4 ml-2 sm:ml-4 pl-3 sm:pl-4 border-l-2 border-amber-700/30">
            <p className="font-handwriting text-sm sm:text-base text-amber-800 leading-relaxed italic">
              "<TypewriterText 
                text={moment.quote}
                speed={30}
                startDelay={index * 150} // Stagger based on position
                triggerOnView={true}
                viewThreshold={0.95} // Only start when almost fully visible
                showCursor={true}
                cursor="│"
                cursorBlinkAfter={true}
                cursorClassName="text-amber-600/70 font-normal"
                variableSpeed={true}
              />"
            </p>
            {moment.quoteSource && (
              <p className="font-typewriter text-[10px] sm:text-xs text-amber-700/70 mt-1">
                — {moment.quoteSource}
              </p>
            )}
          </div>
        )}
        
        {/* Stats & Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-dashed border-amber-900/15">
          {/* Stats */}
          {moment.stats && moment.stats.length > 0 ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {moment.stats.map((stat, idx) => (
                <div key={idx} className="flex items-baseline gap-1.5">
                  <span className="font-typewriter text-[10px] sm:text-xs text-amber-700/70">{stat.label}:</span>
                  <span className="font-typewriter text-xs sm:text-sm font-bold text-amber-900">{stat.value}</span>
                </div>
              ))}
            </div>
          ) : <div />}

          {/* View in Logbook Button */}
          {moment.logbookEntryId && (
            <button
              onClick={handleLogbookClick}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-sm 
                font-typewriter text-[10px] sm:text-xs tracking-wider
                border border-amber-900/30 transition-all
                ${isHovered 
                  ? 'bg-amber-900/10 text-amber-900 border-amber-900/40' 
                  : 'bg-amber-50 text-amber-800/80'
                }
                hover:bg-amber-900 hover:text-amber-50 hover:border-amber-900
                active:scale-95
              `}
            >
              <BookOpen className="w-3 h-3" />
              <span>VIEW ENTRY</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Hero Section - Styled like a logbook cover
const HeroSection: React.FC = () => {
  return (
    <div className="relative mb-6 sm:mb-8">
      {/* Leather-like cover background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-amber-900 to-stone-900 rounded-sm shadow-xl" />
      
      {/* Worn leather texture overlay */}
      <div className="absolute inset-0 opacity-20 rounded-sm"
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
           }} />
      
      {/* Gold embossed border effect */}
      <div className="absolute inset-3 sm:inset-4 border border-amber-600/30 rounded-sm pointer-events-none" />
      <div className="absolute inset-4 sm:inset-5 border border-amber-600/20 rounded-sm pointer-events-none" />
      
      {/* Content */}
      <div className="relative p-5 sm:p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Left: Text Content */}
          <div className="flex-1 text-center md:text-left">
            {/* RAF Wings decoration */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-amber-600/50" />
              <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500/80" />
              <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-amber-600/50" />
            </div>
            
            <p className="font-typewriter text-amber-500/70 text-[10px] sm:text-xs tracking-[0.2em] mb-2">
              ROYAL AIR FORCE · 1940-1946
            </p>
            
            <h1 className="font-old-print text-3xl sm:text-4xl md:text-5xl font-bold text-amber-100 mb-3 leading-tight">
              The Hero's Journey
            </h1>
            
            <p className="font-old-print text-lg sm:text-xl md:text-2xl text-amber-400 italic mb-4">
              Flight Lieutenant Robin A. Glen
            </p>
            
            <p className="font-typewriter text-xs sm:text-sm text-amber-200/70 leading-relaxed max-w-xl mx-auto md:mx-0">
              From the training fields of Scotland to the beaches of Normandy, from bomber escorts over 
              Germany to ferrying Spitfires across India—this is the remarkable story of one pilot's 
              six years of service in the Royal Air Force.
            </p>
            
            {/* Quick Stats - styled like official records */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="text-center px-3 py-2 border border-amber-600/30 rounded-sm bg-amber-950/30">
                <div className="font-old-print text-2xl sm:text-3xl font-bold text-amber-400">6+</div>
                <div className="font-typewriter text-[9px] sm:text-[10px] text-amber-500/70 tracking-wider">YEARS</div>
              </div>
              <div className="text-center px-3 py-2 border border-amber-600/30 rounded-sm bg-amber-950/30">
                <div className="font-old-print text-2xl sm:text-3xl font-bold text-red-400">51+</div>
                <div className="font-typewriter text-[9px] sm:text-[10px] text-amber-500/70 tracking-wider">MISSIONS</div>
              </div>
              <div className="text-center px-3 py-2 border border-amber-600/30 rounded-sm bg-amber-950/30">
                <div className="font-old-print text-2xl sm:text-3xl font-bold text-amber-400">697+</div>
                <div className="font-typewriter text-[9px] sm:text-[10px] text-amber-500/70 tracking-wider">HOURS</div>
              </div>
              <div className="text-center px-3 py-2 border border-amber-600/30 rounded-sm bg-amber-950/30">
                <div className="font-old-print text-2xl sm:text-3xl font-bold text-amber-400">3</div>
                <div className="font-typewriter text-[9px] sm:text-[10px] text-amber-500/70 tracking-wider">CONTINENTS</div>
              </div>
            </div>
          </div>
          
          {/* Right: Squadron Badge */}
          <div className="shrink-0">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
              {/* Subtle glow */}
              <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl" />
              {/* Badge frame */}
              <div className="relative w-full h-full rounded-full border-4 border-amber-700/40 bg-amber-950/50 flex items-center justify-center overflow-hidden shadow-lg">
                <img 
                  src="./robin-insignia.png" 
                  alt="313 Squadron Insignia" 
                  className="w-full h-full object-cover opacity-90"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="text-center p-4">
                          <div class="font-old-print text-4xl sm:text-5xl font-bold text-amber-500 mb-1">313</div>
                          <div class="font-typewriter text-[10px] text-amber-400/80 tracking-widest">SQUADRON</div>
                          <div class="font-typewriter text-[8px] text-amber-500/60 mt-1">CZECH WING</div>
                        </div>
                      `;
                    }
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
  const [activeIndex, setActiveIndex] = useState(1);
  
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
    <div className="flex-1 overflow-y-auto bg-[#d4cfc4]">
      {/* Aged paper texture for the whole background */}
      <div 
        className="min-h-full"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 20%, rgba(139, 119, 101, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(139, 119, 101, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(244, 241, 234, 0.5) 0%, transparent 100%)
          `
        }}
      >
        <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
          {/* Hero Section */}
          <HeroSection />
          
          {/* Chapter Tabs - like index tabs on a binder */}
          <div className="sticky top-0 z-10 bg-[#d4cfc4]/95 backdrop-blur-sm pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6">
            {/* Scroll container with vintage scrollbar */}
            <div className="relative">
              <div className="flex items-end gap-1 overflow-x-auto pb-3 vintage-scrollbar">
                {HERO_JOURNEY.map((chapter, idx) => (
                  <ChapterTab
                    key={chapter.id}
                    chapter={chapter}
                    isActive={idx === activeIndex}
                    onClick={() => handleProgressSelect(idx)}
                  />
                ))}
                {/* Spacer to ensure last tab isn't cut off */}
                <div className="shrink-0 w-4" aria-hidden="true" />
              </div>
              {/* Fade hints showing more content */}
              <div className="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-[#d4cfc4] to-transparent pointer-events-none sm:hidden" />
            </div>
            {/* Tab bar bottom border */}
            <div className="h-px bg-amber-900/20" />
          </div>
          
          {/* Chapters - like pages in a logbook */}
          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {HERO_JOURNEY.map((chapter, idx) => (
              <div key={chapter.id} id={`chapter-${chapter.id}`}>
                <ChapterCard
                  chapter={chapter}
                  isExpanded={expandedChapter === chapter.id}
                  onToggle={() => handleChapterToggle(chapter.id)}
                />
              </div>
            ))}
          </div>
          
          {/* Footer - like the last page of a logbook */}
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-[#f4f1ea] rounded-sm border border-amber-900/10 shadow-sm relative overflow-hidden">
            {/* Coffee stain effect */}
            <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-amber-800/5 blur-sm" />
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full border border-amber-800/10" />
            
            <p className="font-handwriting text-base sm:text-lg text-amber-800 text-center italic relative z-10">
              "After over 6 years in RAF... Travelled to Bombay by train and back home by sea—on the M.V. 'Durham Castle'"
            </p>
            <p className="font-typewriter text-[10px] sm:text-xs text-amber-700/60 text-center mt-2 relative z-10">
              — Robin Glen's final logbook entry, March 1946
            </p>
            
            {/* Official stamp look */}
            <div className="flex justify-center mt-4">
              <div className="border-2 border-amber-800/30 rounded px-3 py-1 transform -rotate-2">
                <span className="font-typewriter text-[10px] sm:text-xs text-amber-800/50 tracking-widest">
                  SERVICE COMPLETE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroJourney;
