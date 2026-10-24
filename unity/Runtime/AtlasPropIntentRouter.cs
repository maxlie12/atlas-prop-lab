using System;
using System.Collections.Generic;

namespace ProjectAtlas.Props
{
    public sealed class AtlasPropIntentRouter
    {
        private readonly Dictionary<string, uint> _lastSequenceByDevice = new();

        public event Action<AtlasPropEvent> IntentAccepted;
        public event Action<string, string> LineRejected;

        public bool PushLine(string line)
        {
            if (!AtlasPropLineParser.TryParse(line, out var propEvent, out var rejection))
            {
                LineRejected?.Invoke(line, rejection);
                return false;
            }

            if (_lastSequenceByDevice.TryGetValue(propEvent.deviceId, out var lastSequence) &&
                propEvent.seq <= lastSequence)
            {
                LineRejected?.Invoke(line, "duplicate_or_stale_sequence");
                return false;
            }

            _lastSequenceByDevice[propEvent.deviceId] = propEvent.seq;
            IntentAccepted?.Invoke(propEvent);
            return true;
        }

        public void ResetDevice(string deviceId)
        {
            if (!string.IsNullOrWhiteSpace(deviceId)) _lastSequenceByDevice.Remove(deviceId);
        }

        public void ResetAll() => _lastSequenceByDevice.Clear();
    }
}

