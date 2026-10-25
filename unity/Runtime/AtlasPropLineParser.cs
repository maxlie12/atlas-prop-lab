using System;
using UnityEngine;

namespace ProjectAtlas.Props
{
    public static class AtlasPropLineParser
    {
        public const string PlayerIntent = "PLAYER_INTENT";
        public const string ShotSeen = "SHOT_SEEN";
        public const string ReadyPrefix = "ATLAS_PROP_READY";

        /// <summary>Returns the deviceId of a boot banner ("ATLAS_PROP_READY v1 &lt;deviceId&gt; ..."),
        /// or null when the line is not one.</summary>
        public static string TryParseReady(string line)
        {
            if (string.IsNullOrWhiteSpace(line)) return null;
            var parts = line.Trim().Split(' ');
            return parts.Length >= 3 && parts[0] == ReadyPrefix ? parts[2] : null;
        }

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
            if (string.IsNullOrWhiteSpace(propEvent.deviceId))
            {
                rejection = "missing_required_field";
                return false;
            }

            if (propEvent.type == PlayerIntent)
            {
                if (string.IsNullOrWhiteSpace(propEvent.role) || string.IsNullOrWhiteSpace(propEvent.action))
                {
                    rejection = "missing_required_field";
                    return false;
                }
                return true;
            }
            if (propEvent.type == ShotSeen)
            {
                if (propEvent.shot <= 0 || string.IsNullOrWhiteSpace(propEvent.zone))
                {
                    rejection = "missing_required_field";
                    return false;
                }
                return true;
            }

            // LOCAL_REJECT, HIT_REJECT, DUPLICATE_IGNORED and other diagnostics never enter gameplay.
            rejection = "not_gameplay_event";
            return false;
        }
    }
}
