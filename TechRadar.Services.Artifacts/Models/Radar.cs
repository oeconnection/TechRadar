using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TechRadar.Services.Artifacts.Models
{
    [BsonIgnoreExtraElements]
    public class Radar
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("group")]
        public string Group { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }

        [BsonElement("quadrants")]
        public IEnumerable<Quadrant> Quadrants { get; set; }

        [BsonElement("cycles")]
        public IEnumerable<Cycle> Cycles { get; set; }
    }
}
