using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using TechRadar.Services.Models;
using MongoDB.Bson;

namespace TechRadar.Services.Controllers
{
    [Route("api/[controller]")]
    public class CycleController : Controller
    {
        // GET: api/cycle
        [HttpGet]
        public IEnumerable<Cycle> Get()
        {
            MongoDBContext dbContext = new MongoDBContext();

            List<Cycle> collection = dbContext.Cycles.Find(m => true).ToList();

            return collection;
        }

        // GET api/cycle/5
        [HttpGet("{id}")]
        public Cycle Get(string id)
        {
            MongoDBContext dbContext = new MongoDBContext();

            var objectId = ObjectId.Parse(id);
            var filter = Builders<Cycle>.Filter.Eq("id", objectId);

            var collection = dbContext.Cycles.Find(filter).ToList().FirstOrDefault();

            return collection;
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
