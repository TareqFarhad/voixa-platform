'use client';

import { motion } from 'framer-motion';

const features = [
  {
    title: 'Voice Enhancement',
    description: 'Bring depth, confidence, and polish to every phrase while keeping your vocal identity intact.',
  },
  {
    title: 'Noise Removal',
    description: 'Reduce room noise and distractions for a cleaner, studio-ready vocal foundation.',
  },
  {
    title: 'Smart Pitch Correction',
    description: 'Refine tuning with subtle intelligence so your performance stays expressive and natural.',
  },
  {
    title: 'Studio Mixing',
    description: 'Blend voice and instrumental with premium clarity, warmth, and modern sonic balance.',
  },
  {
    title: 'Identity Preservation',
    description: 'Maintain your tone, timbre, and personality so the final result still sounds like you.',
  },
];

const plans = [
  { name: 'Free', price: '$0', detail: 'Explore the Voixa workflow with essential creation tools.' },
  { name: 'Premium', price: '$24', detail: 'Unlock deeper refinement and premium export quality.' },
  { name: 'Studio', price: '$79', detail: 'Maximum control, higher limits, and priority processing.' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#070709] text-pearl">
      <section className="relative overflow-hidden px-6 pb-24 pt-28 md:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#2a355f_0%,#11131f_35%,#070709_70%)]" />
        <div className="absolute left-1/2 top-20 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-champagne/20 blur-[120px]" />

        <motion.div
          className="relative mx-auto max-w-6xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="mb-6 inline-flex rounded-full border border-pearl/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-pearl/80">
            Premium AI Vocal Studio
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">Your voice, perfected.</h1>
          <p className="mx-auto mt-6 max-w-3xl text-base text-pearl/80 md:text-lg">
            Voixa transforms natural vocals into studio-quality songs while preserving the character that makes your
            voice yours.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a className="rounded-full bg-champagne px-7 py-3 text-sm font-semibold text-[#111]" href="/signup">
              Bring your voice
            </a>
            <a className="rounded-full border border-pearl/30 px-7 py-3 text-sm font-medium text-pearl" href="/login">
              Refine your sound
            </a>
          </div>

          <div className="mx-auto mt-16 max-w-4xl rounded-3xl border border-pearl/15 bg-white/[0.03] p-6 backdrop-blur">
            <div className="h-36 rounded-2xl bg-gradient-to-r from-midnight via-[#4d3d66] to-[#783e4e] p-[1px]">
              <div className="flex h-full items-center justify-center rounded-2xl bg-[#0c0d12]">
                <motion.div
                  className="h-10 w-10 rounded-full bg-champagne/80"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-pearl/65">Elegant waveform visual placeholder for hero playback experience.</p>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-6 py-16 md:grid-cols-2 md:px-10">
        <div className="rounded-3xl border border-pearl/20 bg-white/[0.02] p-6">
          <h2 className="text-2xl font-semibold">Before / After</h2>
          <p className="mt-2 text-sm text-pearl/70">Compare your raw performance with the enhanced final version.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-pearl/10 bg-[#10121b] p-4">
              <p className="text-xs uppercase tracking-widest text-pearl/60">Raw</p>
              <div className="mt-4 h-20 rounded-xl bg-pearl/5" />
            </div>
            <div className="rounded-2xl border border-champagne/30 bg-[#15141a] p-4">
              <p className="text-xs uppercase tracking-widest text-champagne">Enhanced</p>
              <div className="mt-4 h-20 rounded-xl bg-champagne/10" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-pearl/20 bg-white/[0.02] p-6">
          <h2 className="text-2xl font-semibold">Craft your final track</h2>
          <p className="mt-2 text-sm text-pearl/70">
            Upload vocals and instrumentals, add lyrics, adjust style, and let Voixa shape your polished result.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-pearl/80">
            <li>• Upload or record your vocal</li>
            <li>• Add your instrumental and lyrics</li>
            <li>• Tune refinement settings</li>
            <li>• Process and export your final song</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <h2 className="text-2xl font-semibold md:text-3xl">Refine every detail</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-pearl/15 bg-white/[0.02] p-5">
              <h3 className="text-lg font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm text-pearl/70">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="rounded-3xl border border-pearl/15 bg-gradient-to-br from-[#121525] to-[#1a1520] p-8">
          <h2 className="text-2xl font-semibold md:text-3xl">An immersive creative experience</h2>
          <p className="mt-3 max-w-3xl text-pearl/75">
            Designed with a cinematic dark-luxury aesthetic, Voixa helps creators feel confident and inspired while
            building studio-like vocals without technical complexity.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-4 md:px-10">
        <h2 className="text-2xl font-semibold md:text-3xl">Pricing preview</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-2xl border border-pearl/15 bg-white/[0.02] p-6">
              <p className="text-sm uppercase tracking-widest text-pearl/60">{plan.name}</p>
              <p className="mt-3 text-3xl font-semibold">{plan.price}</p>
              <p className="mt-2 text-sm text-pearl/70">{plan.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:px-10">
        <div className="rounded-3xl border border-champagne/40 bg-champagne/10 p-8 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Ready to enhance your performance?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-pearl/80">
            Start your first Voixa project and hear how your own voice can become a premium final track.
          </p>
          <a className="mt-8 inline-flex rounded-full bg-champagne px-8 py-3 text-sm font-semibold text-[#111]" href="/signup">
            Create your account
          </a>
        </div>
      </section>
    </main>
  );
}
