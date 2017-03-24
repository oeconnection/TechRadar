using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TechRadar.Services.Models;
using Microsoft.AspNetCore.Cors;

namespace TechRadar.Services.Controllers
{
    [Route("api/[controller]")]
    public class RadarController : Controller
    {
        // GET: api/radar
        [HttpGet]
        public async Task<IEnumerable<Radar>> Get()
        {
            MongoDBContext dbContext = new MongoDBContext();
            var filter = new BsonDocument();

            var radarList = await dbContext.Radars.Find(m => true).ToListAsync<Radar>();

            return radarList;
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

            if(radar != null)
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
                    if(quadrant != null)
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

        // PUT api/radar/5545454
        [HttpPut()]
        public async Task<Radar> UpsertRadar([FromBody]Radar radar)
        {
            if(radar == null)
            {
                return null;
            }

            MongoDBContext dbContext = new MongoDBContext();

            var options = new FindOneAndUpdateOptions<Radar>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            FilterDefinition<Radar> filter;
            if (string.IsNullOrWhiteSpace(radar.Id))
            {
                // Add new
                filter = Builders<Radar>.Filter.Eq(r => r.Id, ObjectId.GenerateNewId().ToString());
            }
            else
            {
                filter = Builders<Radar>.Filter.Eq(r => r.Id, radar.Id);
            }
            var update = Builders<Radar>.Update
                .Set("name", radar.Name)
                .Set("code", radar.Code)
                .Set("description", radar.Description)
                .CurrentDate("lastModified");

            return await dbContext.Radars.FindOneAndUpdateAsync(filter, update, options);
        }

        // DELETE api/radar/5
        [HttpDelete("{id}")]
        public void Delete(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return null;
            }

            MongoDBContext dbContext = new MongoDBContext();

        }
    }
}
