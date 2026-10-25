using System;

namespace ProjectAtlas.Props
{
    [Serializable]
    public sealed class AtlasPropEvent
    {
        public int v;
        public string deviceId;
        public string role;
        public uint seq;
        public string type;
        public string action;
        public uint atMs;

        // Hardware Gate 01: Arc Bow FIRE carries the coded shot id; armour SHOT_SEEN carries the
        // same id plus the first zone that saw it. Zero/empty when a device does not send them.
        public int shot;
        public int shooter;
        public string zone;
    }
}
