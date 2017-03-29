using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TechRadar.Services.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Options;

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
        [HttpGet("{code}")]
        public Radar Get(string code)
        {
            MongoDBContext dbContext = new MongoDBContext();

            Radar radar = dbContext.Radars.Find(m => m.Code == code).ToList().FirstOrDefault<Radar>();

            return radar;
        }

        // GET api/radar/code/blips
        [HttpGet("{code}/blips")]
        public IEnumerable<Blip> GetBlips(string code)
        {
            var radar = Get(code);

            if (radar != null)
            {
                MongoDBContext dbContext = new MongoDBContext();

                var blips = dbContext.Blips.Find(m => m.RadarId == radar.Id).ToList();

                return blips.ToList();
            }

            return new List<Blip>();
        }

        // GET api/radar/code/blips/3
        [HttpGet("{code}/blips/{quadrantNumber}")]
        public IEnumerable<Blip> GetBlips(string code, int quadrantNumber)
        {
            var radar = Get(code);
            Quadrant quadrant;

            var filterBuilder = Builders<Blip>.Filter;

            if (radar != null)
            {
                var filter = filterBuilder.Eq(x => x.RadarId, radar.Id);

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
                    .Set("code", radar.Code)
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
                    .Set("code", radar.Code)
                    .Set("description", radar.Description)
                    .CurrentDate("lastModified");
            }

            var test = update.ToJson();

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
            var filter = Builders<Radar>.Filter.Eq(r => r.Id, id);

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

    }
}
