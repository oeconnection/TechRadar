using MongoDB.Driver;
using TechRadar.Services.Artifacts.Models;

namespace TechRadar.Services.Artifacts.Interfaces
{
    public interface IMongoDbContext
    {
        IMongoCollection<Radar> Radars { get; }
        IMongoCollection<Blip> Blips { get; }
    }
}
