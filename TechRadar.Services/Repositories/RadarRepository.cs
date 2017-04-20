using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Threading.Tasks;
using TechRadar.Services.Models;
using Microsoft.Extensions.Options;

namespace TechRadar.Services.Repositories
{
    public class RadarRepository : IRadarRepository
    {
        private AppSettings _appSettings;
        private DatabaseSettings _databaseSettings;
        private readonly MongoDBContext _context = null;

        public RadarRepository(IOptions<AppSettings> appSettings, IOptions<DatabaseSettings> databaseSettings)
        {
            _appSettings = appSettings.Value;
            _databaseSettings = databaseSettings.Value;
            _context = new MongoDBContext(databaseSettings);
        }

        public async Task<Blip> DeleteBlipFromRadar(string radarId, string blipId)
        {
            return await _context.Blips.FindOneAndDeleteAsync(r => r.Id == blipId && r.RadarId == radarId);
        }

        public async Task<Radar> DeleteCycleFromRadar(string id, string cycleId)
        {
            var options = new FindOneAndUpdateOptions<Radar>
            {
                ReturnDocument = ReturnDocument.After
            };

            var filterBuilder = Builders<Radar>.Filter;
            var filter = filterBuilder.Eq(r => r.Id, id);

            var update = Builders<Radar>.Update.PullFilter("cycles",
                Builders<Cycle>.Filter.Eq(c => c.Id, cycleId));

            return await _context.Radars.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<Radar> DeleteRadar(string id)
        {
            return await _context.Radars.FindOneAndDeleteAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Blip>> GetBlipsInRadar(string id)
        {
            return await _context.Blips.Find<Blip>(m => m.RadarId == id).ToListAsync<Blip>();
        }

        public async Task<IEnumerable<Blip>> GetBlipsInRadar(string id, int quadrantNumber)
        {
            Radar radar = _context.Radars.Find(m => m.Id == id).First<Radar>();
            Quadrant quadrant;

            var filterBuilder = Builders<Blip>.Filter;

            if (radar != null)
            {
                var filter = filterBuilder.Eq(x => x.RadarId, id);

                if (radar.Quadrants != null)
                {
                    quadrant = radar.Quadrants.FirstOrDefault<Quadrant>(x => x.QuadrantNumber == quadrantNumber);
                    if (quadrant != null)
                    {
                        filter = filter & filterBuilder.Eq(x => x.QuadrantId, quadrant.Id);
                    }
                }

                return await _context.Blips.Find(filter).ToListAsync<Blip>();
            }

            return new List<Blip>();
        }

        public async Task<Radar> GetRadarById(string id)
        {
            return await _context.Radars.Find(m => m.Id == id).FirstAsync<Radar>();
        }

        public async Task<IEnumerable<Radar>> GetRadars()
        {
            return await _context.Radars.Find(m => true).ToListAsync<Radar>();
        }

        public async Task<Blip> UpsertBlip(string id, Blip blip)
        {
            var isNew = false;
            if (string.IsNullOrWhiteSpace(blip.Id))
            {
                isNew = true;
                blip.Id = ObjectId.GenerateNewId().ToString();
            }

            var filterBuilder = Builders<Blip>.Filter;
            FilterDefinition<Blip> filter;
            UpdateDefinition<Blip> update;

            var options = new FindOneAndUpdateOptions<Blip>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            if (isNew)
            {
                // Add new
                filter = Builders<Blip>.Filter.Eq(r => r.Id, ObjectId.GenerateNewId().ToString());

                update = Builders<Blip>.Update
                    .Set("name", blip.Name)
                    .Set("description", blip.Description)
                    .Set("size", blip.Size)
                    .Set("quadrant", ObjectId.Parse(blip.QuadrantId))
                    .Set("cycle", ObjectId.Parse(blip.CycleId))
                    .Set("radar", ObjectId.Parse(blip.RadarId))
                    .CurrentDate("added")
                    .CurrentDate("lastModified");
            }
            else
            {
                filter = Builders<Blip>.Filter.Eq(r => r.Id, blip.Id);

                update = Builders<Blip>.Update
                    .Set("name", blip.Name)
                    .Set("description", blip.Description)
                    .Set("size", blip.Size)
                    .Set("quadrant", ObjectId.Parse(blip.QuadrantId))
                    .Set("cycle", ObjectId.Parse(blip.CycleId))
                    .Set("radar", ObjectId.Parse(blip.RadarId))
                    .CurrentDate("lastModified");
            }

            return await _context.Blips.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<Radar> UpsertCycleInRadar(string id, Cycle cycle)
        {
            var isNew = false;
            if (string.IsNullOrWhiteSpace(cycle.Id))
            {
                isNew = true;
                cycle.Id = ObjectId.GenerateNewId().ToString();
            }

            var filterBuilder = Builders<Radar>.Filter;
            FilterDefinition<Radar> filter;
            UpdateDefinition<Radar> update;

            var options = new FindOneAndUpdateOptions<Radar>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };


            if (isNew)
            {
                filter = filterBuilder.Where(r => r.Id == id);

                update = Builders<Radar>.Update
                    .Push("cycles", cycle);
            }
            else
            {
                // Update existing
                filter = filterBuilder.Where(r => r.Id == id && r.Cycles.Any(q => q.Id == cycle.Id));

                update = Builders<Radar>.Update
                    .Set("cycles.$.order", cycle.Order)
                    .Set("cycles.$.name", cycle.Name)
                    .Set("cycles.$.fullName", cycle.FullName)
                    .Set("cycles.$.description", cycle.Description)
                    .Set("cycles.$.size", cycle.Size);

            }

            return await _context.Radars.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<Radar> UpsertQuadrantInRadar(string id, Quadrant quadrant)
        {
            if (string.IsNullOrWhiteSpace(quadrant.Id))
            {
                quadrant.Id = ObjectId.GenerateNewId().ToString();
            }

            var options = new FindOneAndUpdateOptions<Radar>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            var filterBuilder = Builders<Radar>.Filter;
            var filter = filterBuilder.Where(r => r.Id == id && r.Quadrants.Any(q => q.Id == quadrant.Id));

            var update = Builders<Radar>.Update
                    .Set("quadrants.$.quadrantNumber", quadrant.QuadrantNumber)
                    .Set("quadrants.$.name", quadrant.Name)
                    .Set("quadrants.$.description", quadrant.Description);

            return await _context.Radars.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<Radar> UpsertRadar(Radar radar)
        {
            if (radar == null)
            {
                return null;
            }

            var options = new FindOneAndUpdateOptions<Radar>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            FilterDefinition<Radar> filter;
            UpdateDefinition<Radar> update;
            if (string.IsNullOrWhiteSpace(radar.Id))
            {
                // Add new
                filter = Builders<Radar>.Filter.Eq(r => r.Id, ObjectId.GenerateNewId().ToString());

                update = Builders<Radar>.Update
                    .Set("name", radar.Name)
                    .Set("group", radar.Group)
                    .Set("description", radar.Description)
                    .CurrentDate("lastModified")
                    .Set("quadrants", GetDefaultQuadrants())
                    .Set("cycles", GetDefaultCycles());
            }
            else
            {
                filter = Builders<Radar>.Filter.Eq(r => r.Id, radar.Id);

                update = Builders<Radar>.Update
                    .Set("name", radar.Name)
                    .Set("group", radar.Group)
                    .Set("description", radar.Description)
                    .CurrentDate("lastModified");
            }

            return await _context.Radars.FindOneAndUpdateAsync(filter, update, options);
        }

        private List<Quadrant> GetDefaultQuadrants()
        {
            var quadrantSettings = _appSettings.DefaultQuadrants;
            var quadrants = new List<Quadrant>();

            foreach (var quad in quadrantSettings)
            {
                quad.Id = ObjectId.GenerateNewId().ToString();
                quadrants.Add(quad);
            }

            return quadrants;

        }

        private List<Cycle> GetDefaultCycles()
        {
            var cycleSettings = _appSettings.DefaultCycles;
            var cycles = new List<Cycle>();

            foreach (var cycle in cycleSettings)
            {
                cycle.Id = ObjectId.GenerateNewId().ToString();
                cycles.Add(cycle);
            }

            return cycles;

        }

    }
}
