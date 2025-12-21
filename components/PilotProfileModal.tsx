import React, { useState } from 'react';
import { X, Award, User, FileText, Stamp, ExternalLink } from 'lucide-react';
import ImageModal from './ImageModal';

interface PilotProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PilotProfileModal: React.FC<PilotProfileModalProps> = ({ isOpen, onClose }) => {
  const [showReportCard, setShowReportCard] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-stone-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#f4f1ea] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl relative flex flex-col md:flex-row border-4 border-stone-800">
        
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] z-0"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-stone-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* LEFT PANEL: BIOGRAPHY */}
        <div className="flex-1 p-8 md:border-r-2 border-stone-300 relative z-10">
          <div className="mb-6 flex items-center gap-3 border-b-2 border-stone-800 pb-4">
             <img
                src="robin-square.jpg"
                alt="Flight Lieutenant Robin Glen"
                className="w-16 h-16 border-2 border-stone-400 shadow-inner object-cover"
             />
             <div>
                <h2 className="font-typewriter text-2xl font-bold text-stone-900 uppercase tracking-widest">Service Record</h2>
                <p className="font-mono text-xs text-stone-600">ROYAL AIR FORCE — PERSONNEL FORM</p>
             </div>
          </div>

          <div className="prose prose-stone prose-sm font-old-print text-stone-800 leading-relaxed">
            <h3 className="font-typewriter text-lg font-bold uppercase text-stone-900 border-b border-stone-400 mb-2">I. Personal Particulars</h3>
            
            <p className="mb-4">
              <span className="font-bold">Name:</span> F/Lt R.A. Glen (Robin)<br/>
              <span className="font-bold">Service Period:</span> 1941 – 1946<br/>
              <span className="font-bold">Total Flying Hours:</span> 697 hrs 40 mins (as of Mar 1946)
            </p>

            <p>
              Flight Lieutenant Robin Glen was a decorated Royal Air Force pilot whose service spanned intensive WWII operations and crucial post-war logistical ferry duties.
              His early training involved flying aircraft types such as Tiger Moth, Harvard II, Master II, Spitfire I & II, Martinet, and Hurricane II at various training and operational units including I.T.E.U. Tealing and 84 G.S.U. Aston Down.
            </p>

            <h4 className="font-bold font-typewriter uppercase text-xs mt-4 mb-2 text-stone-600">World War II Operations</h4>
            <p>
              By June 1944, Glen had entered operational service flying Spitfire IX aircraft with the 313 (Czech) Squadron.
              This period placed him directly in one of the most significant military actions of the war:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li><strong className="font-typewriter text-xs uppercase">D-Day Support:</strong> Flew Beach Head Patrols starting June 6, 1944. Marginal notes describe "what could be a more dramatic way of starting on ops' than to fly daily over the tiny beach head where the Allies struggled to get ashore."</li>
              <li><strong className="font-typewriter text-xs uppercase">Combat Missions:</strong> Duties included Convoy Patrols (including the Invasion Fleet), Dive Bombing, Armed Recce, and Front Line Patrols. Participated in long-range Bomber Escorts to targets including Hamburg, Duisburg, Cologne, and Dortmund.</li>
              <li>Logged over 50 operational sorties during the war, with 133 hours 05 mins of operational flying time.</li>
            </ul>

            <h4 className="font-bold font-typewriter uppercase text-xs mt-4 mb-2 text-stone-600">Post-War Service</h4>
            <p>
              Following VE-Day (May 1945), Glen transferred to 202 S.P. Ferry Flight RAF, based at R.A.F. Station Drigh Road, Karachi. Operating aircraft including the Spitfire XIV, Lysander, and Dakota he executed extensive ferry runs across the Indian subcontinent connecting Karachi, Jodhpur, Delhi, Allahabad, Calcutta, Rangoon, and Bangkok.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: ASSESSMENTS & AWARDS */}
        <div className="flex-1 p-8 bg-stone-100/50 relative z-10">
           {/* Stamp Effect */}
           <div className="absolute top-10 right-10 transform rotate-12 opacity-80 pointer-events-none border-4 border-red-900 text-red-900 p-2 rounded-sm font-typewriter font-bold text-xl uppercase tracking-widest">
              Verified
           </div>

           <h3 className="font-typewriter text-lg font-bold uppercase text-stone-900 border-b border-stone-400 mb-6">II. Assessments & Decorations</h3>

           {/* Decorations */}
           <div className="mb-8">
             <div className="flex items-start gap-4 bg-amber-50 p-4 border border-amber-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                <Award className="w-10 h-10 text-amber-600 flex-shrink-0" />
                <div>
                   <h4 className="font-typewriter font-bold text-lg text-stone-900">Czechoslovak Military Cross</h4>
                   <p className="font-old-print text-sm text-stone-700 mt-1">
                     Awarded for "active fighting against the enemy." Highlighted in correspondence as the highest Czech decoration for operational service.
                     <a 
                        href="https://en.wikipedia.org/wiki/Czechoslovak_War_Cross_1939" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="underline text-blue-700 hover:text-blue-900 ml-1 font-mono text-xs align-baseline"
                     >
                        (<ExternalLink className="w-3 h-3 inline-block" /> wiki)
                     </a>

                   </p>
                </div>
             </div>
           </div>

           {/* Assessment Table */}
           <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                 <h4 className="font-typewriter text-sm font-bold uppercase text-stone-700">Summary of Flying & Assessments</h4>
                 <span className="font-mono text-xs text-stone-500">Form 414A (May 26, 1944)</span>
              </div>
              
              <table className="w-full text-sm font-old-print border-collapse border border-stone-400 bg-white">
                 <thead className="bg-stone-200 font-typewriter text-xs uppercase text-stone-600">
                    <tr>
                       <th className="border border-stone-400 p-2 text-left">Ability Category</th>
                       <th className="border border-stone-400 p-2 text-left">Assessment</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr>
                       <td className="border border-stone-400 p-2 font-bold text-stone-800">As a Pilot</td>
                       <td className="border border-stone-400 p-2 font-handwriting text-lg text-blue-900">Good Average</td>
                    </tr>
                    <tr>
                       <td className="border border-stone-400 p-2 font-bold text-stone-800">As Pilot-Navigator</td>
                       <td className="border border-stone-400 p-2 text-stone-400 italic">N/A</td>
                    </tr>
                    <tr>
                       <td className="border border-stone-400 p-2 font-bold text-stone-800">In Bombing</td>
                       <td className="border border-stone-400 p-2 font-handwriting text-lg text-blue-900">Average</td>
                    </tr>
                    <tr>
                       <td className="border border-stone-400 p-2 font-bold text-stone-800">As Air Gunner</td>
                       <td className="border border-stone-400 p-2 font-handwriting text-lg text-blue-900">Average</td>
                    </tr>
                    <tr>
                       <td className="border border-stone-400 p-2 font-bold text-stone-800">Rocket Propelled Bombs</td>
                       <td className="border border-stone-400 p-2 font-handwriting text-lg text-blue-900">Above Average</td>
                    </tr>
                       <td className="border border-stone-400 p-2 font-bold text-stone-800">Areas Needing Improvement</td>
                       <td className="border border-stone-400 p-2 font-handwriting text-lg text-blue-900">None</td>                   <tr>
                    </tr>
                    {/* <tr>
                       <td className="border border-stone-400 p-2 font-bold text-stone-800">W/S – S/H</td>
                       <td className="border border-stone-400 p-2 font-handwriting text-lg text-blue-900">Good Average</td>
                    </tr> */}
                 </tbody>
              </table>
              <button 
                onClick={() => setShowReportCard(true)}
                className="mt-3 text-xs flex items-center gap-1 text-amber-700 hover:text-amber-900 font-bold font-typewriter uppercase tracking-wider transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> View Original Report Card
              </button>
              <p className="mt-2 font-mono text-xs text-stone-500 italic">
                 "Any points in flying or airmanship which should be watched" — [BLANK]
              </p>
              <p className="mt-4 font-mono text-[10px] text-stone-400 border-t border-stone-200 pt-2 leading-tight">
                 * Historical Context: In RAF evaluations of this period, "Average" and "Good Average" denoted a fully proficient, reliable pilot trusted with operational duties. "Above Average" was rare, typically reserved for exceptional test-pilot level handling.
              </p>
              

           </div>
           
           <div className="mt-8 border-t-2 border-stone-300 pt-4 flex justify-between items-end">
             <div>
                <p className="font-typewriter text-xs uppercase text-stone-500">Officer Commanding</p>
                <div className="font-handwriting text-xl text-stone-800 mt-2">Cerdan Norwood W/Cdr</div>
                <p className="font-mono text-[10px] text-stone-500">O.C. 1 T.E.U.</p>
             </div>
             <div className="text-right">
                <p className="font-typewriter text-xs uppercase text-stone-500">Date</p>
                <div className="font-typewriter text-sm text-stone-800 mt-1">26 MAY 1944</div>
             </div>
           </div>

        </div>

      </div>
      
      <ImageModal
        isOpen={showReportCard}
        onClose={() => setShowReportCard(false)}
        imageSrc="report-card.png"
        altText="Original Pilot Assessment Form 414A"
      />
    </div>
  );
};

export default PilotProfileModal;