interface Settings {
  discordRPC: {
    enabled: boolean;
    status: string;
    details: string;
    largeImageKey: string;
    smallImageKey: string;
    customClientId?: string;
    showPlayingBeat: boolean;
    showBeatDetails: {
      name: boolean;
      producer: boolean;
    };
  };
}

interface DiscordRPCSectionProps {
  settings: Settings;
  connectionStatus: 'connected' | 'error' | 'disconnected';
  onUpdateSettings: (newSettings: Partial<Settings>) => Promise<Settings>;
  onSetEnabled: (enabled: boolean) => void;
  onSetCustomState: (state: string) => void;
  onSetCustomDetails: (details: string) => void;
  onSetLargeImageKey: (key: string) => void;
  onSetSmallImageKey: (key: string) => void;
  onSetShowPlayingBeat: (showPlayingBeat: boolean) => void;
  onSetShowBeatDetails: (showBeatDetails: {
    name: boolean;
    producer: boolean;
  }) => void;
  onSetCustomClientId: (customClientId: string | undefined) => void;
}

export const DiscordRPCSection = ({
  settings,
  connectionStatus,
  onUpdateSettings,
  onSetEnabled,
  onSetCustomState,
  onSetCustomDetails,
  onSetLargeImageKey,
  onSetSmallImageKey,
  onSetShowPlayingBeat,
  onSetShowBeatDetails,
  onSetCustomClientId,
}: DiscordRPCSectionProps) => {
  console.log('[DiscordRPCSection] Current settings:', settings.discordRPC);

  const showBeatDetails = settings.discordRPC?.showBeatDetails;

  const handleShowBeatDetailsChange = (key: string, value: boolean) => {
    console.log('[DiscordRPCSection] Updating beat details setting:', key, value);
    onSetShowBeatDetails({
      ...showBeatDetails,
      [key]: value,
    });
  };

  return (
    <section className="bg-[var(--theme-surface)] rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
      <div className="px-6 py-4 border-b border-[var(--theme-border)] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold">Discord Rich Presence</h2>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.discordRPC?.enabled ?? false}
            onChange={async (e) => {
              const updatedSettings = await onUpdateSettings({
                discordRPC: {
                  ...settings.discordRPC,
                  enabled: e.target.checked,
                },
              });
              onSetEnabled(updatedSettings.discordRPC.enabled);
            }}
          />
          <div className="w-11 h-6 bg-[var(--theme-surface-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-accent)]"></div>
        </label>
      </div>

      {settings.discordRPC?.enabled && (
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-[var(--theme-surface)] backdrop-blur-sm">
            <div 
              className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500' 
                  : connectionStatus === 'error' 
                  ? 'bg-red-500' 
                  : 'bg-gray-500'
              }`}
            />
            <span className="text-sm opacity-70">
              {connectionStatus === 'connected' 
                ? 'Connected to Discord' 
                : connectionStatus === 'error' 
                ? 'Connection Failed' 
                : 'Disconnected'}
            </span>
          </div>

          <div className="space-y-4">
            {/* Custom Client ID */}
            <div className="rounded-xl bg-[var(--theme-surface)] backdrop-blur-sm hover:bg-[var(--theme-surface-hover)] transition-all duration-300 p-4">
              <label className="block text-sm font-medium mb-2 opacity-70">Custom Client ID (Optional)</label>
              <input
                type="text"
                value={settings.discordRPC.customClientId || ''}
                onChange={async (e) => {
                  await onUpdateSettings({
                    discordRPC: {
                      ...settings.discordRPC,
                      customClientId: e.target.value || undefined,
                    },
                  });
                  onSetCustomClientId(e.target.value || undefined);
                }}
                className="w-full px-4 py-2 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] transition-all duration-300"
                placeholder="Enter your Discord Application Client ID"
              />
            </div>

            {/* Show Playing Beat Toggle */}
            <div className="rounded-xl bg-[var(--theme-surface)] backdrop-blur-sm hover:bg-[var(--theme-surface-hover)] transition-all duration-300 p-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium opacity-70">Show Currently Playing Beat</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.discordRPC.showPlayingBeat}
                    onChange={async (e) => {
                      await onUpdateSettings({
                        discordRPC: {
                          ...settings.discordRPC,
                          showPlayingBeat: e.target.checked,
                        },
                      });
                      onSetShowPlayingBeat(e.target.checked);
                    }}
                  />
                  <div className="w-11 h-6 bg-[var(--theme-surface-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-accent)]"></div>
                </label>
              </div>
            </div>

            {/* Beat Details Settings */}
            {settings.discordRPC.showPlayingBeat && (
              <div className="rounded-xl bg-[var(--theme-surface)] backdrop-blur-sm hover:bg-[var(--theme-surface-hover)] transition-all duration-300 p-4">
                <label className="block text-sm font-medium mb-4 opacity-70">Show Beat Details</label>
                <div className="space-y-3">
                  {Object.entries({
                    name: 'Beat Name',
                    producer: 'Producer',
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm opacity-70">{label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={showBeatDetails?.[key as keyof typeof showBeatDetails] ?? false}
                          onChange={(e) => handleShowBeatDetailsChange(key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-[var(--theme-surface-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-accent)]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="rounded-xl bg-[var(--theme-surface)] backdrop-blur-sm hover:bg-[var(--theme-surface-hover)] transition-all duration-300 p-4">
              <label className="block text-sm font-medium mb-2 opacity-70">Status</label>
              <input
                type="text"
                value={settings.discordRPC.status}
                onChange={async (e) => {
                  const updatedSettings = await onUpdateSettings({
                    discordRPC: {
                      ...settings.discordRPC,
                      status: e.target.value,
                    },
                  });
                  onSetCustomState(updatedSettings.discordRPC.status);
                }}
                className="w-full px-4 py-2 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] transition-all duration-300"
                placeholder="What are you doing?"
              />
            </div>

            {/* Details */}
            <div className="rounded-xl bg-[var(--theme-surface)] backdrop-blur-sm hover:bg-[var(--theme-surface-hover)] transition-all duration-300 p-4">
              <label className="block text-sm font-medium mb-2 opacity-70">Details</label>
              <input
                type="text"
                value={settings.discordRPC.details}
                onChange={async (e) => {
                  const updatedSettings = await onUpdateSettings({
                    discordRPC: {
                      ...settings.discordRPC,
                      details: e.target.value,
                    },
                  });
                  onSetCustomDetails(updatedSettings.discordRPC.details);
                }}
                className="w-full px-4 py-2 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] transition-all duration-300"
                placeholder="Additional details"
              />
            </div>

            {/* Large Image Key */}
            <div className="rounded-xl bg-[var(--theme-surface)] backdrop-blur-sm hover:bg-[var(--theme-surface-hover)] transition-all duration-300 p-4">
              <label className="block text-sm font-medium mb-2 opacity-70">Large Image Key</label>
              <input
                type="text"
                value={settings.discordRPC.largeImageKey}
                onChange={async (e) => {
                  const updatedSettings = await onUpdateSettings({
                    discordRPC: {
                      ...settings.discordRPC,
                      largeImageKey: e.target.value,
                    },
                  });
                  onSetLargeImageKey(updatedSettings.discordRPC.largeImageKey);
                }}
                className="w-full px-4 py-2 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] transition-all duration-300"
                placeholder="Large image asset key"
              />
            </div>

            {/* Small Image Key */}
            <div className="rounded-xl bg-[var(--theme-surface)] backdrop-blur-sm hover:bg-[var(--theme-surface-hover)] transition-all duration-300 p-4">
              <label className="block text-sm font-medium mb-2 opacity-70">Small Image Key</label>
              <input
                type="text"
                value={settings.discordRPC.smallImageKey}
                onChange={async (e) => {
                  const updatedSettings = await onUpdateSettings({
                    discordRPC: {
                      ...settings.discordRPC,
                      smallImageKey: e.target.value,
                    },
                  });
                  onSetSmallImageKey(updatedSettings.discordRPC.smallImageKey);
                }}
                className="w-full px-4 py-2 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] transition-all duration-300"
                placeholder="Small image asset key"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
