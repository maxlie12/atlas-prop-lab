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
    }
}

