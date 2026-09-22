import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/common/PageHeader';

const playTestSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    // Main oscillator (the sound)
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sawtooth'; // Harsh sound good for alerts

    // Modulator oscillator (the siren sweep)
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 2; // 2 sweeps per second

    // Gain node for the modulation amount
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 400; // Modulate frequency by +/- 400Hz

    // Base frequency
    oscillator.frequency.value = 800; // 800Hz base

    // Connect LFO to main oscillator frequency
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    // Master volume
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.1, audioCtx.currentTime); // keep it low
    // Fade out at the end
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);

    oscillator.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    // Start and stop
    oscillator.start(audioCtx.currentTime);
    lfo.start(audioCtx.currentTime);

    oscillator.stop(audioCtx.currentTime + 1.5);
    lfo.stop(audioCtx.currentTime + 1.5);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
};

export const AlertsNotificationPage = () => {
  const { t } = useTranslation();

  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <div className="  mx-auto space-y-8  ">
      <PageHeader title="Notification Settings" />

      {/* Email Section */}
      <div className="space-y-6">
        <div>
          <h2 className=" font-semibold   mb-2">Email Notifications</h2>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-email"
              onChange={() => setEmailEnabled(!emailEnabled)}
              checked={emailEnabled}
            />
            <Label
              htmlFor="enable-email"
              className="text-sm text-slate-500 font-normal"
            >
              Enable email notifications
            </Label>
          </div>
        </div>

        <div>
          <h2 className="  font-semibold   mb-2">Email Recipients</h2>
          <div className="flex items-center gap-4">
            <Input
              type="email"
              placeholder="admin@company.com"
              className="flex-1 bg-slate-100 border-none h-12"
              disabled={!emailEnabled}
            />
            <Button
              variant="secondary"
              className="px-8"
              disabled={!emailEnabled}
            >
              Add
            </Button>
          </div>
        </div>

        <div>
          <h2 className="  font-semibold   mb-2">Email Template</h2>
          <div className="bg-slate-100 rounded-lg p-6 min-h-[120px] text-slate-600 text-sm whitespace-pre-line">
            {
              'Subject: [ALERT] {severity} - {device_name} Alert:\n{alert_message} Time: {timestamp}'
            }
          </div>
        </div>
      </div>

      {/* SMS Section */}
      <div className="space-y-6 pt-4">
        <div>
          <h2 className="  font-semibold   mb-2">SMS Notifications</h2>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-sms"
              onChange={() => setSmsEnabled(!smsEnabled)}
              checked={smsEnabled}
            />
            <Label
              htmlFor="enable-sms"
              className="text-sm text-slate-500 font-normal"
            >
              Enable SMS notifications
            </Label>
          </div>
        </div>

        <div>
          <h2 className="  font-semibold   mb-2">Phone Numbers</h2>
          <div className="flex items-center gap-4">
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              className="flex-1 bg-slate-100 border-none h-12"
              disabled={!smsEnabled}
            />
            <Button variant="secondary" className="px-8" disabled={!smsEnabled}>
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Sound Section */}
      <div className="space-y-6 pt-4">
        <div>
          <h2 className="  font-semibold   mb-2">Sound Notifications</h2>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-sound"
              onChange={(e) => {
                const checked = e.target.checked;
                setSoundEnabled(checked);
                if (checked) {
                  playTestSound();
                }
              }}
              checked={soundEnabled}
            />
            <Label
              htmlFor="enable-sound"
              className="text-sm text-slate-500 font-normal"
            >
              Enable sound on alert
            </Label>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 pt-8">
        <Button
          variant="secondary"
          className="bg-slate-200 hover:bg-slate-300   font-medium px-8 h-10"
        >
          Cancel
        </Button>
        <Button variant="primary" className="px-8  ">
          Save Setting
        </Button>
      </div>
    </div>
  );
};

export default AlertsNotificationPage;
