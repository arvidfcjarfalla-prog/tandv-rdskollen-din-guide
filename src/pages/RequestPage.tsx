import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ToothSelector } from "@/components/ToothSelector";
import { TreatmentAutocomplete } from "@/components/TreatmentAutocomplete";
import { FileUpload, type UploadedFile } from "@/components/FileUpload";
import type { Track, WizardForm } from "@/types";
import type { TlvTreatment } from "@/lib/tlv-treatments";

const PAIN_ANCHORS: Record<number, string> = {
  0: "Ingen smärta", 2: "Obehag", 3: "Märkbart", 5: "Påtagligt",
  6: "Svårt att äta", 8: "Kraftig smärta", 9: "Sömnstörande", 10: "Outhärdligt",
};

const DURATION_OPTIONS = [
  "Idag",
  "1–3 dagar",
  "1–2 veckor",
  "Mer än 2 veckor",
  "Kroniskt / återkommande",
];

const PAIN_TRIGGERS = [
  "Varmt",
  "Kallt",
  "Tryck / tuggning",
  "Sötsaker",
  "Spontan (utan orsak)",
  "Vid vila / natt",
];

const MATERIAL_OPTIONS = [
  "Ingen preferens",
  "Porslin",
  "Zirkonium",
  "Komposit",
  "Guld",
  "Titan (implantat)",
];

const COST_PROTECTION_OPTIONS = [
  { value: "under3000", label: "Under 3 000 kr" },
  { value: "3000-15000", label: "3 000 – 15 000 kr" },
  { value: "over15000", label: "Över 15 000 kr" },
  { value: "unknown", label: "Vet inte" },
];

const initialForm: WizardForm = {
  selectedTeeth: [],
  unknownTooth: false,
  symptom: "",
  painLevel: 3,
  symptomDuration: "",
  painTriggers: [],
  swelling: false,
  fever: false,
  bleeding: false,
  knockedTooth: false,
  treatment: "",
  selectedTreatments: [],
  treatmentFreeText: "",
  previousSuggestion: "",
  specialistNeeded: "",
  materialPreference: "",
  uploadedFiles: [],
  birthYear: "",
  bloodThinners: null,
  diabetes: null,
  allergies: null,
  costProtectionLevel: "",
  timePreference: "",
  description: "",
  diagnosNote: "",
  name: "",
  email: "",
  phone: "",
  consent: false,
};

const TOTAL_STEPS = 6;

