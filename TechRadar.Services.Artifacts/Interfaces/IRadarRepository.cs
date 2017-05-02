using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.VisualBasic.CompilerServices;
using TechRadar.Services.Artifacts.Models;

namespace TechRadar.Services.Artifacts.Interfaces
{
    public interface IRadarRepository
    {
        Task<IEnumerable<Radar>> GetRadars();
        Task<Radar> GetRadarById(string id);
        Task<Radar> InsertRadar(Radar radar);
        Task<Radar> UpdateRadar(Radar radar);
        Task<Radar> DeleteRadar(string id);
        Task<IEnumerable<Blip>> GetBlipsInRadar(string id);
        Task<IEnumerable<Blip>> GetBlipsInRadar(string id, int quadrantNumber);
        Task<Radar> InsertQuadrantInRadar(string id, Quadrant quadrant);
        Task<Radar> UpdateQuadrantInRadar(string id, Quadrant quadrant);
        Task<Radar> InsertCycleInRadar(string id, Cycle cycle);
        Task<Radar> UpdateCycleInRadar(string id, Cycle cycle);
        Task<Radar> DeleteCycleFromRadar(string id, string cycleId);
        Task<Blip> InsertBlip(string id, Blip blip);
        Task<Blip> UpdateBlip(string id, Blip blip);
        Task<Blip> DeleteBlipFromRadar(string radarId, string blipId);
    }
}
