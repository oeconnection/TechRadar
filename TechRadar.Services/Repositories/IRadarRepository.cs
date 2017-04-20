using System.Collections.Generic;
using System.Threading.Tasks;
using TechRadar.Services.Models;

namespace TechRadar.Services.Repositories
{
    public interface IRadarRepository
    {
        Task<IEnumerable<Radar>> GetRadars();
        Task<Radar> GetRadarById(string id);
        Task<Radar> UpsertRadar(Radar radar);
        Task<Radar> DeleteRadar(string id);
        Task<IEnumerable<Blip>> GetBlipsInRadar(string id);
        Task<IEnumerable<Blip>> GetBlipsInRadar(string id, int quadrantNumber);
        Task<Radar> UpsertQuadrantInRadar(string id, Quadrant quadrant);
        Task<Radar> UpsertCycleInRadar(string id, Cycle cycle);
        Task<Radar> DeleteCycleFromRadar(string id, string cycleId);
        Task<Blip> UpsertBlip(string id, Blip blip);
        Task<Blip> DeleteBlipFromRadar(string radarId, string blipId);
    }
}