export default function RequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [postal] = useState(searchParams.get("postal") || "");
  const [track, setTrack] = useState<Track>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof WizardForm>(key: K, value: WizardForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const toggleArrayItem = (key: "painTriggers" | "selectedTeeth", item: string) => {
    setForm((prev) => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] };
    });
  };

  const hasAcute = form.swelling || form.fever || form.bleeding || form.knockedTooth;

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0 && !track) e.track = "Välj ett alternativ";
    if (s === 1 && form.selectedTeeth.length === 0 && !form.unknownTooth) e.teeth = "Välj minst en tand eller markera 'Vet inte exakt'";
    if (s === 2) {
      if (track === "exam" && !form.symptom.trim()) e.symptom = "Beskriv dina symptom";
      if (track === "known" && form.selectedTreatments.length === 0 && !form.treatment.trim() && !form.treatmentFreeText.trim()) e.treatment = "Välj minst en behandling eller beskriv i fritext";
    }
    if (s === 5) {
      if (!form.name.trim()) e.name = "Ange ditt namn";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Ange en giltig e-postadress";
      if (!/^\+?[0-9\s-]{7,}$/.test(form.phone.trim())) e.phone = "Ange ett giltigt telefonnummer";
      if (!form.consent) e.consent = "Du måste godkänna för att fortsätta";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep((s) => s + 1); };
  const back = () => { step === 0 ? navigate("/") : setStep((s) => s - 1); setErrors({}); };
  const submit = () => { if (validate(step)) navigate("/compare"); };

  const dots = Array.from({ length: TOTAL_STEPS }, (_, i) => i);

  return (
    <div className="min-h-screen bg-bg-base py-12 px-6">
      <div className="max-w-content mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-center max-w-[360px] mx-auto mb-8">
          {dots.map((i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                i < step ? "bg-accent text-white" : i === step ? "bg-accent text-white" : "bg-accent-soft text-accent border border-accent"
              )}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < dots.length - 1 && (
                <div className={cn("flex-1 h-[2px] mx-1.5", i < step ? "bg-accent" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        <button onClick={back} className="mb-5 text-text-secondary hover:text-text-primary transition-colors text-sm">
          ← Tillbaka
        </button>

        {/* Step 0: Track */}
        {step === 0 && (
          <Card title="Vad behöver du hjälp med?" subtitle={postal ? `Postnummer: ${postal}` : undefined}>
            <div className="space-y-3 mb-5">
              <TrackButton active={track === "exam"} onClick={() => setTrack("exam")} icon="U" title="Jag behöver undersökas" desc="Undersökning, diagnos och behandling." />
              <TrackButton active={track === "known"} onClick={() => setTrack("known")} icon="B" title="Jag vet vad jag behöver" desc="Du har en diagnos eller vet vilken behandling." />
            </div>
            {errors.track && <p className="text-danger text-xs mb-3">{errors.track}</p>}
            <Hint text="Osäker? Välj undersökning — kliniken hjälper dig vidare." />
            <NavButtons onNext={next} />
          </Card>
        )}

        {/* Step 1: Tooth selector */}
        {step === 1 && (
          <Card title="Vilken tand gäller det?" subtitle="Klicka på den/de tänder som berörs.">
            <div className="py-2">
              <ToothSelector
                selected={form.selectedTeeth}
                onToggle={(t) => toggleArrayItem("selectedTeeth", t)}
                disabled={form.unknownTooth}
              />
            </div>
            <label className="flex items-center gap-2.5 mt-3 cursor-pointer">
              <input type="checkbox" checked={form.unknownTooth} onChange={(e) => { update("unknownTooth", e.target.checked); if (e.target.checked) update("selectedTeeth", []); }} className="sr-only peer" />
              <div className={cn("w-5 h-5 rounded border-[1.5px] flex items-center justify-center transition-colors", form.unknownTooth ? "bg-accent border-accent" : "border-border-strong")}>
                {form.unknownTooth && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span className="text-sm text-text-secondary">Vet inte exakt vilken tand</span>
            </label>
            {errors.teeth && <p className="text-danger text-xs mt-2">{errors.teeth}</p>}
            <NavButtons onBack={back} onNext={next} />
          </Card>
        )}

        {/* Step 2: Symptoms (exam) */}
        {step === 2 && track === "exam" && (
          <Card title="Beskriv vad som hänt" subtitle="Ju mer klinikerna vet, desto bättre offerter.">
            <div className="space-y-5">
              <Field label="Symptom" error={errors.symptom}>
                <textarea value={form.symptom} onChange={(e) => update("symptom", e.target.value)}
                  placeholder="T.ex. värk i en kindtand sedan igår, känslig mot kallt..." rows={3} className={inputCn(errors.symptom)} />
              </Field>
              <Field label="Hur länge har du haft besvären?">
                <div className="flex flex-wrap gap-1.5">
                  {DURATION_OPTIONS.map((d) => <Chip key={d} active={form.symptomDuration === d} onClick={() => update("symptomDuration", d)}>{d}</Chip>)}
                </div>
              </Field>
              <Field label={`Smärtnivå: ${form.painLevel}/10 ${PAIN_ANCHORS[form.painLevel] ? `— ${PAIN_ANCHORS[form.painLevel]}` : ""}`}>
                <input type="range" min="0" max="10" value={form.painLevel} onChange={(e) => update("painLevel", Number(e.target.value))} className="w-full" />
                <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
                  <span>0 – Ingen</span><span>5 – Påtagligt</span><span>10 – Outhärdligt</span>
                </div>
              </Field>
              <Field label="Vad triggar smärtan?">
                <div className="flex flex-wrap gap-1.5">
                  {PAIN_TRIGGERS.map((t) => <Chip key={t} active={form.painTriggers.includes(t)} onClick={() => toggleArrayItem("painTriggers", t)}>{t}</Chip>)}
                </div>
              </Field>
              <Field label="Akutsymptom">
                <div className="flex flex-wrap gap-1.5">
                  {([["swelling", "Svullnad"], ["fever", "Feber"], ["bleeding", "Blödning"], ["knockedTooth", "Utslagen tand"]] as const).map(([key, label]) => (
                    <Chip key={key} active={form[key]} onClick={() => update(key, !form[key])} variant="danger">{label}</Chip>
                  ))}
                </div>
                {hasAcute && <div className="bg-danger-soft border border-danger rounded-md p-3 mt-2 text-danger text-xs font-medium">Akutsymptom markerade — din förfrågan prioriteras.</div>}
              </Field>
            </div>
            <NavButtons onBack={back} onNext={next} />
          </Card>
        )}

        {/* Step 2: Treatment (known) */}
        {step === 2 && track === "known" && (
          <Card title="Vilken behandling behöver du?" subtitle="Sök bland TLV:s referensbehandlingar eller beskriv i fritext.">
            <div className="space-y-5">
              <Field label="Behandling" error={errors.treatment}>
                <TreatmentAutocomplete
                  selected={form.selectedTreatments}
                  onSelect={(t: TlvTreatment) => update("selectedTreatments", [...form.selectedTreatments, t])}
                  onRemove={(code: string) => update("selectedTreatments", form.selectedTreatments.filter((t) => t.code !== code))}
                  freeText={form.treatmentFreeText}
                  onFreeTextChange={(text: string) => update("treatmentFreeText", text)}
                  error={errors.treatment}
                />
              </Field>

              {/* Estimated reference price summary */}
              {form.selectedTreatments.length > 0 && (
                <div className="bg-bg-sunken rounded-md p-3 text-xs text-text-secondary">
                  <p className="font-semibold text-text-primary mb-1">Uppskattat referenspris (allmäntandvård):</p>
                  {form.selectedTreatments.map((t) => (
                    <div key={t.code} className="flex justify-between py-0.5">
                      <span>{t.code} {t.name.length > 45 ? t.name.slice(0, 45) + "…" : t.name}</span>
                      <span className="font-medium">{t.generalPrice?.toLocaleString("sv-SE") ?? "–"} kr</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1.5 mt-1.5 border-t border-border font-semibold text-text-primary">
                    <span>Totalt referenspris</span>
                    <span>{form.selectedTreatments.reduce((s, t) => s + (t.generalPrice ?? 0), 0).toLocaleString("sv-SE")} kr</span>
                  </div>
                </div>
              )}

              <Field label="Materialpreferens (valfritt)">
                <div className="flex flex-wrap gap-1.5">
                  {MATERIAL_OPTIONS.map((m) => <Chip key={m} active={form.materialPreference === m} onClick={() => update("materialPreference", form.materialPreference === m ? "" : m)}>{m}</Chip>)}
                </div>
              </Field>

              <Field label="Bifoga dokument (valfritt)" hint="Röntgenbilder, behandlingsförslag eller andra dokument">
                <FileUpload
                  files={form.uploadedFiles}
                  onAdd={(newFiles: UploadedFile[]) => update("uploadedFiles", [...form.uploadedFiles, ...newFiles])}
                  onRemove={(index: number) => update("uploadedFiles", form.uploadedFiles.filter((_, i) => i !== index))}
                />
              </Field>

              <Field label="Tidigare förslag (valfritt)">
                <textarea value={form.previousSuggestion} onChange={(e) => update("previousSuggestion", e.target.value)}
                  placeholder="Om du fått förslag från annan klinik..." rows={2} className={inputCn()} />
              </Field>
              <Field label="Behov av specialist (valfritt)">
                <input type="text" value={form.specialistNeeded} onChange={(e) => update("specialistNeeded", e.target.value)}
                  placeholder="T.ex. endodontist, parodontolog..." className={inputCn()} />
              </Field>
            </div>
            <NavButtons onBack={back} onNext={next} />
          </Card>
        )}

        {/* Step 3: Health */}
        {step === 3 && (
          <Card title="Kort om din hälsa" subtitle="Hjälper kliniken prissätta rätt och bedöma risker.">
            <div className="space-y-5">
              <Field label="Födelseår">
                <input type="number" value={form.birthYear} onChange={(e) => update("birthYear", e.target.value)}
                  placeholder="T.ex. 1985" min="1930" max="2010" className={inputCn()} />
                {form.birthYear && (() => {
                  const age = new Date().getFullYear() - parseInt(form.birthYear);
                  if (age >= 67) return <p className="text-xs text-positive mt-1">67+: Förstärkt tandvårdsstöd (max referenspris, 90% statligt stöd).</p>;
                  if (age >= 24 && age <= 65) return <p className="text-xs text-text-tertiary mt-1">24–65 år: 300 kr/år i tandvårdsbidrag.</p>;
                  if (age >= 20 && age <= 23) return <p className="text-xs text-text-tertiary mt-1">20–23 år: 600 kr/år i tandvårdsbidrag.</p>;
                  return null;
                })()}
              </Field>
              <Field label="Medicinsk historik">
                <div className="space-y-3">
                  <YesNo label="Tar du blodförtunnande medicin?" value={form.bloodThinners} onChange={(v) => update("bloodThinners", v)} />
                  <YesNo label="Har du diabetes?" value={form.diabetes} onChange={(v) => update("diabetes", v)} />
                  <YesNo label="Allergier mot lokalbedövning eller latex?" value={form.allergies} onChange={(v) => update("allergies", v)} />
                </div>
              </Field>
              <Field label="Högkostnadsskydd" hint="Hur mycket har du betalat i tandvård senaste 12 månaderna?">
                <div className="flex flex-wrap gap-1.5">
                  {COST_PROTECTION_OPTIONS.map((o) => <Chip key={o.value} active={form.costProtectionLevel === o.value} onClick={() => update("costProtectionLevel", form.costProtectionLevel === o.value ? "" : o.value)}>{o.label}</Chip>)}
                </div>
                {form.costProtectionLevel === "3000-15000" && <p className="text-xs text-positive mt-1.5">Du får 50% subvention på belopp över 3 000 kr.</p>}
                {form.costProtectionLevel === "over15000" && <p className="text-xs text-positive mt-1.5">Du får 85% subvention på belopp över 15 000 kr.</p>}
              </Field>
            </div>
            <Hint text="Alla hälsouppgifter är valfria men hjälper kliniken ge en säkrare bedömning." />
            <NavButtons onBack={back} onNext={next} />
          </Card>
        )}

        {/* Step 4: Details */}
        {step === 4 && (
          <Card title="Praktiska detaljer">
            <div className="bg-bg-sunken rounded-md px-4 py-3 mb-5 text-xs text-text-secondary leading-relaxed">
              {track === "exam" ? "Undersökning" : "Känd behandling"}
              {form.selectedTeeth.length > 0 && ` · Tand ${form.selectedTeeth.join(", ")}`}
              {form.unknownTooth && " · Osäker på vilken tand"}
              {track === "exam" && form.symptomDuration && ` · ${form.symptomDuration}`}
              {track === "exam" && ` · Smärta ${form.painLevel}/10`}
              {form.birthYear && ` · Född ${form.birthYear}`}
            </div>
            <div className="space-y-5">
              <Field label="Tidspreferens">
                <div className="flex flex-wrap gap-1.5">
                  {["Så snart som möjligt", "Inom en vecka", "Flexibel"].map((p) => <Chip key={p} active={form.timePreference === p} onClick={() => update("timePreference", p)}>{p}</Chip>)}
                </div>
              </Field>
              <Field label="Ytterligare information (valfritt)">
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
                  placeholder="Övrig information som kan vara relevant..." rows={2} className={inputCn()} />
              </Field>
              {track === "known" && (
                <Field label="Diagnosanteckning (valfritt)">
                  <textarea value={form.diagnosNote} onChange={(e) => update("diagnosNote", e.target.value)}
                    placeholder="Om du har en diagnos, beskriv den här..." rows={2} className={inputCn()} />
                </Field>
              )}
              <p className="text-xs text-text-tertiary leading-relaxed bg-bg-sunken rounded-md p-3">
                Har du röntgenbilder eller foton? Du kan skicka dem direkt till kliniken efter att offerten kommit.
              </p>
            </div>
            <NavButtons onBack={back} onNext={next} />
          </Card>
        )}

        {/* Step 5: Contact */}
        {step === 5 && (
          <Card title="Kontaktuppgifter" subtitle="Klinikerna behöver kunna nå dig.">
            <div className="space-y-5">
              <Field label="Namn" error={errors.name}>
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ditt fullständiga namn" className={inputCn(errors.name)} />
              </Field>
              <Field label="E-post" error={errors.email}>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="din@email.se" className={inputCn(errors.email)} />
              </Field>
              <Field label="Telefon" error={errors.phone}>
                <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="070-123 45 67" className={inputCn(errors.phone)} />
              </Field>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <div className={cn("w-5 h-5 rounded border-[1.5px] flex items-center justify-center shrink-0 mt-0.5 transition-colors", form.consent ? "bg-accent border-accent" : "border-border-strong")}>
                  {form.consent && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <input type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} className="sr-only" />
                <span className="text-text-secondary text-sm leading-relaxed">Jag godkänner att mina uppgifter delas med kliniker som svarar på min förfrågan.</span>
              </label>
              {errors.consent && <p className="text-danger text-xs">{errors.consent}</p>}
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={back} className="px-5 py-2.5 text-text-secondary hover:text-text-primary transition-colors font-medium text-sm">Tillbaka</button>
              <button onClick={submit} className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors">Skicka förfrågan</button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────── */

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-elevated rounded-lg p-7 shadow-md">
      <h1 className="font-display text-xl text-text-primary mb-1">{title}</h1>
      {subtitle && <p className="text-text-secondary text-sm mb-5">{subtitle}</p>}
      {!subtitle && <div className="mb-5" />}
      {children}
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block uppercase text-[11px] font-semibold text-text-secondary tracking-[0.06em] mb-1.5">{label}</label>
      {hint && <p className="text-[11px] text-text-tertiary mb-1.5">{hint}</p>}
      {children}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}

function Chip({ active, onClick, children, variant }: { active: boolean; onClick: () => void; children: React.ReactNode; variant?: "danger" }) {
  return (
    <button onClick={onClick} className={cn(
      "px-3 py-[6px] rounded-full border-[1.5px] text-xs font-medium transition-all",
      active ? (variant === "danger" ? "border-danger bg-danger-soft text-danger" : "border-accent bg-accent-soft text-accent") : "border-border bg-bg-base text-text-secondary hover:border-border-strong"
    )}>{children}</button>
  );
}

function Hint({ text }: { text: string }) {
  return <p className="text-text-tertiary text-xs bg-bg-sunken rounded-md p-3 mt-4 leading-relaxed">{text}</p>;
}

function TrackButton({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: string; title: string; desc: string }) {
  return (
    <button onClick={onClick} className={cn("w-full text-left p-5 rounded-lg border-2 transition-all", active ? "border-accent bg-accent-soft" : "border-border bg-bg-base hover:border-border-strong")}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-bold text-base shrink-0">{icon}</div>
        <div>
          <h3 className="font-semibold text-sm text-text-primary mb-0.5">{title}</h3>
          <p className="text-text-secondary text-xs">{desc}</p>
        </div>
      </div>
    </button>
  );
}

function NavButtons({ onBack, onNext }: { onBack?: () => void; onNext: () => void }) {
  return (
    <div className="mt-6 flex justify-between">
      {onBack ? <button onClick={onBack} className="px-5 py-2.5 text-text-secondary hover:text-text-primary transition-colors font-medium text-sm">Tillbaka</button> : <div />}
      <button onClick={onNext} className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors">Fortsätt</button>
    </div>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-primary">{label}</span>
      <div className="flex gap-1">
        <button onClick={() => onChange(true)} className={cn("px-3 py-1 rounded text-xs font-medium border transition-colors", value === true ? "bg-accent text-white border-accent" : "border-border text-text-secondary hover:border-border-strong")}>Ja</button>
        <button onClick={() => onChange(false)} className={cn("px-3 py-1 rounded text-xs font-medium border transition-colors", value === false ? "bg-bg-sunken text-text-primary border-border-strong" : "border-border text-text-secondary hover:border-border-strong")}>Nej</button>
      </div>
    </div>
  );
}

function inputCn(error?: string) {
  return cn("w-full p-[10px_14px] border-[1.5px] rounded-md text-sm focus:outline-none transition-all", error ? "border-danger" : "border-border focus:border-border-focus focus:shadow-[0_0_0_3px] focus:shadow-accent-soft");
}
