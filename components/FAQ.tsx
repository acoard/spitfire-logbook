import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "Who was Robin Glen?",
    answer: "Robin A. Glen was a Royal Air Force pilot who served during World War II. He flew Spitfires with 313 Squadron (a Czechoslovak unit in the RAF) and other squadrons. His flying logbook, preserved in this digital archive, documents his service from training through operational flights between 1943-1946, including missions over Europe during the final years of the war."
  },
  {
    question: "What is this website about?",
    answer: "This is an interactive digital archive that brings Robin Glen's WW2 flying logbook to life. It combines his original handwritten logbook pages with modern technology to create an immersive historical experience. You can explore his flight records, view his routes on an interactive map, see historical photographs, and learn about the context of his missions through AI-powered historical insights."
  },
  {
    question: "Are these real historical documents?",
    answer: "Yes! The logbook pages shown in the Gallery are scans of Robin Glen's actual handwritten RAF flying logbook. The flight data has been carefully transcribed from these original documents. Every flight record, aircraft type, and duty description comes directly from his personal service records."
  },
  {
    question: "What aircraft did Robin Glen fly?",
    answer: "Robin Glen primarily flew the Supermarine Spitfire, Britain's iconic WW2 fighter aircraft. His logbook records show him flying various marks (versions) of the Spitfire, including the Spitfire V and Spitfire IX. He also flew training aircraft like the Miles Master and various other types during his service."
  },
  {
    question: "What was 313 Squadron?",
    answer: "313 (Czechoslovak) Squadron was a fighter squadron of the Royal Air Force during World War II. It was formed in 1941 and was manned primarily by Czechoslovak pilots who had escaped occupied Czechoslovakia to continue fighting against Nazi Germany. The squadron flew Spitfires and participated in many operations including fighter sweeps, bomber escorts, and defensive patrols."
  },
  {
    question: "What do the flight duty codes mean?",
    answer: "Robin's logbook uses various duty codes that were standard RAF terminology: 'G.C.I.' refers to Ground Controlled Interception missions, 'Ramrod' was a bomber escort mission, 'Rodeo' was a fighter sweep, 'Dusk Patrol' involved defensive flying at twilight, 'Air Firing' was gunnery practice, and 'Affiliation' meant training exercises with other aircraft types. 'Air Test' was a pre-flight check of the aircraft."
  },
  {
    question: "How accurate is the map visualization?",
    answer: "The map shows actual airfields and locations mentioned in Robin Glen's logbook. Flight paths between locations are visualized based on the recorded origins and destinations. While the exact routes flown cannot be known, the airfield locations are historically accurate and the visualization gives a sense of the geographic scope of his wartime service."
  },
  {
    question: "What is the Hero's Journey section?",
    answer: "The Hero's Journey is a narrative timeline that presents Robin Glen's wartime experience as a chronological story. It highlights key moments, missions, and milestones from his service, providing context and bringing the raw logbook data to life through storytelling and historical imagery."
  },
  {
    question: "How was the historical context generated?",
    answer: "The AI-powered historical insights are generated using Google's Gemini AI, which analyzes each logbook entry and provides educational context about the aircraft, operations, locations, and historical events relevant to that specific flight. This helps modern readers understand the significance of seemingly routine entries."
  },
  {
    question: "Can I view the original logbook pages?",
    answer: "Yes! Visit the Gallery section and select the 'Logbook' tab to browse through high-resolution scans of every page from Robin Glen's original flying logbook. You can tap on any page to view it full-size and navigate through all 29 pages using keyboard arrows or swipe gestures on mobile."
  },
  {
    question: "Who created this project?",
    answer: "This digital archive was created as a tribute to Robin Glen and the countless RAF pilots who served during World War II. It was built using modern web technologies (React, TypeScript, Tailwind CSS) to preserve and share this piece of aviation history with future generations."
  },
  {
    question: "How can I learn more about WW2 aviation?",
    answer: "The Videos section in the Gallery contains historical footage of RAF Spitfires in action during World War II. For deeper research, we recommend visiting the Imperial War Museum, the RAF Museum, and reading firsthand accounts from other WW2 pilots. Books like 'First Light' by Geoffrey Wellum provide excellent personal perspectives on flying Spitfires."
  }
];

export const FAQ: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-stone-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
            <HelpCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-amber-500 mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-stone-400 text-sm sm:text-base max-w-xl mx-auto">
            Learn more about Robin Glen, his wartime service, and how this digital archive was created.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {FAQ_DATA.map((item, index) => (
            <div
              key={index}
              className="bg-stone-800 border border-stone-700 rounded-lg overflow-hidden transition-all duration-200 hover:border-stone-600"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-left gap-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-inset"
                aria-expanded={expandedIndex === index}
              >
                <span className="text-stone-200 font-medium text-sm sm:text-base pr-2">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-amber-500 shrink-0 transition-transform duration-300 ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-4 sm:px-6 pb-4 pt-0">
                  <div className="border-t border-stone-700 pt-4">
                    <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-10 sm:mt-12 text-center">
          <div className="inline-block bg-stone-800/50 border border-stone-700 rounded-lg px-6 py-4">
            <p className="text-stone-500 text-xs sm:text-sm">
              Have more questions? This archive is a living project dedicated to preserving 
              the memory of those who served.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
