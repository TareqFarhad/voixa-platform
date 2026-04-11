'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/src/components/app-shell';
import { profileApi } from '@/src/lib/api-client';
import { useAuth } from '@/src/providers/auth-provider';

interface ProfileData {
  id: string;
  email: string;
  name?: string | null;
  plan?: string;
  profile?: {
    displayName?: string | null;
    consentVoiceProcessing?: boolean;
    consentMarketing?: boolean;
    subscriptionStatus?: string;
  } | null;
  voiceProfile?: {
    id: string;
    sampleCount: number;
    createdAt: string;
  } | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [consentVoiceProcessing, setConsentVoiceProcessing] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);

  async function load() {
    try {
      const result = await profileApi.get();
      setData(result);
      setDisplayName(result.profile?.displayName ?? result.name ?? '');
      setConsentVoiceProcessing(result.profile?.consentVoiceProcessing ?? false);
      setConsentMarketing(result.profile?.consentMarketing ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load profile');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await profileApi.update({
        displayName,
        consentVoiceProcessing,
        consentMarketing,
      });
      setMessage('Your atelier preferences have been saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save preferences');
    } finally {
      setSaving(false);
    }
  }

  async function deleteVoiceModel() {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(
        'Permanently delete your voice profile? This cannot be undone.',
      );
      if (!ok) return;
    }
    try {
      await profileApi.deleteVoiceModel();
      setData((prev) => (prev ? { ...prev, voiceProfile: null } : prev));
      setMessage('Your voice profile has been removed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete voice profile');
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <p className="text-[10px] uppercase tracking-[0.32em] text-champagne">
            Your atelier
          </p>
          <h1 className="voixa-heading text-4xl md:text-5xl">Profile & privacy</h1>
          <p className="text-sm text-pearl/65">
            Curate the way Voixa knows you. Every preference is private to your account.
          </p>
        </motion.div>

        {error && (
          <p className="mt-6 rounded-2xl border border-burgundy/40 bg-burgundy/20 px-4 py-3 text-sm text-pearl/80">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-6 rounded-2xl border border-champagne/40 bg-champagne/10 px-4 py-3 text-sm text-pearl/85">
            {message}
          </p>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="voixa-card rounded-[32px] p-8">
            <p className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Account</p>
            <h2 className="mt-2 voixa-heading text-2xl">Your details</h2>
            {loading ? (
              <div className="mt-6 h-32 animate-pulse rounded-2xl bg-white/5" />
            ) : (
              <div className="mt-6 space-y-5">
                <div>
                  <label className="voixa-label" htmlFor="displayName">
                    Artist name
                  </label>
                  <input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="voixa-input"
                    placeholder="How shall we address you?"
                  />
                </div>
                <div>
                  <label className="voixa-label">Email</label>
                  <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-pearl/70">
                    {data?.email ?? user?.email ?? '—'}
                  </p>
                </div>

                <div id="privacy" className="pt-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">
                    Privacy
                  </p>
                  <h3 className="mt-2 voixa-heading text-xl">Consent</h3>
                  <div className="mt-4 space-y-3">
                    <ConsentToggle
                      label="Allow Voixa to refine my voice"
                      description="Required to process recordings into final tracks."
                      checked={consentVoiceProcessing}
                      onChange={setConsentVoiceProcessing}
                    />
                    <ConsentToggle
                      label="Send me atelier news"
                      description="Occasional updates on new style modes and features."
                      checked={consentMarketing}
                      onChange={setConsentMarketing}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="voixa-button-primary"
                >
                  {saving ? 'Saving…' : 'Save preferences'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="voixa-card rounded-3xl p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Voice profile</p>
              <h3 className="mt-2 voixa-heading text-xl">Your vocal identity</h3>
              {data?.voiceProfile ? (
                <>
                  <p className="mt-3 text-sm text-pearl/65">
                    Built from {data.voiceProfile.sampleCount} samples. Voixa uses your profile to
                    keep enhancements faithful to your timbre.
                  </p>
                  <button
                    type="button"
                    onClick={deleteVoiceModel}
                    className="mt-4 w-full rounded-full border border-burgundy/50 px-4 py-2 text-xs uppercase tracking-[0.22em] text-burgundy transition hover:bg-burgundy/10"
                  >
                    Delete voice profile
                  </button>
                </>
              ) : (
                <p className="mt-3 text-sm text-pearl/65">
                  No voice profile yet. Record three minutes of your voice in any session and
                  Voixa will build a private identity reference for you.
                </p>
              )}
            </div>

            <div id="billing" className="voixa-card rounded-3xl p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Plan</p>
              <h3 className="mt-2 voixa-heading text-xl capitalize">
                {(data?.plan ?? user?.plan ?? 'free').toLowerCase()} plan
              </h3>
              <p className="mt-3 text-sm text-pearl/65">
                Upgrade for priority compute, longer takes, and WAV export. Billing is delivered
                via Stripe and your invoices stay private to your account.
              </p>
              <button
                type="button"
                disabled
                className="voixa-button-ghost mt-4 w-full opacity-60"
                title="Coming soon"
              >
                Upgrade plan
              </button>
            </div>

            <div className="voixa-card rounded-3xl p-6 text-xs text-pearl/55">
              <p className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Data</p>
              <p className="mt-2 leading-relaxed">
                You can request a copy of every project and asset associated with your account, or
                permanently remove your data. Reach out to{' '}
                <span className="text-champagne">privacy@voixa.studio</span> at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

interface ConsentToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ConsentToggle({ label, description, checked, onChange }: ConsentToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-4 rounded-2xl border px-4 py-3 text-left transition ${
        checked ? 'border-champagne/50 bg-white/[0.04]' : 'border-white/10 bg-white/[0.02] hover:border-white/20'
      }`}
    >
      <span
        className={`mt-1 inline-flex h-5 w-9 items-center rounded-full border transition ${
          checked ? 'border-champagne bg-champagne/30' : 'border-white/20 bg-white/5'
        }`}
      >
        <span
          className={`mx-[2px] h-3 w-3 rounded-full bg-champagne transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </span>
      <span>
        <span className="block text-sm text-pearl">{label}</span>
        <span className="block text-[11px] text-pearl/50">{description}</span>
      </span>
    </button>
  );
}
