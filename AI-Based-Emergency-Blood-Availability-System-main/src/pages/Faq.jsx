import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import "../styles/Faq.css";

function Faq() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    if (openFaq === index) setOpenFaq(null);
    else setOpenFaq(index);
  };

  const faqs = [
    { 
      q: "Q1. Who is eligible to donate blood?", 
      a: "Generally, healthy individuals aged 18-65, weighing at least 50kg, can donate blood. You should not have any infections, chronic diseases, or recent tattoos/piercings (within 6 months)." 
    },
    { 
      q: "Q2. How often can I donate blood?", 
      a: "You can donate whole blood every 8-12 weeks (2-3 months). This allows your body enough time to replenish the donated blood cells." 
    },
    { 
      q: "Q3. Does donating blood hurt?", 
      a: "You may feel a slight pinch when the needle is inserted, but the process is generally painless. Most donors report feeling fine during and after donation." 
    },
    { 
      q: "Q4. How long does the donation process take?", 
      a: "The entire process, including registration, screening, and donation, typically takes 45-60 minutes. The actual blood collection takes only 10-15 minutes." 
    },
    { 
      q: "Q5. What should I do before donating?", 
      a: "Eat a healthy meal, drink plenty of water, avoid fatty foods, and get a good night's sleep before donating. Bring a valid ID and list of any medications you're taking." 
    },
    { 
      q: "Q6. Can I donate if I have a cold or flu?", 
      a: "No, you should wait until you're fully recovered and feeling well. Being sick can affect your ability to donate safely and may compromise the quality of your donation." 
    },
    {
      q: "Q7. Can I donate blood if I have diabetes?",
      a: "Yes, people with diabetes (both Type 1 and Type 2) can donate blood as long as their condition is well-managed, they are otherwise healthy, and their blood sugar levels are stable at the time of donation."
    },
    {
      q: "Q8. Is there any risk of catching an infection from donating?",
      a: "There is absolutely no risk of catching an infection like HIV or hepatitis by donating blood. Every donor is provided with a new, sterile, disposable needle that is used only once and then safely discarded."
    },
    {
      q: "Q9. How much blood is taken during a single donation session?",
      a: "During a standard whole blood donation, approximately 350ml to 450ml of blood is collected. This is about 8-10% of your total blood volume, which your body naturally replenishes quickly."
    },
    {
      q: "Q10. Who benefits from my blood donation?",
      a: "Your donation can help a wide variety of patients, including those undergoing complex surgeries, trauma victims, cancer patients, new mothers with complications, and people with chronic conditions like sickle cell anemia."
    }
  ];

  return (
    <div className="faq-page-wrapper">
      <h1 className="faq-page-title">FAQs</h1>
      <div className="faq-page-container">
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div 
              key={idx} 
              className={`faq-page-item ${isOpen ? 'active' : ''}`} 
              onClick={() => toggleFaq(idx)}
            >
              <div className="faq-page-question">
                {faq.q}
                <ChevronDown size={20} className={`faq-page-chevron ${isOpen ? "open" : ""}`} />
              </div>
              <div 
                className="faq-page-answer-wrapper" 
                style={{ maxHeight: isOpen ? "200px" : "0px" }}
              >
                <div className="faq-page-answer">{faq.a}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Faq;
