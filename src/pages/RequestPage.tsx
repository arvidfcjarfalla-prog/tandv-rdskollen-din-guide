import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type InjuryType = "" | "fracture" | "pain" | "lost-filling" | "implant";

type FormState = {
  injuryType: InjuryType;
  painLevel: number;
  swelling: "" | "yes" | "no";
  description: string;
  postalCode: string;
  photoCount: number;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

const initialState: FormState = {
  injuryType: "",
  painLevel: 5,
  swelling: "",
  description: "",
  postalCode: "",
  photoCount: 0,
  name: "",
  email: "",
  phone: "",
  consent: false,
};

const stepLabels = ["Skada", "Detaljer", "Kontakt"];

export default function RequestPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const progress = useMemo(() => Math.round((step / 3) * 100), [step]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep = (currentStep: number): string[] => {
    const currentErrors: string[] = [];

    if (currentStep === 1) {
      if (!form.injuryType) currentErrors.push("Valj vilken typ av skada du har.");
      if (!form.swelling) currentErrors.push("Ange om du har svullnad.");
    }

    if (currentStep === 2) {
      if (form.description.trim().length < 20) {
        currentErrors.push("Beskriv skadan med minst 20 tecken sa kliniker kan ge korrekt offert.");
      }
      if (!/^\d{3}\s?\d{2}$/.test(form.postalCode.trim())) {
        currentErrors.push("Ange ett giltigt postnummer (t.ex. 11345). ");
      }
    }

    if (currentStep === 3) {
      if (form.name.trim().length < 2) currentErrors.push("Ange ditt namn.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) currentErrors.push("Ange en giltig e-post.");
      if (!/^\+?[0-9\s-]{7,}$/.test(form.phone.trim())) currentErrors.push("Ange ett giltigt telefonnummer.");
      if (!form.consent) currentErrors.push("Du maste godkanna villkoren for att skicka forfragan.");
    }

    return currentErrors;
  };

  const goNext = () => {
    const currentErrors = validateStep(step);
    if (currentErrors.length > 0) {
      setErrors(currentErrors);
      return;
    }

    setErrors([]);
    setStep((prev) => Math.min(3, prev + 1));
  };

  const goBack = () => {
    setErrors([]);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const submitRequest = () => {
    const currentErrors = validateStep(3);
    if (currentErrors.length > 0) {
      setErrors(currentErrors);
      return;
    }

    setErrors([]);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="request-page">
        <section className="card wizard-success reveal">
          <span className="badge">Forfragan mottagen</span>
          <h2>Klart! Din forfragan ar skickad till anslutna kliniker</h2>
          <p>Du far svar i jamforelsevyn nar klinikerna har skickat sina offertforslag.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate("/compare")}>Fortsatt till jamforelse</button>
            <Link className="btn btn-secondary" to="/">Tillbaka till startsidan</Link>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="request-page">
      <section className="card wizard-shell reveal">
        <header className="wizard-head">
          <div>
            <span className="badge">Steg {step} av 3</span>
            <h2>Skapa forfragan for tandskada</h2>
            <p>Fyll i tre korta steg. Ju tydligare underlag, desto battre och snabbare offerter.</p>
          </div>

          <div className="wizard-progress" aria-label="Progress">
            <div className="wizard-progress-track">
              <div className="wizard-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <ol className="wizard-steps" aria-label="Steg i formularet">
              {stepLabels.map((label, index) => {
                const n = index + 1;
                return (
                  <li className={n <= step ? "active" : ""} key={label}>
                    <span>{n}</span>
                    {label}
                  </li>
                );
              })}
            </ol>
          </div>
        </header>

        <div className="wizard-grid">
          <section className="wizard-form card" aria-live="polite">
            {step === 1 && (
              <div className="wizard-block">
                <h3>1) Vad galler skadan?</h3>
                <div className="choice-grid">
                  <button className={`choice ${form.injuryType === "fracture" ? "selected" : ""}`} onClick={() => updateForm("injuryType", "fracture")}>Fraktur / avslagen tand</button>
                  <button className={`choice ${form.injuryType === "pain" ? "selected" : ""}`} onClick={() => updateForm("injuryType", "pain")}>Akut smarta</button>
                  <button className={`choice ${form.injuryType === "lost-filling" ? "selected" : ""}`} onClick={() => updateForm("injuryType", "lost-filling")}>Tappad fyllning / krona</button>
                  <button className={`choice ${form.injuryType === "implant" ? "selected" : ""}`} onClick={() => updateForm("injuryType", "implant")}>Implantatproblem</button>
                </div>

                <label>
                  Smartniva (1-10)
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={form.painLevel}
                    onChange={(event) => updateForm("painLevel", Number(event.target.value))}
                  />
                  <strong>{form.painLevel}</strong>
                </label>

                <fieldset className="inline-fieldset">
                  <legend>Har du synlig svullnad?</legend>
                  <label>
                    <input type="radio" name="swelling" checked={form.swelling === "yes"} onChange={() => updateForm("swelling", "yes")} /> Ja
                  </label>
                  <label>
                    <input type="radio" name="swelling" checked={form.swelling === "no"} onChange={() => updateForm("swelling", "no")} /> Nej
                  </label>
                </fieldset>
              </div>
            )}

            {step === 2 && (
              <div className="wizard-block">
                <h3>2) Ge klinikerna tillrackligt underlag</h3>
                <label>
                  Beskriv symptom och vad som hant
                  <textarea
                    value={form.description}
                    onChange={(event) => updateForm("description", event.target.value)}
                    rows={5}
                    placeholder="Exempel: Slog i framtanden i gardags. Ont vid tryck och kallt vatten."
                  />
                </label>

                <label>
                  Postnummer
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.postalCode}
                    onChange={(event) => updateForm("postalCode", event.target.value)}
                    placeholder="11345"
                  />
                </label>

                <label>
                  Ladda upp bilder (valfritt men rekommenderat)
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(event) => updateForm("photoCount", event.target.files?.length ?? 0)}
                  />
                  <small className="muted">Valda bilder: {form.photoCount}</small>
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="wizard-block">
                <h3>3) Kontaktuppgifter</h3>
                <label>
                  Fullstandigt namn
                  <input type="text" value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="Anna Andersson" />
                </label>

                <label>
                  E-post
                  <input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} placeholder="anna@email.se" />
                </label>

                <label>
                  Telefon
                  <input type="tel" value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} placeholder="0701234567" />
                </label>

                <label className="checkbox-row">
                  <input type="checkbox" checked={form.consent} onChange={(event) => updateForm("consent", event.target.checked)} />
                  Jag godkanner att min forfragan delas med verifierade kliniker for offertsvar.
                </label>
              </div>
            )}

            {errors.length > 0 && (
              <div className="wizard-errors" role="alert">
                <p>Innan du gar vidare:</p>
                <ul>
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <footer className="wizard-actions">
              <button className="btn btn-secondary" disabled={step === 1} onClick={goBack}>Tillbaka</button>
              {step < 3 ? (
                <button className="btn btn-primary" onClick={goNext}>Fortsatt</button>
              ) : (
                <button className="btn btn-primary" onClick={submitRequest}>Skicka forfragan</button>
              )}
            </footer>
          </section>

          <aside className="card wizard-summary">
            <p className="eyebrow">Sammanfattning</p>
            <h3>Detta skickas till klinikerna</h3>
            <ul>
              <li>Skada: {form.injuryType || "Ej valt"}</li>
              <li>Smartniva: {form.painLevel}/10</li>
              <li>Svullnad: {form.swelling || "Ej valt"}</li>
              <li>Postnummer: {form.postalCode || "Ej ifyllt"}</li>
              <li>Bilder: {form.photoCount}</li>
            </ul>
            <small className="muted">Tips: tydlig beskrivning + bilder ger battre offertprecision.</small>
          </aside>
        </div>
      </section>
    </section>
  );
}
