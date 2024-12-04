interface Settings {
  discordRPC: {
    enabled: boolean;
    status: string;
    details: string;
    largeImageKey: string;
    smallImageKey: string;
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
}: DiscordRPCSectionProps) => {
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
