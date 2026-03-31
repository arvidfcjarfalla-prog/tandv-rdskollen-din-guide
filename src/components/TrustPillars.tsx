import { motion } from "framer-motion";
import { Shield, FileCheck, HandCoins, Scale } from "lucide-react";

const PILLARS = [
  {
    icon: Shield,
    title: "Priserna är riktmärken",
    description: "Baserat på öppen referensdata från TLV — inte ett löfte.",
  },
  {
    icon: FileCheck,
    title: "Offerter är bindande",
    description: "Kliniken står bakom sitt pris under giltighetstiden.",
  },
  {
    icon: HandCoins,
    title: "Inget val, ingen kostnad",
    description: "Du betalar ingenting förrän du aktivt väljer klinik.",
  },
  {
    icon: Scale,
    title: "Vi tjänar inget på ditt val",
    description: "Ordningen bestäms av data, inte av vem som betalar.",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

export function TrustPillars() {
  return (
    <section id="trust" className="py-24 px-6 bg-bg-base">
      <motion.div
        className="max-w-wide mx-auto"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div key={pillar.title} variants={item} className="text-center">
                <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-2 text-text-primary">{pillar.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
