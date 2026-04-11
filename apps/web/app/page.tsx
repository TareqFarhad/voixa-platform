'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TopNav } from '@/src/components/top-nav';
import { AiOrb } from '@/src/components/ai-orb';
import { Waveform } from '@/src/components/waveform';

const features = [
  {
    title: 'Voice Enhancement',
    description:
      'A layered chain of presence, warmth, and clarity - always in service of the voice that is already yours.',
  },
  {
    title: 'Noise Removal',
    description: 'Lift away room tone, hiss, and stray artefacts. Your performance, unveiled.',
  },
  {
    title: 'Smart Pitch Correction',
    description:
      'Intelligent tuning that respects nuance and emotion. No plastic autotune. Just confident delivery.',
  },
  {
    title: 'Studio Mixing',
    description:
      'A mastering philosophy built on premium EQ, soft compression, and a whisper of lush ambience.',
  },
  {
    title: 'Identity Preservation',
    description:
      'Timbre, texture, and personality are protected with speaker embeddings so you still sound like you.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    tagline: 'Discover your Voixa experience',
    features: ['Create projects', 'Core vocal refinement', 'MP3 export'],
  },
  {
    name: 'Premium',
    price: '$24',
    tagline: 'Elevated refinement, higher limits',
    features: ['Priority processing', 'Extended track length', 'WAV export', 'All style modes'],
    highlight: true,
  },
  {
    name: 'Studio',
    price: '$79',
    tagline: 'Maximum control for serious creators',
    features: ['Dedicated compute', 'Voice identity retraining', 'Preview history', 'Concierge onboarding'],
  },
];

