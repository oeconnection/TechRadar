using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TechRadar.Services.Models;

namespace TechRadar.Services.Controllers
{
    [Route("api/[controller]")]
    public class RadarController : Controller
    {
        private readonly AppSettings _settings;

        public RadarController(IOptions<AppSettings> settings)
        {
            _settings = settings.Value;
        }

        // GET: api/radar
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            MongoDBContext dbContext = new MongoDBContext();
            var filter = new BsonDocument();

            var radarList = await dbContext.Radars.Find(m => true).ToListAsync<Radar>();

            return Ok(radarList);
        }

        // GET api/radar/5
        [HttpGet("{id}")]
        public Radar Get(string id)
        {
            MongoDBContext dbContext = new MongoDBContext();

            Radar radar = dbContext.Radars.Find(m => m.Id == id).ToList().FirstOrDefault<Radar>();

            return radar;
        }

        // GET api/radar/id/blips
        [HttpGet("{id}/blips")]
        public IEnumerable<Blip> GetBlips(string id)
        {
            MongoDBContext dbContext = new MongoDBContext();

            var blips = dbContext.Blips.Find(m => m.RadarId == id).ToList();

            return blips.ToList();
        }

        // GET api/radar/id/blips/3
        [HttpGet("{id}/blips/{quadrantNumber}")]
        public IEnumerable<Blip> GetBlips(string id, int quadrantNumber)
        {
            var radar = Get(id);
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

                MongoDBContext dbContext = new MongoDBContext();

                var blips = dbContext.Blips.Find(filter).ToList();

                return blips.ToList();
            }

            return new List<Blip>();
        }

        // POST api/radar
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        private List<Quadrant> GetDefaultQuadrants()
        {
            var quadrantSettings = _settings.DefaultQuadrants;
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
            var cycleSettings = _settings.DefaultCycles;
            var cycles = new List<Cycle>();

            foreach (var cycle in cycleSettings)
            {
                cycle.Id = ObjectId.GenerateNewId().ToString();
                cycles.Add(cycle);
            }

            return cycles;

        }

        // PUT api/radar
        [HttpPut()]
        public async Task<IActionResult> UpsertRadar([FromBody]Radar radar)
        {
            if (radar == null)
            {
                return BadRequest();
            }

            MongoDBContext dbContext = new MongoDBContext();

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

            var results = await dbContext.Radars.FindOneAndUpdateAsync(filter, update, options);

            return Ok(results);
        }

        // DELETE api/radar/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest();
            }

            MongoDBContext dbContext = new MongoDBContext();

            var result = await dbContext.Radars.FindOneAndDeleteAsync(r => r.Id == id);

            return Ok(result);
        }

        // PUT api/radar/5545454/quadrant
        [HttpPut("{id}/quadrant")]
        public async Task<IActionResult> UpsertQuadrant(string id, [FromBody]Quadrant quadrant)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest();
            }
            if (quadrant == null)
            {
                return BadRequest();
            }
            if (string.IsNullOrWhiteSpace(quadrant.Id))
            {
                quadrant.Id = ObjectId.GenerateNewId().ToString();
            }

            MongoDBContext dbContext = new MongoDBContext();

            var options = new FindOneAndUpdateOptions<Radar>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            var filterBuilder = Builders<Radar>.Filter;
            //var filter = filterBuilder.And(filterBuilder.Eq("Id", id), filterBuilder.Eq("quadrants.id", quadrant.Id));
            var filter = filterBuilder.Where(r => r.Id == id && r.Quadrants.Any(q => q.Id == quadrant.Id));

            var update = Builders<Radar>.Update
                    //.Set(r => r.Quadrants.FirstOrDefault().Name, quadrant.Name)
                    //.Set(r => r.Quadrants.FirstOrDefault().QuadrantNumber, quadrant.QuadrantNumber)
                    //.Set(r => r.Quadrants.FirstOrDefault().Description, quadrant.Description);
                    .Set("quadrants.$.quadrantNumber", quadrant.QuadrantNumber)
                    .Set("quadrants.$.name", quadrant.Name)
                    .Set("quadrants.$.description", quadrant.Description);

            // r => r.Id == id && r.Quadrants.Any(q => q.Id == quadrant.Id),

            var results = await dbContext.Radars.FindOneAndUpdateAsync(filter, update, options);

            return Ok(results);
        }

        // PUT api/radar/5545454/cycle
        [HttpPut("{id}/cycle")]
        public async Task<IActionResult> UpsertCycle(string id, [FromBody]Cycle cycle)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest();
            }
            if (cycle == null)
            {
                return BadRequest();
            }

            var isNew = false;
            if (string.IsNullOrWhiteSpace(cycle.Id))
            {
                isNew = true;
                cycle.Id = ObjectId.GenerateNewId().ToString();
            }

            MongoDBContext dbContext = new MongoDBContext();

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
            } else
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

            var results = await dbContext.Radars.FindOneAndUpdateAsync(filter, update, options);

            return Ok(results);
        }

        // DELETE api/radar/5545454/cycle/CycleId
        // DELETE Cycle api/radar/5
        [HttpDelete("{id}/cycle/{cycleId}")]
        public async Task<IActionResult> Delete(string id, string cycleId)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest();
            }
            if (string.IsNullOrWhiteSpace(cycleId))
            {
                return BadRequest();
            }

            MongoDBContext dbContext = new MongoDBContext();

            var options = new FindOneAndUpdateOptions<Radar>
            {
                ReturnDocument = ReturnDocument.After
            };

            var filterBuilder = Builders<Radar>.Filter;
            var filter = filterBuilder.Eq(r => r.Id, id);

            var update = Builders<Radar>.Update.PullFilter("cycles",
                Builders<Cycle>.Filter.Eq(c => c.Id, cycleId));

            var result = await dbContext.Radars.FindOneAndUpdateAsync(filter, update, options);

            return Ok(result);
        }

        // PUT api/radar/5545454/blip
        [HttpPut("{id}/blip")]
        public async Task<IActionResult> UpsertBlip(string id, [FromBody]Blip blip)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest();
            }
            if (blip == null)
            {
                return BadRequest();
            }

            var isNew = false;
            if (string.IsNullOrWhiteSpace(blip.Id))
            {
                isNew = true;
                blip.Id = ObjectId.GenerateNewId().ToString();
            }

            MongoDBContext dbContext = new MongoDBContext();

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
                    .Set("quadrant", blip.QuadrantId)
                    .Set("cycle", blip.CycleId)
                    .Set("radar", blip.RadarId)
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
                    .Set("quadrant", blip.QuadrantId)
                    .Set("cycle", blip.CycleId)
                    .Set("radar", blip.RadarId)
                    .CurrentDate("lastModified");
            }

            var results = await dbContext.Blips.FindOneAndUpdateAsync(filter, update, options);

            return Ok(results);
        }

        // DELETE api/radar/5
        [HttpDelete("{radarId}/blip/{blipId}")]
        public async Task<IActionResult> DeleteBlip(string radarId, string blipId)
        {
            if (string.IsNullOrWhiteSpace(radarId))
            {
                return BadRequest();
            }

            if (string.IsNullOrWhiteSpace(blipId))
            {
                return BadRequest();
            }

            MongoDBContext dbContext = new MongoDBContext();

            var result = await dbContext.Blips.FindOneAndDeleteAsync(r => r.Id == blipId && r.RadarId == radarId);

            return Ok(result);
        }
    }
}