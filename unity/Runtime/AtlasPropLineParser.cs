using System;
using UnityEngine;

namespace ProjectAtlas.Props
{
    public static class AtlasPropLineParser
    {
        public static bool TryParse(string line, out AtlasPropEvent propEvent, out string rejection)
        {
            propEvent = null;
            rejection = null;
            if (string.IsNullOrWhiteSpace(line))
            {
                rejection = "empty_line";
                return false;
            }

            try
            {
                propEvent = JsonUtility.FromJson<AtlasPropEvent>(line.Trim());
            }
            catch (Exception)
            {
                rejection = "invalid_json";
                return false;
            }

            if (propEvent == null || propEvent.v != 1)
            {
                rejection = "unsupported_version";
                return false;
            }
            if (propEvent.type != "PLAYER_INTENT")
            {
                rejection = "not_player_intent";
                return false;
            }
            if (string.IsNullOrWhiteSpace(propEvent.deviceId) ||
                string.IsNullOrWhiteSpace(propEvent.role) ||
                string.IsNullOrWhiteSpace(propEvent.action))
            {
                rejection = "missing_required_field";
                return false;
            }
            return true;
        }
    }
}