const journey = [
  { step: '01', title: 'Bring your voice', copy: 'Upload or record your take in full quality.' },
  { step: '02', title: 'Invite the music', copy: 'Layer in your instrumental foundation.' },
  { step: '03', title: 'Shape the feeling', copy: 'Adjust warmth, clarity, and polish with a touch.' },
  { step: '04', title: 'Release your song', copy: 'Hear the studio version of yourself in minutes.' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <TopNav />

      {/* HERO */}
      <section className="relative px-6 pb-28 pt-12 md:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-gradient-to-b from-midnight/40 to-transparent" />
        <div className="relative mx-auto max-w-6xl text-center">
          <motion.p
            className="mx-auto mb-8 inline-flex rounded-full border border-champagne/30 bg-champagne/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.32em] text-champagne"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Premium AI Vocal Atelier
          </motion.p>
          <motion.h1
            className="voixa-heading text-5xl leading-[1.05] md:text-7xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            Your voice, <span className="voixa-shimmer italic">perfected</span>.
          </motion.h1>
          <motion.p
            className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-pearl/75 md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
          >
            Voixa turns your natural voice into a studio-quality song while preserving the
            identity that only you carry. Upload, refine, release.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
          >
            <Link href="/signup" className="voixa-button-primary">
              Start Creating
            </Link>
            <Link href="#experience" className="voixa-button-ghost">
              Hear the Atelier
            </Link>
          </motion.div>

          {/* Hero orb + waveform */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="voixa-card relative overflow-hidden rounded-[36px] p-8 md:p-12">
              <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-midnight/60 blur-3xl" />
              <div className="pointer-events-none absolute -right-16 -bottom-28 h-80 w-80 rounded-full bg-burgundy/40 blur-3xl" />
              <div className="relative flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between">
                <AiOrb size={220} label="Voixa core" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-pearl/55">
                    Now playing
                  </p>
                  <h3 className="mt-2 font-display text-3xl text-pearl">Silent Letters</h3>
                  <p className="mt-2 text-sm text-pearl/60">Enhanced by Voixa · 02:48</p>
                  <div className="mt-6 h-24 w-full rounded-2xl border border-white/5 bg-black/40 p-3">
                    <Waveform bars={72} />
                  </div>
                  <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-pearl/55">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-champagne" /> Studio preset
                    </span>
                    <span className="text-pearl/30">•</span>
                    <span>Identity preserved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section id="experience" className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="voixa-card relative overflow-hidden rounded-[32px] p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-pearl/55">Before / After</p>
              <h2 className="mt-3 voixa-heading text-4xl md:text-5xl">
                The same voice. Only finer.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-pearl/70">
                Voixa feels the grain of your take and lifts it gently into a studio frame. Nothing is
                replaced. Everything is revealed.
              </p>
            </div>
            <div className="grid gap-4">
              <div className="voixa-card rounded-2xl p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Raw take</p>
                <div className="mt-4 h-20 overflow-hidden rounded-xl bg-black/40 px-2 py-2">
                  <Waveform bars={52} seed={4} intensity={0.65} />
                </div>
              </div>
              <div className="voixa-card rounded-2xl border-champagne/40 p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-champagne">
                  Voixa enhanced
                </p>
                <div className="mt-4 h-20 overflow-hidden rounded-xl bg-black/40 px-2 py-2">
                  <Waveform bars={52} seed={13} intensity={1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="mb-10 flex flex-col gap-3 md:max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.3em] text-champagne">Refined craft</p>
          <h2 className="voixa-heading text-4xl md:text-5xl">Every detail, intentional.</h2>
          <p className="text-sm leading-relaxed text-pearl/65">
            A premium sonic pipeline that privileges character over correction. Each module exists to
            help you feel confident in your own voice.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              className="voixa-card relative overflow-hidden rounded-3xl p-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <div className="absolute right-6 top-6 h-8 w-8 rounded-full border border-champagne/30 bg-champagne/10" />
              <h3 className="font-display text-xl text-pearl">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-pearl/70">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* JOURNEY */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="voixa-card overflow-hidden rounded-[32px] p-8 md:p-12">
          <h2 className="voixa-heading text-3xl md:text-4xl">A private atelier powered by AI.</h2>
          <p className="mt-3 max-w-2xl text-sm text-pearl/65">
            Four unhurried steps between your raw voice and a studio release.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {journey.map((item) => (
              <div key={item.step} className="relative">
                <p className="font-display text-5xl text-champagne/80">{item.step}</p>
                <h4 className="mt-3 text-base font-medium text-pearl">{item.title}</h4>
                <p className="mt-2 text-sm text-pearl/60">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="mb-10 flex flex-col gap-3 md:max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.3em] text-champagne">Membership</p>
          <h2 className="voixa-heading text-4xl md:text-5xl">Choose your register.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-6 transition ${
                plan.highlight
                  ? 'border-champagne/60 bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-glow'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-6 rounded-full border border-champagne/50 bg-champagne/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-champagne">
                  Most chosen
                </span>
              )}
              <p className="text-[10px] uppercase tracking-[0.3em] text-pearl/55">{plan.name}</p>
              <p className="mt-4 font-display text-4xl text-pearl">
                {plan.price}
                <span className="ml-1 text-sm text-pearl/50">/ month</span>
              </p>
              <p className="mt-1 text-sm text-pearl/65">{plan.tagline}</p>
              <ul className="mt-6 space-y-2 text-sm text-pearl/75">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-[7px] inline-block h-[5px] w-[5px] rounded-full bg-champagne" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm transition ${
                  plan.highlight
                    ? 'bg-champagne text-[#111] hover:bg-champagneDeep'
                    : 'border border-white/20 text-pearl hover:bg-white/5'
                }`}
              >
                Begin with {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-10 md:px-10">
        <div className="voixa-card relative overflow-hidden rounded-[36px] p-10 text-center md:p-16">
          <div className="pointer-events-none absolute inset-0 bg-champagne-glow opacity-40" />
          <h2 className="relative voixa-heading text-4xl md:text-5xl">
            Create your first song in minutes.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm text-pearl/70">
            The atelier is open. Bring your voice. Leave with a song that sounds like the finest version
            of yourself.
          </p>
          <div className="relative mt-8 flex items-center justify-center gap-3">
            <Link href="/signup" className="voixa-button-primary">
              Bring your voice
            </Link>
            <Link href="/login" className="voixa-button-ghost">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 pb-12 text-[11px] tracking-[0.2em] text-pearl/40 md:flex-row md:px-10">
        <span>© {new Date().getFullYear()} Voixa Atelier</span>
        <span>Crafted for the voices of tomorrow</span>
      </footer>
    </main>
  );
}
