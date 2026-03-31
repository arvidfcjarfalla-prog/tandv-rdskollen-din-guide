import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Berätta vad som hänt",
    description:
      "Ange postnummer och välj spår. Behöver du undersökning, eller vet du redan vad du behöver? Ingen registrering, inga konton.",
    details: [
      { label: "Tid", value: "Ca 2 minuter" },
      { label: "Kostnad", value: "Gratis" },
      { label: "Du behöver", value: "Postnummer" },
    ],
  },
  {
    number: "02",
    title: "Kliniker svarar med riktiga offerter",
    description:
      "Exakt pris, vad som ingår och närmaste lediga tid. Inte en generell prislista — ett faktiskt erbjudande baserat på just din situation.",
    details: [
      { label: "Svarstid", value: "Inom 24 timmar" },
      { label: "Du får", value: "Pris + tid + scope" },
      { label: "Bindande?", value: "Ja, för kliniken" },
    ],
  },
  {
    number: "03",
    title: "Jämför och välj",
    description:
      "Alla offerter visas med samma fält: pris, tid, avstånd, betyg. Samma format, inga dolda kostnader. Du väljer när du är redo.",
    details: [
      { label: "Format", value: "Standardiserat" },
      { label: "Ordning", value: "Pris, tid, avstånd" },
      { label: "Förpliktelse", value: "Ingen förrän du väljer" },
    ],
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const card = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-bg-base border-t border-border">
      <motion.div
        className="max-w-wide mx-auto"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <motion.div
              key={step.number}
              variants={card}
              className="bg-white border border-border rounded-lg p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-mono text-sm font-semibold">
                  {step.number}
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>

              <h3 className="font-display text-lg mb-3">{step.title}</h3>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                {step.description}
              </p>

              <div className="pt-6 border-t border-border space-y-3">
                {step.details.map((detail) => (
                  <div key={detail.label} className="flex justify-between text-sm">
                    <span className="text-text-tertiary">{detail.label}:</span>
                    <span className="font-semibold text-text-primary">{detail.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
