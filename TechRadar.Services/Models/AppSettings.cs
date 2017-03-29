using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TechRadar.Services.Models
{
    public class AppSettings
    {
        public List<Cycle> DefaultCycles { get; set; }
        public List<Quadrant> DefaultQuadrants { get; set; }
    }
}
