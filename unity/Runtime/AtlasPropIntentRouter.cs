using System;
using System.Collections.Generic;

namespace ProjectAtlas.Props
{
    public sealed class AtlasPropIntentRouter
    {
        private struct DeviceClock
        {
            public uint Seq;
            public uint AtMs;
        }

        private readonly Dictionary<string, DeviceClock> _lastByDevice = new();

        public event Action<AtlasPropEvent> IntentAccepted;
        public event Action<AtlasPropEvent> ShotSeen;
        public event Action<string> DeviceBooted;
        public event Action<string, string> LineRejected;

        public bool PushLine(string line)
        {
            var bootedDevice = AtlasPropLineParser.TryParseReady(line);
            if (bootedDevice != null)
            {
                ResetDevice(bootedDevice);
                DeviceBooted?.Invoke(bootedDevice);
                return false;
            }

            if (!AtlasPropLineParser.TryParse(line, out var propEvent, out var rejection))
            {
                LineRejected?.Invoke(line, rejection);
                return false;
            }

            if (_lastByDevice.TryGetValue(propEvent.deviceId, out var last) && propEvent.seq <= last.Seq)
            {
                // seq restarts at 1 on every boot; uptime going backwards means a reboot whose
                // READY banner was missed, not a stale replay.
                if (propEvent.atMs >= last.AtMs)
                {
                    LineRejected?.Invoke(line, "duplicate_or_stale_sequence");
                    return false;
                }
                DeviceBooted?.Invoke(propEvent.deviceId);
            }

            _lastByDevice[propEvent.deviceId] = new DeviceClock { Seq = propEvent.seq, AtMs = propEvent.atMs };
            if (propEvent.type == AtlasPropLineParser.ShotSeen) ShotSeen?.Invoke(propEvent);
            else IntentAccepted?.Invoke(propEvent);
            return true;
        }

        public void ResetDevice(string deviceId)
        {
            if (!string.IsNullOrWhiteSpace(deviceId)) _lastByDevice.Remove(deviceId);
        }

        public void ResetAll() => _lastByDevice.Clear();
    }
}
