#region copyright
// Copyright (c) 2017 OEConnection, LLC
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
#endregion

using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Threading.Tasks;
using TechRadar.Services.Artifacts.Interfaces;
using TechRadar.Services.Artifacts.Models;

namespace TechRadar.Services.Repositories
{
    public class RadarRepository : IRadarRepository
    {
        private readonly IMongoDbContext _context;

        public RadarRepository(IMongoDbContext context)
        {
            _context = context;
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
            var deleteBlips = _context.Blips.DeleteManyAsync(x => x.RadarId == id);
            var deleteRadar = _context.Radars.FindOneAndDeleteAsync(r => r.Id == id);

            await Task.WhenAll(deleteBlips, deleteRadar);

            return await deleteRadar;
        }

        public async Task<IEnumerable<Blip>> GetBlipsInRadar(string id)
        {
            return await _context.Blips.Find(m => m.RadarId == id).ToListAsync();
        }

        public async Task<IEnumerable<Blip>> GetBlipsInRadar(string id, int quadrantNumber)
        {
            var radar = _context.Radars.Find(m => m.Id == id).First<Radar>();

            var filterBuilder = Builders<Blip>.Filter;

            if (radar == null) return new List<Blip>();

            var filter = filterBuilder.Eq(x => x.RadarId, id);

            var quadrant = radar.Quadrants?.FirstOrDefault(x => x.QuadrantNumber == quadrantNumber);
            if (quadrant != null)
            {
                filter = filter & filterBuilder.Eq(x => x.QuadrantId, quadrant.Id);
            }

            return await _context.Blips.Find(filter).ToListAsync();
        }

        public async Task<Radar> GetRadarById(string id)
        {
            return await _context.Radars.Find(m => m.Id == id).FirstAsync<Radar>();
        }

        public async Task<IEnumerable<Radar>> GetRadars()
        {
            return await _context.Radars.Find(m => true).ToListAsync();
        }

        public async Task<Blip> InsertBlip(string id, Blip blip)
        {
            blip.Id = ObjectId.GenerateNewId().ToString();

            var options = new FindOneAndUpdateOptions<Blip>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            var filter = Builders<Blip>.Filter.Eq(r => r.Id, blip.Id);

            var update = Builders<Blip>.Update
                .Set("name", blip.Name)
                .Set("description", blip.Description)
                .Set("size", blip.Size)
                .Set("quadrant", ObjectId.Parse(blip.QuadrantId))
                .Set("cycle", ObjectId.Parse(blip.CycleId))
                .Set("radar", ObjectId.Parse(id))
                .CurrentDate("added")
                .CurrentDate("lastModified");

            return await _context.Blips.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<Blip> UpdateBlip(string id, Blip blip)
        {
            var options = new FindOneAndUpdateOptions<Blip>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            var filter = Builders<Blip>.Filter.Eq(r => r.Id, blip.Id);

            var update = Builders<Blip>.Update
                .Set("name", blip.Name)
                .Set("description", blip.Description)
                .Set("size", blip.Size)
                .Set("quadrant", ObjectId.Parse(blip.QuadrantId))
                .Set("cycle", ObjectId.Parse(blip.CycleId))
                .Set("radar", ObjectId.Parse(blip.RadarId))
                .CurrentDate("lastModified");

            return await _context.Blips.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<Radar> InsertCycleInRadar(string id, Cycle cycle)
        {
            cycle.Id = ObjectId.GenerateNewId().ToString();

            var options = new FindOneAndUpdateOptions<Radar>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            var filter = Builders<Radar>.Filter.Where(r => r.Id == id);

            var update = Builders<Radar>.Update.Push("cycles", cycle);

            return await _context.Radars.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<Radar> UpdateCycleInRadar(string id, Cycle cycle)
        {
            var options = new FindOneAndUpdateOptions<Radar>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            var filter = Builders<Radar>.Filter.Where(r => r.Id == id && r.Cycles.Any(q => q.Id == cycle.Id));

            var update = Builders<Radar>.Update
                .Set("cycles.$.order", cycle.Order)
                .Set("cycles.$.name", cycle.Name)
                .Set("cycles.$.fullName", cycle.FullName)
                .Set("cycles.$.description", cycle.Description)
                .Set("cycles.$.size", cycle.Size);

            return await _context.Radars.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<Radar> InsertQuadrantInRadar(string id, Quadrant quadrant)
        {
            quadrant.Id = ObjectId.GenerateNewId().ToString();

            var options = new FindOneAndUpdateOptions<Radar>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            var filter = Builders<Radar>.Filter.Where(r => r.Id == id && r.Quadrants.Any(q => q.Id == quadrant.Id));

            var update = Builders<Radar>.Update
                    .Set("quadrants.$.quadrantNumber", quadrant.QuadrantNumber)
                    .Set("quadrants.$.name", quadrant.Name)
                    .CurrentDate("quadrants.$.added")
                    .CurrentDate("quadrants.$.lastmodified")
                    .Set("quadrants.$.description", quadrant.Description);

            return await _context.Radars.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<Radar> UpdateQuadrantInRadar(string id, Quadrant quadrant)
        {
            var options = new FindOneAndUpdateOptions<Radar>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            var filter = Builders<Radar>.Filter.Where(r => r.Id == id && r.Quadrants.Any(q => q.Id == quadrant.Id));

            var update = Builders<Radar>.Update
                .Set("quadrants.$.quadrantNumber", quadrant.QuadrantNumber)
                .Set("quadrants.$.name", quadrant.Name)
                .CurrentDate("quadrants.$.lastmodified")
                .Set("quadrants.$.description", quadrant.Description);

            return await _context.Radars.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<Radar> InsertRadar(Radar radar)
        {
            if (radar == null)
            {
                return null;
            }

            // Give sub objects new ids
            GiveQuadrantsNewIds(radar);
            GiveCyclesNewIds(radar);

            var options = new FindOneAndUpdateOptions<Radar>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            // Add new
            var filter = Builders<Radar>.Filter.Eq(r => r.Id, ObjectId.GenerateNewId().ToString());

            var update = Builders<Radar>.Update
                .Set("name", radar.Name)
                .Set("sized", radar.Sized)
                .Set("description", radar.Description)
                .CurrentDate("added")
                .CurrentDate("lastModified")
                .Set("quadrants", radar.Quadrants)
                .Set("cycles", radar.Cycles);

            return await _context.Radars.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<Radar> UpdateRadar(Radar radar)
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

            var filter = Builders<Radar>.Filter.Eq(r => r.Id, radar.Id);

            var update = Builders<Radar>.Update
                .Set("name", radar.Name)
                .Set("sized", radar.Sized)
                .Set("description", radar.Description)
                .CurrentDate("lastModified");

            return await _context.Radars.FindOneAndUpdateAsync(filter, update, options);
        }

        private static void GiveQuadrantsNewIds(Radar radar)
        {
            foreach (var quad in radar.Quadrants)
            {
                quad.Id = ObjectId.GenerateNewId().ToString();
            }
        }

        private static void GiveCyclesNewIds(Radar radar)
        {
            foreach (var cycle in radar.Cycles)
            {
                cycle.Id = ObjectId.GenerateNewId().ToString();
            }
        }
    }
}
