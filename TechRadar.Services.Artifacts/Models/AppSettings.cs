using System.Collections.Generic;

namespace TechRadar.Services.Artifacts.Models
{
    public class AppSettings
    {
        public List<Cycle> DefaultCycles { get; set; }
        public List<Quadrant> DefaultQuadrants { get; set; }
    }
}
