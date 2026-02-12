"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ─── Timer Component ────────────────────────────────────────────────────────

function RoundTimer({ minutes }: { minutes: number }) {
  const totalSeconds = minutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(totalSeconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [totalSeconds]);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            // Play a beep sound when timer ends
            try {
              const ctx = audioRef.current || new AudioContext();
              audioRef.current = ctx;
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 800;
              gain.gain.value = 0.3;
              osc.start();
              osc.stop(ctx.currentTime + 0.5);
            } catch {}
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining]);

  // Reset if the minutes prop changes
  useEffect(() => {
    reset();
  }, [totalSeconds, reset]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;
  const isFinished = remaining === 0;
  const isWarning = remaining > 0 && remaining <= 60;

  return (
    <div className={`rounded-lg border p-4 transition-colors ${
      isFinished
        ? "bg-red-500/10 border-red-500/30"
        : isWarning
          ? "bg-amber-500/10 border-amber-500/30"
          : "bg-cyan-500/10 border-cyan-500/20"
    }`}>
      {/* Time display */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-mono">{minutes} mín niðurtalning</span>
        <span className={`font-mono text-2xl tabular-nums tracking-wider ${
          isFinished ? "text-red-400" : isWarning ? "text-amber-400" : "text-cyan-300"
        }`}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#30363d] rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isFinished ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-cyan-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setRunning(!running)}
          className={`flex-1 text-sm font-medium py-1.5 px-3 rounded-md transition-colors ${
            running
              ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
              : "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
          }`}
        >
          {running ? "Pása" : remaining < totalSeconds ? "Halda áfram" : "Byrja"}
        </button>
        <button
          onClick={reset}
          className="text-sm font-medium py-1.5 px-3 rounded-md bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
        >
          Endurstilla
        </button>
      </div>

      {isFinished && (
        <p className="text-red-400 text-sm font-medium text-center mt-2 animate-pulse">
          Tími er úti!
        </p>
      )}
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────

type ItemType =
  | "break"
  | "opening"
  | "keynote"
  | "lecture"
  | "workshop"
  | "tba";
type ItemStatus = "past" | "current" | "upcoming";

interface ScheduleItem {
  id: string;
  time: string;
  endTime: string;
  title: string;
  subtitle: string;
  type: ItemType;
}

// ─── Schedule Data ──────────────────────────────────────────────────────────

const SCHEDULE: ScheduleItem[] = [
  {
    id: "registration",
    time: "09:00",
    endTime: "10:00",
    title: "Móttaka og morgunverður",
    subtitle: "Gengið um skólann",
    type: "break",
  },
  {
    id: "opening",
    time: "10:00",
    endTime: "11:00",
    title: "Innslög sem eiga erindi við alla þátttakendur",
    subtitle: "Sameiginleg dagskrá",
    type: "opening",
  },
  {
    id: "morning-coffee",
    time: "11:00",
    endTime: "11:20",
    title: "Kaffihlé",
    subtitle: "Kaffi og veitingar",
    type: "break",
  },
  {
    id: "keynote",
    time: "11:20",
    endTime: "12:00",
    title: "Fyrirlestur",
    subtitle: "Verður tilkynnt síðar (TBA)",
    type: "tba",
  },
  {
    id: "lunch",
    time: "12:00",
    endTime: "13:00",
    title: "Hádegisverður",
    subtitle: "Í boði skipuleggjenda",
    type: "break",
  },
  {
    id: "afternoon-block",
    time: "13:00",
    endTime: "15:20",
    title: "Síðdegisdagskrá",
    subtitle: "Tölvunarfræðimenntun í framhaldsskólum",
    type: "workshop",
  },
  {
    id: "coffee",
    time: "15:20",
    endTime: "16:00",
    title: "Kaffihlé og tengslamyndun",
    subtitle: "Kaffi, te og veitingar",
    type: "break",
  },
];

const MORNING_IDS = ["registration", "opening", "morning-coffee", "keynote", "lunch"];

interface AfternoonSubItem {
  id: string;
  title: string;
  icon: string;
  color: string;
}

const AFTERNOON_ITEMS: AfternoonSubItem[] = [
  { id: "fb-tolvubraut", title: "Tölvubraut FB - Hjörvar og Bjarni", icon: "💻", color: "green" },
  { id: "stories", title: "Sögur úr kennslu", icon: "📖", color: "green" },
  { id: "active-listening", title: "Virk hlustunaræfing", icon: "👂", color: "cyan" },
  { id: "discussion", title: "Almenn umræða", icon: "💬", color: "blue" },
];

// ─── Styling Maps ───────────────────────────────────────────────────────────

const TYPE_STYLES: Record<
  ItemType,
  { badge: string; border: string; dot: string }
> = {
  break: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    border: "border-l-amber-500",
    dot: "bg-amber-400",
  },
  opening: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    border: "border-l-blue-500",
    dot: "bg-blue-400",
  },
  keynote: {
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    border: "border-l-purple-500",
    dot: "bg-purple-400",
  },
  lecture: {
    badge: "bg-green-500/20 text-green-300 border-green-500/30",
    border: "border-l-green-500",
    dot: "bg-green-400",
  },
  workshop: {
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    border: "border-l-cyan-500",
    dot: "bg-cyan-400",
  },
  tba: {
    badge: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    border: "border-l-gray-500",
    dot: "bg-gray-400",
  },
};

const TYPE_LABELS: Record<ItemType, string> = {
  break: "Hlé",
  opening: "Setning",
  keynote: "Aðalfyrirlestur",
  lecture: "Fyrirlestur",
  workshop: "Vinnustofa",
  tba: "TBA",
};

// ─── Event Date ─────────────────────────────────────────────────────────────

const EVENT_DATE = { year: 2026, month: 2, day: 27 }; // February 27, 2026

function isEventDay(now: Date): boolean {
  return (
    now.getFullYear() === EVENT_DATE.year &&
    now.getMonth() + 1 === EVENT_DATE.month &&
    now.getDate() === EVENT_DATE.day
  );
}

function getCountdown(now: Date): { days: number; hours: number; minutes: number; seconds: number } | null {
  const target = new Date(EVENT_DATE.year, EVENT_DATE.month - 1, EVENT_DATE.day, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function getStatus(item: ScheduleItem, now: Date): ItemStatus {
  if (!isEventDay(now)) return "upcoming";

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const startMins = toMinutes(item.time);
  const endMins = toMinutes(item.endTime);

  if (nowMins >= endMins) return "past";
  if (nowMins >= startMins) return "current";
  return "upcoming";
}

// ─── Detail Content ─────────────────────────────────────────────────────────

function DetailContent({ id }: { id: string }) {
  switch (id) {
    case "registration":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-amber-300">
            Móttaka og morgunverður
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Boðið er upp á létt morgunverð og kaffi við komu. Þátttakendur fá
            kynningu á skólanum og sögu hans á meðan rölt er um bygginguna.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h4 className="font-medium text-amber-300 mb-2">
              Hagnýtar upplýsingar
            </h4>
            <ul className="list-disc list-inside text-gray-300 space-y-1.5 text-sm">
              <li>Tækniskólinn, Háteigsvegi (sjá kort)</li>
              <li>Wifi - SSID: <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono">T Skoli Hotspot</code> er opið og þarf ekki lykilorð</li>
              <li>Móttaka og kaffi eru í matsal á fjórðu hæð til vinstri þegar komið er upp stigann (eða lyftuna)</li>
              <li>Nýtum tímann til þess að kynnast öðrum þáttakendum</li>
            </ul>
          </div>
          <div className="rounded-lg overflow-hidden border border-[#30363d]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6118.2160264322365!2d-21.900599!3d64.13938!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48d674cc84500001%3A0x16719bf129fa31a7!2zVMOma25pc2vDs2xpbm4!5e1!3m2!1sis!2sis!4v1770906432768!5m2!1sis!2sis"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Tækniskólinn, Háteigsvegi"
            />
          </div>
        </div>
      );

    case "opening":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-blue-300">
            Innslög sem eiga erindi við alla þátttakendur
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Sameiginleg dagskrá þar sem öllum þátttakendum er boðið saman.
            Innslög og kynningar sem varða alla kennara og skólastjórnendur.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-300 mb-2">Á dagskrá</h4>
            <ul className="list-disc list-inside text-gray-300 space-y-1.5 text-sm">
              <li>Velkomin og kynning dagskrár</li>
              <li>Markmið starfsþróunardagsins</li>
              <li>Innslög sem varða alla þátttakendur</li>
            </ul>
          </div>
        </div>
      );

    case "morning-coffee":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-amber-300">
            Kaffihlé
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Stutt kaffihlé áður en aðalfyrirlestur hefst. Kaffi og veitingar í
            boði.
          </p>
        </div>
      );

    case "keynote":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-300">
            Fyrirlestur - TBA
          </h3>
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-6 text-center">
            <div className="font-mono text-gray-600 text-sm mb-3">
              {"// TODO: Finna fyrirlesara"}
            </div>
            <p className="text-gray-400">
              Fyrirlesari verður tilkynntur fljótlega.
            </p>
            <p className="text-gray-500 text-sm mt-2">Fylgstu með á vefsíðunni.</p>
          </div>
        </div>
      );

    case "lunch":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-amber-300">
            Hádegisverður
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Hádegismatur í boði skipuleggjenda. Nýttu tímann til að kynnast
            samstarfsfólki og ræða efni morgunsins.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm text-gray-300">
            <span className="text-amber-300 font-medium">Ábending:</span>{" "}
            Nýttu hádegistímann til tengslamyndunar — kynntu þig fyrir kennurum
            frá öðrum skólum!
          </div>
        </div>
      );

    case "fb-tolvubraut":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-green-300">
            Tölvubraut FB - Kynning á námslínu
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Hjörvar og Bjarni, kennarar frá Fjölbrautaskólanum í Breiðholti (FB),
            kynna tölvubrautina - stúdentsprófsbraut sem undirbýr nemendur
            fyrir háskólanám í tölvunarfræði, hugbúnaðarverkfræði og skyldum
            greinum.
          </p>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-medium text-green-300 mb-3">Um námslínuna</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-black/20 rounded p-2.5">
                <span className="text-gray-500 text-xs">Einingar</span>
                <p className="text-green-300 font-mono font-medium">200 einingar</p>
              </div>
              <div className="bg-black/20 rounded p-2.5">
                <span className="text-gray-500 text-xs">Lengd</span>
                <p className="text-green-300 font-mono font-medium">6 annir</p>
              </div>
              <div className="bg-black/20 rounded p-2.5">
                <span className="text-gray-500 text-xs">Námskóði</span>
                <p className="text-green-300 font-mono font-medium">17-313-3-7</p>
              </div>
              <div className="bg-black/20 rounded p-2.5">
                <span className="text-gray-500 text-xs">Prófgráða</span>
                <p className="text-green-300 font-mono font-medium">Stúdentspróf</p>
              </div>
            </div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-medium text-green-300 mb-3">Helstu námsgreinar</h4>
            <div className="space-y-2 text-sm">
              {[
                { code: "FORR", desc: "Forritun - gagnategundir, OOP, klasasöfn, verkefnamiðað nám" },
                { code: "GAGN", desc: "Gagnagrunnur - hönnun, SQL, gagnavorðveisla" },
                { code: "KEST", desc: "Kerfisstjórnun - Windows Server, Active Directory, DNS, DHCP" },
                { code: "VEFÞ", desc: "Vefþróun - HTML, CSS, gagnvirkar vefsíður, vefþjónar" },
              ].map((course) => (
                <div key={course.code} className="flex items-start gap-2">
                  <code className="bg-black/30 px-2 py-0.5 rounded text-green-400 font-mono text-xs shrink-0 mt-0.5">
                    {course.code}
                  </code>
                  <span className="text-gray-300">{course.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-medium text-green-300 mb-2">Árangur nemenda</h4>
            <ul className="list-disc list-inside text-gray-300 space-y-1.5 text-sm">
              <li>
                <strong className="text-green-300">Forritunarkeppni:</strong>{" "}
                Lið frá FB náðu 3. sæti í bæði Alfa og Beta deildum 2024
              </li>
              <li>
                <strong className="text-green-300">vedur.fb.is:</strong>{" "}
                Nemendur smíðuðu veðurvefsíðu með rauntímagögnum frá veðurstöð skólans
              </li>
            </ul>
          </div>
          <p className="text-xs text-gray-500">
            Nánari upplýsingar:{" "}
            <span className="text-green-400/60 font-mono">fb.is/namid/tolvubraut</span>
          </p>
        </div>
      );

    case "stories":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-green-300">
            Sögur úr kennslu
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Kennarar deila reynslu sinni úr tölvunarfræðikennslu -
            verkefni sem heppnuðust, áskoranir sem komu upp og lausnir sem fundust.
            Stuttar og óformlegar frásagnir sem veita innblástur.
          </p>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-medium text-green-300 mb-2">Dæmi um efni</h4>
            <ul className="list-disc list-inside text-gray-300 space-y-1.5 text-sm">
              <li>Verkefni sem kveiktu áhuga nemenda</li>
              <li>Óvænt vandamál og skapandi lausnir</li>
              <li>Samstarf milli námsgreina</li>
              <li>Hvernig tækni breytti kennslustundinni</li>
            </ul>
          </div>
        </div>
      );

    case "active-listening":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-cyan-300">
            Virk hlustunaræfing
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Þátttakendur skiptast í hópa (3 í hverjum hóp) og taka að sér
            mismunandi hlutverk til að æfa virka hlustun. Æfingin gefur okkur
            jafnframt yfirsýn yfir stöðu tölvunarfræðikennslu í framhaldsskólum.
          </p>

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
            <h4 className="font-medium text-cyan-300 mb-3">Þrjú hlutverkin</h4>
            <div className="space-y-4 text-sm">
              {[
                {
                  role: "Framsögumaður",
                  icon: "🗣",
                  desc: "Talar um tölvukennslu í sínum skóla - áskoranir, árangur, framtíðarsýn. Fær rými til að hugsa upphátt.",
                },
                {
                  role: "Virkur Hlustandi",
                  icon: "👂",
                  desc: "Hlustar af fullri athygli og forvitni. Spyr opinna spurninga til að dýpka umræðuna en gefur engin ráð. Segir \"mmhmm\", \"aha\", \"já, einmitt\" o.s.frv. Ef 4 eru saman í hóp skal hafa 2 virka hlustendur.",
                },
                {
                  role: "Áhorfandi",
                  icon: "👁",
                  desc: "Situr þegjandi, tekur minnispunkta og deilir athugasemdum eftir á - sjónarhorn utan frá sem hinir tveir missa oft af. Áhorfandinn ber líka ábyrgð á tímanum.",
                },
              ].map((r) => (
                <div key={r.role} className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-base">
                    {r.icon}
                  </div>
                  <div>
                    <p className="text-cyan-200 font-medium">{r.role}</p>
                    <p className="text-gray-400 mt-0.5">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
            <h4 className="font-medium text-cyan-300 mb-3">Hvernig æfingin virkar</h4>
            <div className="space-y-4 text-sm">
              {[
                { step: "1", title: "Umferð 1", desc: "Hópurinn skiptir á milli sín hlutverkunum. Hver umferð tekur um 20 mín. (15 mínútur fyrir 4 manna hópa)" },
                { step: "2", title: "Umferð 2", desc: "Hlutverk víxlast - nýr framsögumaður, nýr virkur hlustandi, nýr áhorfandi." },
                { step: "3", title: "Umferð 3", desc: "Víxlað aftur svo allir hafi prófað öll hlutverkin." },
                { step: "4", title: "Samantekt", desc: "Hópar deila helstu innsýnum. Hvað komum við auga á um stöðu tölvukennslu?" },
              ].map((s) => (
                <div key={s.step} className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold">
                    {s.step}
                  </div>
                  <div>
                    <p className="text-cyan-200 font-medium">{s.title}</p>
                    <p className="text-gray-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 text-sm text-gray-300">
            <span className="text-cyan-300 font-medium">Kennslunotkun:</span>{" "}
            Þessa tækni má nota beint í kennslustundum - nemendur mynda þriggja manna
            hópa og hlusta á hvorn annan um ákveðið viðfangsefni.
          </div>

          {/* Timers */}
          <div>
            <h4 className="font-medium text-cyan-300 mb-3">Niðurtalning</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RoundTimer minutes={20} />
              <RoundTimer minutes={15} />
            </div>
          </div>
        </div>
      );

    case "discussion":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-blue-300">
            Almenn umræða og samantekt
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Opin umræða þar sem þátttakendur draga saman helstu lærdóma dagsins
            og ræða næstu skref í tölvunarfræðikennslu.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-300 mb-2">Umræðuefni</h4>
            <ul className="list-disc list-inside text-gray-300 space-y-1.5 text-sm">
              <li>Hvað tókum við með okkur af deginum?</li>
              <li>Hvernig getum við styrkt tölvukennslu saman?</li>
              <li>Næstu skref og samstarfstækifæri</li>
            </ul>
          </div>
        </div>
      );

    case "coffee":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-amber-300">
            Kaffihlé og tengslamyndun
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Kaffi, te og veitingar. Nýttu tímann til að halda áfram umræðum og
            mynda tengsl við samstarfsfólk úr framhaldsskólum.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm text-gray-300">
            <span className="text-amber-300 font-medium">Tillaga:</span>{" "}
            Deildu hugmyndum frá virkri hlustun æfingunni og ræddu hvernig
            hægt er að efla tölvunarfræðikennslu saman.
          </div>
        </div>
      );

    default:
      return null;
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Countdown({ time }: { time: Date }) {
  const cd = getCountdown(time);
  if (!cd) return null;

  const blink = time.getSeconds() % 2 === 0;
  const colonClass = `transition-opacity duration-200 ${blink ? "opacity-100" : "opacity-20"}`;

  return (
    <div className="text-right">
      <div className="font-mono text-2xl sm:text-3xl lg:text-4xl text-green-400 tracking-wider tabular-nums">
        <span>{String(cd.days).padStart(2, "0")}</span>
        <span className={colonClass}>:</span>
        <span>{String(cd.hours).padStart(2, "0")}</span>
        <span className={colonClass}>:</span>
        <span>{String(cd.minutes).padStart(2, "0")}</span>
        <span className={colonClass}>:</span>
        <span>{String(cd.seconds).padStart(2, "0")}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] font-mono text-[10px] text-gray-500 mt-1">
        <span className="text-center">dagar</span>
        <span />
        <span className="text-center">klst</span>
        <span />
        <span className="text-center">mín</span>
        <span />
        <span className="text-center">sek</span>
      </div>
    </div>
  );
}

function LiveClock({ time }: { time: Date }) {
  const h = time.getHours().toString().padStart(2, "0");
  const m = time.getMinutes().toString().padStart(2, "0");
  const s = time.getSeconds().toString().padStart(2, "0");
  const blink = time.getSeconds() % 2 === 0;

  return (
    <div className="font-mono text-3xl lg:text-4xl text-green-400 tracking-wider tabular-nums">
      <span>{h}</span>
      <span
        className={`transition-opacity duration-200 ${blink ? "opacity-100" : "opacity-20"}`}
      >
        :
      </span>
      <span>{m}</span>
      <span
        className={`transition-opacity duration-200 ${blink ? "opacity-100" : "opacity-20"}`}
      >
        :
      </span>
      <span>{s}</span>
    </div>
  );
}

function ScheduleCard({
  item,
  isSelected,
  status,
  onClick,
}: {
  item: ScheduleItem;
  isSelected: boolean;
  status: ItemStatus;
  onClick: () => void;
}) {
  const styles = TYPE_STYLES[item.type];

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-lg border border-[#30363d] border-l-4 p-2.5 sm:p-3.5
        transition-all duration-200 cursor-pointer
        ${styles.border}
        ${isSelected ? "bg-[#1c2333] ring-1 ring-blue-500/40 lg:scale-[1.02]" : "bg-[#161b22] hover:bg-[#1c2333]"}
        ${status === "past" ? "opacity-40" : ""}
        ${status === "current" && !isSelected ? "ring-1 ring-green-500/30 shadow-lg shadow-green-500/10" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-mono text-xs sm:text-sm text-gray-400">
              {item.time}
            </span>
            <span className="text-gray-600 text-xs">&rarr;</span>
            <span className="font-mono text-xs sm:text-sm text-gray-500">
              {item.endTime}
            </span>
            {status === "current" && (
              <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <h3 className="font-semibold mt-1 sm:mt-1.5 text-sm sm:text-base text-[#e6edf3]">{item.title}</h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{item.subtitle}</p>
        </div>
        <span
          className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${styles.badge}`}
        >
          {TYPE_LABELS[item.type]}
        </span>
      </div>
    </button>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isLive = now ? isEventDay(now) : false;

  const { progress, completedCount, currentItem } = useMemo(() => {
    if (!now || !isLive) return { progress: 0, completedCount: 0, currentItem: null };

    const nowMins = now.getHours() * 60 + now.getMinutes();
    const dayStart = toMinutes(SCHEDULE[0].time);
    const dayEnd = toMinutes(SCHEDULE[SCHEDULE.length - 1].endTime);
    const totalDuration = dayEnd - dayStart;

    const elapsed = Math.max(0, Math.min(nowMins - dayStart, totalDuration));
    const pct = totalDuration > 0 ? Math.round((elapsed / totalDuration) * 100) : 0;

    let completed = 0;
    let current: ScheduleItem | null = null;
    for (const item of SCHEDULE) {
      const status = getStatus(item, now);
      if (status === "past") completed++;
      if (status === "current" && !current) current = item;
    }

    return { progress: pct, completedCount: completed, currentItem: current };
  }, [now, isLive]);

  const morningItems = SCHEDULE.filter((i) => MORNING_IDS.includes(i.id));
  const afternoonItems = SCHEDULE.filter((i) => !MORNING_IDS.includes(i.id));

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col">
      {/* Background grid */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-mono">
                <span className="text-green-400">$</span>
                <span>cat dagskra.md</span>
                <span className="inline-block w-2 h-4 bg-green-400/80 animate-pulse" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1.5 sm:mt-2 tracking-tight">
                Starfsþróunardagur
              </h1>
              <p className="text-gray-400 mt-0.5 sm:mt-1 text-xs sm:text-sm lg:text-base">
                27. febrúar 2026 - Tölvunarfræðimenntun í framhaldsskólum
              </p>
            </div>
            <div className="shrink-0 self-end sm:self-auto">
              {now ? (
                isLive ? (
                  <div className="text-right">
                    <LiveClock time={now} />
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      {now.toLocaleDateString("is-IS", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                ) : (
                  <Countdown time={now} />
                )
              ) : (
                <div className="font-mono text-3xl lg:text-4xl text-green-400/30 tracking-wider">
                  --:--:--
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
          {/* Schedule panel */}
          <div className="lg:col-span-2 space-y-2">
            {/* Morning section header */}
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1 pl-1">
              {"// Formiddagur"}
            </div>

            {morningItems.map((item) => (
              <ScheduleCard
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                status={now ? getStatus(item, now) : "upcoming"}
                onClick={() => setSelectedId(item.id)}
              />
            ))}

            {/* Section divider */}
            <div className="flex items-center gap-3 py-2 sm:py-3">
              <div className="flex-1 h-px bg-green-500/30" />
              <span className="text-xs font-mono text-green-400/70 px-2 whitespace-nowrap">
                {"// Tölvunarfræðimenntun"}
              </span>
              <div className="flex-1 h-px bg-green-500/30" />
            </div>

            {/* Afternoon section header */}
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1 pl-1">
              {"// Síðdegisdagskrá"}
            </div>

            {afternoonItems.map((item) => (
              <div key={item.id}>
                <ScheduleCard
                  item={item}
                  isSelected={selectedId === item.id}
                  status={now ? getStatus(item, now) : "upcoming"}
                  onClick={() => setSelectedId(item.id)}
                />
                {/* Nested sub-items for the afternoon block */}
                {item.id === "afternoon-block" && (
                  <div className="ml-3 sm:ml-4 border-l-2 border-[#30363d] pl-2.5 sm:pl-3 mt-1.5 space-y-1.5">
                    {AFTERNOON_ITEMS.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedId(sub.id)}
                        className={`
                          w-full text-left rounded-md px-2.5 sm:px-3 py-2 sm:py-2.5
                          transition-all duration-200 cursor-pointer flex items-center gap-2.5
                          ${selectedId === sub.id
                            ? "bg-[#1c2333] ring-1 ring-blue-500/40"
                            : "bg-[#161b22] hover:bg-[#1c2333]"
                          }
                          border border-[#30363d]
                        `}
                      >
                        <span className="text-base shrink-0">{sub.icon}</span>
                        <span className="text-xs sm:text-sm text-[#e6edf3]">{sub.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Details panel — desktop only (sidebar) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="lg:sticky lg:top-8">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                <div className="border-b border-[#30363d] px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  <span className="ml-3 text-xs text-gray-500 font-mono">
                    {selectedId ? `${selectedId}.md` : "veldu-atriði.md"}
                  </span>
                </div>
                <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {selectedId ? (
                    <DetailContent id={selectedId} />
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="text-4xl opacity-30">{"{ }"}</div>
                      <p className="text-gray-400">
                        Smelltu á atriði í dagskránni til að sjá nánari
                        upplýsingar
                      </p>
                      <p className="text-gray-600 text-sm font-mono">
                        {"// Click a schedule item to view details"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Details panel — mobile bottom sheet */}
      {selectedId && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setSelectedId(null)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#161b22] border-t border-[#30363d] rounded-t-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle + title bar */}
            <div className="border-b border-[#30363d] px-4 py-3 shrink-0">
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-2 text-xs text-gray-500 font-mono">
                    {selectedId}.md
                  </span>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-gray-400 hover:text-gray-200 text-sm font-mono px-2 py-1"
                >
                  ESC
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <DetailContent id={selectedId} />
            </div>
          </div>
        </div>
      )}

      {/* Status bar / Footer */}
      <footer className="relative z-10 border-t border-[#30363d] bg-[#161b22]/90 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 flex-wrap">
            {isLive ? (
              <>
                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="w-28 h-2 bg-[#30363d] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-gray-500 font-mono text-xs">
                    {progress}%
                  </span>
                </div>

                <span className="text-gray-600 hidden sm:inline">|</span>

                {/* Items completed */}
                <span className="text-gray-500 font-mono text-xs">
                  {completedCount}/{SCHEDULE.length} atriði
                </span>

                {currentItem && (
                  <>
                    <span className="text-gray-600 hidden sm:inline">|</span>
                    <span className="text-gray-500 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      {currentItem.title}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-gray-500 font-mono text-xs">
                Dagskrá hefst 27. febrúar 2026
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-gray-600 font-mono text-xs">
            <span>&copy; 2026</span>
            <span>&middot;</span>
            <span
              className="cursor-default hover:text-green-400 transition-colors duration-300"
              title="The answer is always in the source"
              data-hint="Hmm... kannski ættir þú að prufa að heimsækja /api/42"
            >
              v0x2A
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
