using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TechRadar.Services.Models
{
    [BsonIgnoreExtraElements]
    public class Radar
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("radarId")]
        public string RadarId { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }

        [BsonElement("quadrants")]
        public IEnumerable<Quadrant> Quadrants { get; set; }

        [BsonElement("cycles")]
        public IEnumerable<Cycle> Cycles { get; set; }
    }
}
